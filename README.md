# LoKi — AI Second Brain 🧠

> Your personal Retrieval-Augmented Generation (RAG) knowledge assistant. Upload your documents, ask questions, and get answers grounded strictly in your own content — no hallucination, no guessing.

![LoKi Banner](https://img.shields.io/badge/Built%20with-React%20%2B%20FastAPI-6366f1?style=for-the-badge&logo=react)
![RAG](https://img.shields.io/badge/Technique-RAG%20%2B%20FAISS-8b5cf6?style=for-the-badge)
![LLM](https://img.shields.io/badge/LLM-GPT--3.5--turbo-10b981?style=for-the-badge&logo=openai)

---

## What is LoKi?

LoKi is a full-stack AI-powered personal knowledge assistant built on the **Retrieval-Augmented Generation (RAG)** pattern.

Normal AI assistants guess from internet training data. LoKi is different:

1. You upload **your own files** (PDFs or text documents)
2. The system reads, understands, and indexes them using **OpenAI embeddings**
3. When you ask a question, the **top 3 most relevant chunks** from your documents are retrieved
4. These chunks are sent to **GPT-3.5-turbo** as context — it answers based *only* on your content
5. You get a **grounded, cited answer** with source references

This technique is used in production by Notion AI, Microsoft Copilot, and Google Workspace.

---

## ✨ Features

### Phase 1 — MVP
- 📄 PDF and TXT file upload with real-time ingestion progress
- 🔍 RAG pipeline: chunk → embed → retrieve → generate
- 💬 Chat interface with source citations for every answer
- 🗑️ Clear session history button

### Phase 2 — Intermediate
- 📦 Multiple PDFs simultaneously in the same knowledge session
- 🔁 Full session persistence — refresh the browser and restore everything
- 💾 Chat logs and citations saved to disk per session (`history.json`)
- ⚠️ Error boundary banners for API failures and server outages
- 🧵 Thread IDs stored in `localStorage` for seamless state recovery

### Phase 3 — Advanced
- 🔐 JWT User Authentication (Sign Up / Sign In) with bcrypt password hashing
- 🗂️ Thread sidebar — save and reload past knowledge sessions by name
- 🏷️ Document tagging — upload with categories (Notes, Finance, Research…)
- 🔎 Semantic Search tab — raw vector similarity search without calling the LLM
- 🎯 Tag-based retrieval filtering — narrow LLM context to specific categories

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 + Vite 8 + Tailwind CSS v4 |
| **Backend** | FastAPI + Python 3.12 |
| **LLM** | OpenAI GPT-3.5-turbo via LangChain |
| **Embeddings** | OpenAI `text-embedding-ada-002` |
| **Vector DB** | FAISS (local, file-based) |
| **Auth** | JWT (`pyjwt`) + bcrypt hashing |
| **Database** | SQLite (users + threads registry) |
| **Memory** | LangChain `ConversationBufferMemory` |

---

## 📂 Project Structure

```
LoKi/
├── backend/
│   ├── main.py                 # FastAPI app entry point + DB init
│   ├── .env                    # Environment variables (OPENAI_API_KEY)
│   ├── loki.db                 # Auto-created SQLite database
│   ├── vectorstore_data/       # Auto-created local FAISS indices per thread
│   ├── routes/
│   │   ├── upload.py           # POST /upload, GET /files/{thread_id}
│   │   ├── chat.py             # POST /chat, GET /history, /search, /threads
│   │   └── auth.py             # POST /auth/signup, /auth/login
│   ├── services/
│   │   ├── chunker.py          # Text/PDF splitter (500 char, 50 overlap)
│   │   ├── embedder.py         # OpenAI text-embedding-ada-002 wrapper
│   │   ├── retriever.py        # FAISS similarity search (top-k)
│   │   ├── llm.py              # GPT-3.5-turbo prompt builder + caller
│   │   └── db.py               # SQLite CRUD for users and threads
│   ├── memory/
│   │   └── session.py          # Disk-persisted ConversationBufferMemory
│   ├── vectorstore/
│   │   └── faiss_store.py      # FAISS index load/save/merge/delete
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthModal.jsx       # Login/Signup modal overlay
│   │   │   ├── ChatWindow.jsx      # Conversation bubble log + input bar
│   │   │   ├── FileUpload.jsx      # Drag-and-drop document ingestion panel
│   │   │   ├── Header.jsx          # Nav header with thread ID + clear button
│   │   │   ├── SemanticSearch.jsx  # Raw vector search without LLM
│   │   │   └── SourceCard.jsx      # Expandable citation card
│   │   ├── pages/
│   │   │   └── Home.jsx            # Full dashboard layout and state manager
│   │   ├── api/
│   │   │   └── client.js           # Axios calls for all backend endpoints
│   │   ├── App.jsx
│   │   └── index.css               # Tailwind base + custom scrollbars + fonts
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js ≥ 18
- Python 3.12 (managed via `uv`)
- An [OpenAI API Key](https://platform.openai.com/api-keys)

### 1. Clone the repository
```bash
git clone https://github.com/aaryan-codes56/LoKi-AI.git
cd LoKi-AI
```

### 2. Backend Setup
```bash
cd backend

# Install uv if not already installed
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.local/bin/env

# Create virtual environment and install dependencies
uv venv --python 3.12 venv
source venv/bin/activate
uv pip install -r requirements.txt

# Add your OpenAI key
echo "OPENAI_API_KEY=sk-your-key-here" > .env

# Start the backend (run from the project root)
cd ..
PYTHONPATH=. ./backend/venv/bin/python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🔗 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `POST` | `/auth/signup` | Register new user |
| `POST` | `/auth/login` | Login and receive JWT |
| `POST` | `/upload` | Ingest document into FAISS |
| `GET` | `/files/{thread_id}` | List embedded documents |
| `POST` | `/chat` | RAG chat with citations |
| `GET` | `/history/{thread_id}` | Retrieve session chat log |
| `POST` | `/search` | Semantic search (no LLM) |
| `GET` | `/threads` | List user threads (auth required) |
| `POST` | `/threads` | Save new thread (auth required) |
| `DELETE` | `/clear/{thread_id}` | Delete session data |

---

## 🧠 RAG Prompt Template

```
You are a helpful assistant. Answer the question based ONLY 
on the following context. If the answer is not in the context, 
say "I don't know based on your documents."

Context: {context}
Question: {question}
Answer:
```

---

## 📄 License

MIT — built as an original portfolio project demonstrating production-grade RAG architecture.
