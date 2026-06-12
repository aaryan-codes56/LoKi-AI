# backend/routes/upload.py: FastAPI router endpoint for uploading, embedding documents with optional tags, and querying session file registries.

from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from typing import Optional
from backend.services.chunker import extract_text_from_pdf, split_document
from backend.vectorstore.faiss_store import save_vector_store, load_vector_store

router = APIRouter()

@router.get("/files/{thread_id}")
async def get_session_files(thread_id: str):
    """
    Scans the local FAISS vector index docstore and returns the list of unique files, chunk counts, and tags.
    """
    db = load_vector_store(thread_id)
    if db is None:
        return []

    file_info = {}
    # Loop over all chunks stored in docstore to group by filename and collect tags
    for doc in db.docstore._dict.values():
        source = doc.metadata.get("source")
        if source:
            if source not in file_info:
                file_info[source] = {
                    "name": source,
                    "chunks": 0,
                    "tag": doc.metadata.get("tag", ""),
                    "size": "Local Cache"
                }
            file_info[source]["chunks"] += 1

    return list(file_info.values())

@router.post("/upload")
async def upload_file(
    thread_id: str = Query(..., description="The session thread ID to link this document index to"),
    tag: Optional[str] = Query(None, description="Optional tag to categorize this document (e.g. 'Notes', 'Finance')"),
    file: UploadFile = File(...)
):
    """
    Accepts a PDF or TXT file with an optional tag, splits into chunks,
    embeds them with tag metadata, and stores in the FAISS index for the given thread_id.
    """
    filename = file.filename
    if not filename:
        raise HTTPException(status_code=400, detail="Invalid filename")

    file_bytes = await file.read()

    if filename.endswith(".pdf"):
        try:
            text = extract_text_from_pdf(file_bytes)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to parse PDF: {str(e)}")
    elif filename.endswith(".txt"):
        try:
            text = file_bytes.decode("utf-8")
        except UnicodeDecodeError:
            raise HTTPException(status_code=400, detail="TXT file is not valid UTF-8 text")
    else:
        raise HTTPException(status_code=400, detail="Only PDF and TXT files are supported")

    if not text.strip():
        raise HTTPException(status_code=400, detail="The uploaded file has no readable text content")

    # Split into chunks with size 500 and overlap 50
    chunks = split_document(text, filename)

    # Inject the tag into each chunk's metadata if provided
    if tag:
        for chunk in chunks:
            chunk.metadata["tag"] = tag.strip()

    save_vector_store(chunks, thread_id)

    return {
        "status": "success",
        "filename": filename,
        "tag": tag or "",
        "chunks_count": len(chunks),
        "message": f"Successfully ingested '{filename}' ({len(chunks)} chunks) with tag '{tag or 'none'}'."
    }
