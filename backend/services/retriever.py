# backend/services/retriever.py: Retrieves top-k matching document chunks from the local FAISS index based on query similarity.

from typing import List
from langchain_core.documents import Document
from backend.vectorstore.faiss_store import load_vector_store

def retrieve_relevant_chunks(query: str, thread_id: str, k: int = 3) -> List[Document]:
    """
    Queries the local FAISS index for a specific thread_id and retrieves the top k relevant chunks.
    Returns an empty list if the FAISS store does not exist.
    """
    # Load the FAISS vector store database matching this thread_id
    db = load_vector_store(thread_id)
    
    if db is None:
        # Return an empty list if there are no ingested documents for this thread
        return []
    
    # Run similarity search to find the top k most relevant documents based on cosine/L2 distance
    docs = db.similarity_search(query, k=k)
    return docs
