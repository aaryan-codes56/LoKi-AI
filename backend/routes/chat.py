# backend/routes/chat.py: FastAPI router for chat queries, history recovery, semantic search, thread management, and session clearing.

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from backend.services.retriever import retrieve_relevant_chunks
from backend.services.llm import call_llm
from backend.memory.session import (
    get_session_memory,
    clear_session_memory,
    load_history_from_disk,
    save_history_to_disk
)
from backend.vectorstore.faiss_store import delete_vector_store, load_vector_store
from backend.services.db import (
    create_thread, get_threads_by_user, delete_thread_db
)
from backend.routes.auth import get_current_user

router = APIRouter()

# ─── Pydantic Models ─────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    question: str
    thread_id: str
    tag_filter: Optional[str] = None  # Optional tag filter for retrieval

class SourceCitation(BaseModel):
    source: str
    content: str
    chunk_index: int
    tag: Optional[str] = ""

class ChatResponse(BaseModel):
    answer: str
    sources: List[SourceCitation]

class SearchRequest(BaseModel):
    query: str
    thread_id: str
    tag_filter: Optional[str] = None
    k: Optional[int] = 5

class CreateThreadRequest(BaseModel):
    thread_id: str
    title: str

# ─── History ─────────────────────────────────────────────────────────────────

@router.get("/history/{thread_id}")
async def get_chat_history(thread_id: str):
    """
    Fetches persisted chat logs for the session from local disk.
    """
    return load_history_from_disk(thread_id)

# ─── Thread Management ────────────────────────────────────────────────────────

@router.get("/threads")
async def list_threads(user_id: int = Depends(get_current_user)):
    """
    Returns the list of all thread sessions belonging to the authenticated user.
    """
    rows = get_threads_by_user(user_id)
    return [dict(row) for row in rows]

@router.post("/threads")
async def save_thread(req: CreateThreadRequest, user_id: int = Depends(get_current_user)):
    """
    Saves a new named thread record for the authenticated user in SQLite.
    """
    created = create_thread(req.thread_id, user_id, req.title)
    if not created:
        raise HTTPException(status_code=400, detail="Thread with this ID already exists")
    return {"status": "success", "thread_id": req.thread_id, "title": req.title}

# ─── Semantic Search ─────────────────────────────────────────────────────────

@router.post("/search")
async def semantic_search(req: SearchRequest):
    """
    Performs standalone similarity search against the FAISS index for the thread,
    returning matching chunks without calling the LLM. Supports tag filtering.
    """
    # Retrieve top-k chunks by cosine similarity
    docs = retrieve_relevant_chunks(req.query, req.thread_id, k=req.k)

    # Apply optional tag filter on returned metadata
    if req.tag_filter:
        docs = [d for d in docs if d.metadata.get("tag", "").lower() == req.tag_filter.lower()]

    return [
        {
            "source": doc.metadata.get("source", "Unknown"),
            "content": doc.page_content,
            "chunk_index": doc.metadata.get("chunk_index", 0),
            "tag": doc.metadata.get("tag", "")
        }
        for doc in docs
    ]

# ─── Chat ────────────────────────────────────────────────────────────────────

@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Accepts user question and thread_id, retrieves top 3 relevant chunks with optional
    tag filter, combines chunks with chat history, calls LLM, saves to disk, returns answer + citations.
    """
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    thread_id = request.thread_id

    # 1. Retrieve top 3 relevant chunks from FAISS
    retrieved_docs = retrieve_relevant_chunks(request.question, thread_id, k=3)

    # Apply optional tag filter so only tagged-document chunks are included in context
    if request.tag_filter:
        retrieved_docs = [
            d for d in retrieved_docs
            if d.metadata.get("tag", "").lower() == request.tag_filter.lower()
        ]

    # Build citations list
    sources = [
        SourceCitation(
            source=doc.metadata.get("source", "Unknown"),
            content=doc.page_content,
            chunk_index=doc.metadata.get("chunk_index", 0),
            tag=doc.metadata.get("tag", "")
        )
        for doc in retrieved_docs
    ]

    # 2. Load session memory from disk and format prior history string
    memory = get_session_memory(thread_id)
    history_variables = memory.load_memory_variables({})
    chat_history_str = history_variables.get("chat_history", "")

    # 3. Combine document context + conversation history for the LLM prompt
    document_context = "\n\n".join([doc.page_content for doc in retrieved_docs])
    full_context_blocks = []
    if document_context:
        full_context_blocks.append(document_context)
    if chat_history_str:
        full_context_blocks.append(f"Conversation history so far:\n{chat_history_str}")
    full_context = "\n\n".join(full_context_blocks)

    # 4. Invoke LLM
    try:
        answer = call_llm(context=full_context, question=request.question)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM generation failed: {str(e)}")

    # 5. Persist this turn to the disk log
    current_time = datetime.now().strftime("%I:%M %p")
    messages_list = load_history_from_disk(thread_id)
    messages_list.append({"sender": "user", "text": request.question, "timestamp": current_time, "sources": []})
    messages_list.append({"sender": "bot", "text": answer, "timestamp": current_time, "sources": [src.dict() for src in sources]})
    save_history_to_disk(thread_id, messages_list)

    return ChatResponse(answer=answer, sources=sources)

# ─── Clear Session ────────────────────────────────────────────────────────────

@router.delete("/clear/{thread_id}")
async def clear_chat_history(thread_id: str):
    """
    Clears the conversational memory and deletes the FAISS vector database for the thread.
    """
    clear_session_memory(thread_id)
    delete_vector_store(thread_id)
    delete_thread_db(thread_id)
    return {"status": "success", "message": f"Cleared all data for thread '{thread_id}'."}
