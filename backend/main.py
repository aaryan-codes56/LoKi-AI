# backend/main.py: FastAPI entry point. Configures routing, CORS policies, environment variables, and starts the web server.

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load settings from a .env file if it exists in the system environment path
load_dotenv()

# We import routers using absolute module paths. 
# We need to make sure backend folder is in PYTHONPATH, or run uvicorn from workspace root.
from backend.routes.upload import router as upload_router
from backend.routes.chat import router as chat_router
from backend.routes.auth import router as auth_router
from backend.services.db import init_db

# Initialize database schemas (users, threads) in SQLite loki.db
init_db()

app = FastAPI(
    title="LoKi AI Second Brain API",
    description="Backend services for RAG document chunking, embedding, vector retrieval, and LLM processing",
    version="1.0.0"
)

# Set up CORS middleware to allow cross-origin requests from the React frontend running on localhost
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In local development, we allow all origins.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount endpoints from separate routing files
app.include_router(auth_router, tags=["Authentication"])
app.include_router(upload_router, tags=["Upload"])
app.include_router(chat_router, tags=["Chat"])

@app.get("/")
def health_check():
    """
    Simple health check endpoint to verify that the FastAPI backend is operational.
    """
    return {
        "status": "healthy",
        "app": "LoKi",
        "version": "1.0.0"
    }
