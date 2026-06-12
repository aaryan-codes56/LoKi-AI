# backend/services/db.py: Handles database connection, tables schema creation (users and threads), and user/session registry CRUD operations.

import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "loki.db")

def get_db_connection():
    """
    Establishes and returns a connection to the local SQLite database loki.db.
    """
    # Create connection. It auto-creates the loki.db file if it does not exist.
    conn = sqlite3.connect(DB_PATH)
    # Enable dict-like rows returning for cleaner record consumption
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """
    Initializes the database schemas if they do not exist.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Create the users registry table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL
    )
    """)
    
    # 2. Create the chat threads registry table linked to the user
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS threads (
        id TEXT PRIMARY KEY,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    )
    """)
    
    conn.commit()
    conn.close()

def create_user(username: str, password_hash: str) -> int:
    """
    Inserts a new user record. Returns the new user ID.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO users (username, password_hash) VALUES (?, ?)",
            (username.strip(), password_hash)
        )
        conn.commit()
        user_id = cursor.lastrowid
        return user_id
    except sqlite3.IntegrityError:
        return -1
    finally:
        conn.close()

def get_user_by_username(username: str):
    """
    Queries and returns user record by their username.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE username = ?", (username.strip(),))
    row = cursor.fetchone()
    conn.close()
    return row

def create_thread(thread_id: str, user_id: int, title: str) -> bool:
    """
    Saves a new conversation thread record.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO threads (id, user_id, title) VALUES (?, ?, ?)",
            (thread_id, user_id, title.strip())
        )
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()

def get_threads_by_user(user_id: int):
    """
    Fetches all threads registered for a specific user.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM threads WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
    rows = cursor.fetchall()
    conn.close()
    return rows

def get_thread_owner(thread_id: str) -> int:
    """
    Retrieves the owner user ID of the specified thread.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT user_id FROM threads WHERE id = ?", (thread_id,))
    row = cursor.fetchone()
    conn.close()
    if row:
        return row["user_id"]
    return -1

def delete_thread_db(thread_id: str) -> bool:
    """
    Deletes the thread entry in the database.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM threads WHERE id = ?", (thread_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted
