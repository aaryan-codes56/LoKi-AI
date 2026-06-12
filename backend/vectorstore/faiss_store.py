# backend/vectorstore/faiss_store.py: Low-level operations to load, save, and update the local FAISS vector store index.

import os
from langchain_community.vectorstores import FAISS
from backend.services.embedder import get_embeddings_model

# Define the root directory where vector stores for different threads will be persisted.
VECTOR_STORE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "vectorstore_data")

def get_store_path(thread_id: str) -> str:
    """
    Returns the directory path where the FAISS index for a specific thread_id is stored.
    """
    return os.path.join(VECTOR_STORE_DIR, f"db_{thread_id}")

def save_vector_store(documents, thread_id: str) -> FAISS:
    """
    Creates a new FAISS vector store from the given documents or updates/merges with an existing one.
    """
    embeddings = get_embeddings_model()
    store_path = get_store_path(thread_id)
    
    # If a store already exists for this thread, load it and merge the new documents
    if os.path.exists(os.path.join(store_path, "index.faiss")):
        # Load the existing local FAISS database. allow_dangerous_deserialization is required for pickle-based loading.
        existing_db = FAISS.load_local(store_path, embeddings, allow_dangerous_deserialization=True)
        # Create a temporary FAISS database for the new documents
        new_db = FAISS.from_documents(documents, embeddings)
        # Merge the new database into the existing database
        existing_db.merge_from(new_db)
        # Save the updated database back to the same path
        existing_db.save_local(store_path)
        return existing_db
    else:
        # Create a new FAISS database from scratch for the documents
        db = FAISS.from_documents(documents, embeddings)
        # Save the new database locally
        db.save_local(store_path)
        return db

def load_vector_store(thread_id: str) -> FAISS:
    """
    Loads the existing FAISS vector store for a specific thread_id. Returns None if it doesn't exist.
    """
    embeddings = get_embeddings_model()
    store_path = get_store_path(thread_id)
    
    if os.path.exists(os.path.join(store_path, "index.faiss")):
        # Load the existing FAISS database from local disk. allow_dangerous_deserialization is required.
        db = FAISS.load_local(store_path, embeddings, allow_dangerous_deserialization=True)
        return db
    return None

def delete_vector_store(thread_id: str) -> bool:
    """
    Deletes the local FAISS files for a specific thread_id.
    """
    store_path = get_store_path(thread_id)
    if os.path.exists(store_path):
        # Remove FAISS index files if they exist
        for filename in ["index.faiss", "index.pkl"]:
            file_path = os.path.join(store_path, filename)
            if os.path.exists(file_path):
                os.remove(file_path)
        try:
            os.rmdir(store_path)
        except OSError:
            pass
        return True
    return False
