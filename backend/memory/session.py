# backend/memory/session.py: Manages per-session conversational memory buffers on disk using LangChain's ConversationBufferMemory.

import os
import json
from langchain.memory import ConversationBufferMemory
from backend.vectorstore.faiss_store import get_store_path

def get_history_file_path(thread_id: str) -> str:
    """
    Returns the file path for the session history JSON.
    """
    return os.path.join(get_store_path(thread_id), "history.json")

def save_history_to_disk(thread_id: str, messages_list: list):
    """
    Saves the list of frontend messages (with keys: sender, text, timestamp, sources) to disk.
    """
    store_dir = get_store_path(thread_id)
    # Ensure the parent vector store directory exists
    os.makedirs(store_dir, exist_ok=True)
    
    file_path = get_history_file_path(thread_id)
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(messages_list, f, indent=2, ensure_ascii=False)

def load_history_from_disk(thread_id: str) -> list:
    """
    Loads the list of frontend messages from history.json. Returns an empty list if not found.
    """
    file_path = get_history_file_path(thread_id)
    if os.path.exists(file_path):
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"Error reading history.json for thread '{thread_id}': {e}")
    return []

def get_session_memory(thread_id: str) -> ConversationBufferMemory:
    """
    Reconstructs a ConversationBufferMemory instance from the logs persisted on disk.
    """
    memory = ConversationBufferMemory(
        memory_key="chat_history",
        return_messages=False
    )
    
    messages_list = load_history_from_disk(thread_id)
    for msg in messages_list:
        sender = msg.get("sender")
        text = msg.get("text", "")
        # Sync each text turn into the LangChain memory object
        if sender == "user":
            memory.chat_memory.add_user_message(text)
        elif sender == "bot":
            memory.chat_memory.add_ai_message(text)
            
    return memory

def clear_session_memory(thread_id: str):
    """
    Deletes the local history file for the thread.
    """
    file_path = get_history_file_path(thread_id)
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
        except OSError:
            pass
