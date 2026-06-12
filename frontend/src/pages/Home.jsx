// frontend/src/pages/Home.jsx: Full Phase 3 dashboard with auth, thread sidebar, tab navigation, tag filtering, and session recovery.

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import FileUpload from '../components/FileUpload';
import ChatWindow from '../components/ChatWindow';
import SemanticSearch from '../components/SemanticSearch';
import AuthModal from '../components/AuthModal';
import {
  sendMessage, clearHistory, fetchHistory, fetchFiles,
  fetchThreads, createThread
} from '../api/client';
import {
  Brain, HelpCircle, AlertTriangle, MessageSquare, Search,
  Plus, History, LogOut, User, ChevronRight, Tag
} from 'lucide-react';

const generateThreadId = () => 'loki_thread_' + Math.random().toString(36).substring(2, 11);

const TAGS = ['', 'Notes', 'Finance', 'Research', 'Work', 'Personal'];

export default function Home() {
  // ─── Auth state ──────────────────────────────────────────────────────────────
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);

  // ─── Thread & workspace state ─────────────────────────────────────────────────
  const [threadId, setThreadId] = useState('');
  const [threads, setThreads] = useState([]);
  const [messages, setMessages] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [activeTag, setActiveTag] = useState('');
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'search'

  // ─── UI state ─────────────────────────────────────────────────────────────────
  const [isThinking, setIsThinking] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [errorBanner, setErrorBanner] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);

  // ─── On mount: restore auth + session ────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('loki_auth_token');
    const storedUser = localStorage.getItem('loki_username');
    if (token && storedUser) {
      setIsAuthenticated(true);
      setUsername(storedUser);
    }

    const storedThreadId = localStorage.getItem('loki_thread_id');
    if (storedThreadId) {
      setThreadId(storedThreadId);
      loadSessionData(storedThreadId);
    } else {
      const newId = generateThreadId();
      localStorage.setItem('loki_thread_id', newId);
      setThreadId(newId);
    }
  }, []);

  // Fetch threads from backend when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchThreads().then(setThreads).catch(() => {});
    }
  }, [isAuthenticated]);

  const loadSessionData = async (tid) => {
    if (!tid) return;
    setErrorBanner('');
    try {
      const [historyData, filesData] = await Promise.all([fetchHistory(tid), fetchFiles(tid)]);
      setMessages(historyData);
      setUploadedFiles(filesData);
    } catch (err) {
      setErrorBanner('Backend server offline. Please ensure FastAPI is running on port 8000.');
    }
  };

  const handleUploadSuccess = async () => {
    setErrorBanner('');
    try {
      const filesData = await fetchFiles(threadId);
      setUploadedFiles(filesData);
    } catch (err) {
      setErrorBanner('Failed to refresh document list.');
    }
  };

  const handleSendMessage = async (text) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setErrorBanner('');
    setMessages(prev => [...prev, { sender: 'user', text, timestamp, sources: [] }]);
    setIsThinking(true);
    try {
      const data = await sendMessage(threadId, text, activeTag || null);
      setMessages(prev => [...prev, {
        sender: 'bot', text: data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: data.sources
      }]);
    } catch (err) {
      setErrorBanner('API request failed. Verify your OPENAI_API_KEY in backend/.env.');
      setMessages(prev => [...prev, {
        sender: 'bot',
        text: 'An error occurred. Check your API key and ensure the backend is running.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: []
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Clear this session's documents and history?")) return;
    setIsClearing(true);
    try {
      await clearHistory(threadId);
      setMessages([]);
      setUploadedFiles([]);
      const newId = generateThreadId();
      localStorage.setItem('loki_thread_id', newId);
      setThreadId(newId);
    } catch (err) {
      setErrorBanner("Failed to clear session. Server might be offline.");
    } finally {
      setIsClearing(false);
    }
  };

  // Switch to an existing thread — loads its history and files
  const handleSwitchThread = async (tid) => {
    localStorage.setItem('loki_thread_id', tid);
    setThreadId(tid);
    setMessages([]);
    setUploadedFiles([]);
    setShowSidebar(false);
    await loadSessionData(tid);
  };

  // Create a new thread and optionally save to DB if authenticated
  const handleNewThread = async () => {
    const newId = generateThreadId();
    const title = `Thread ${new Date().toLocaleString()}`;
    localStorage.setItem('loki_thread_id', newId);
    setThreadId(newId);
    setMessages([]);
    setUploadedFiles([]);
    if (isAuthenticated) {
      try {
        await createThread(newId, title);
        setThreads(prev => [{ id: newId, title, created_at: new Date().toISOString() }, ...prev]);
      } catch {}
    }
  };

  const handleAuthSuccess = (data) => {
    setIsAuthenticated(true);
    setUsername(data.username);
    setShowAuthModal(false);
    fetchThreads().then(setThreads).catch(() => {});
  };

  const handleLogout = () => {
    localStorage.removeItem('loki_auth_token');
    localStorage.removeItem('loki_username');
    localStorage.removeItem('loki_user_id');
    setIsAuthenticated(false);
    setUsername('');
    setThreads([]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal onAuthSuccess={handleAuthSuccess} onClose={() => setShowAuthModal(false)} />
      )}

      {/* Thread Sidebar */}
      {showSidebar && isAuthenticated && (
        <div className="fixed inset-0 z-40 flex">
          <div className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-full shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h2 className="font-bold text-slate-100 flex items-center space-x-2">
                <History size={16} className="text-indigo-400" />
                <span>Past Threads</span>
              </h2>
              <button onClick={() => setShowSidebar(false)} className="text-slate-400 hover:text-slate-200 transition-colors">
                <ChevronRight size={20} />
              </button>
            </div>
            <button
              onClick={handleNewThread}
              className="m-3 flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-600/30 text-indigo-400 text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              <span>New Thread</span>
            </button>
            <div className="flex-1 overflow-y-auto px-3 space-y-1 custom-scrollbar">
              {threads.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleSwitchThread(t.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    t.id === threadId
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-600/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                  }`}
                >
                  <p className="font-medium truncate">{t.title}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 font-mono">{t.id.slice(0, 24)}...</p>
                </button>
              ))}
              {threads.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-6">No saved threads yet.</p>
              )}
            </div>
          </div>
          <div className="flex-1 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowSidebar(false)} />
        </div>
      )}

      {/* Header */}
      <Header threadId={threadId} onClear={handleClearHistory} isClearing={isClearing} />

      {/* Auth + Thread control bar */}
      <div className="border-b border-slate-800/60 bg-slate-950/50 backdrop-blur-md px-6 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {isAuthenticated && (
            <button
              onClick={() => setShowSidebar(true)}
              className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-indigo-400 transition-colors"
            >
              <History size={14} />
              <span>Threads</span>
            </button>
          )}
          <button
            onClick={handleNewThread}
            className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <Plus size={14} />
            <span>New Thread</span>
          </button>
        </div>

        {isAuthenticated ? (
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 text-xs text-slate-400">
              <User size={13} className="text-indigo-400" />
              <span className="text-slate-300">{username}</span>
            </div>
            <button onClick={handleLogout} className="flex items-center space-x-1 text-xs text-rose-400 hover:text-rose-300 transition-colors">
              <LogOut size={13} />
              <span>Logout</span>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            Sign in to save threads →
          </button>
        )}
      </div>

      {/* Error Banner */}
      {errorBanner && (
        <div className="bg-rose-950/40 border-b border-rose-900/50 text-rose-300 px-6 py-2.5 flex items-center justify-between text-xs font-medium">
          <div className="flex items-center space-x-2">
            <AlertTriangle size={14} className="text-rose-400 animate-pulse" />
            <span>{errorBanner}</span>
          </div>
          <button onClick={() => setErrorBanner('')} className="text-rose-400 hover:text-rose-200 transition-colors px-2 py-0.5 rounded bg-rose-950/50 border border-rose-900/30">
            Dismiss
          </button>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 overflow-hidden">
        {/* Sidebar */}
        <section className="md:col-span-4 flex flex-col space-y-4">
          {/* Tab switcher */}
          <div className="backdrop-blur-md bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="flex border-b border-slate-800">
              {[['upload', 'Documents', Brain], ['search', 'Semantic Search', Search]].map(([id, label, Icon]) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 text-xs font-semibold transition-colors ${
                    activeTab === id
                      ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon size={14} />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            <div className="p-5">
              {activeTab === 'upload' ? (
                <FileUpload
                  threadId={threadId}
                  onUploadSuccess={handleUploadSuccess}
                  uploadedFiles={uploadedFiles}
                />
              ) : (
                <SemanticSearch threadId={threadId} />
              )}
            </div>
          </div>

          {/* Tag filter selector */}
          <div className="backdrop-blur-md bg-slate-900/30 border border-slate-800 rounded-2xl p-4 shadow-sm">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
              <Tag size={12} className="text-violet-400" />
              <span>Filter Chat by Tag</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 font-medium ${
                    activeTag === tag
                      ? 'bg-violet-600/30 text-violet-300 border-violet-600/50'
                      : 'bg-transparent text-slate-400 border-slate-800 hover:border-slate-600 hover:text-slate-300'
                  }`}
                >
                  {tag || 'All Tags'}
                </button>
              ))}
            </div>
          </div>

          {/* How it works */}
          <div className="bg-slate-900/20 border border-slate-800/80 rounded-2xl p-5 text-slate-400 text-xs leading-relaxed space-y-2">
            <h3 className="font-semibold text-slate-300 flex items-center space-x-1.5">
              <HelpCircle size={14} />
              <span>How LoKi works</span>
            </h3>
            <p>1. Upload multiple PDFs/TXTs with optional tags to organize your knowledge.</p>
            <p>2. Chunks are embedded and stored locally in FAISS for instant retrieval.</p>
            <p>3. Semantic Search finds matching snippets without calling the LLM.</p>
            <p>4. Tag filters narrow RAG retrieval to specific document categories.</p>
            <p>5. Sign in to persist and switch between multiple knowledge sessions.</p>
          </div>
        </section>

        {/* Chat */}
        <section className="md:col-span-8 h-[calc(100vh-200px)] min-h-[500px]">
          {activeTag && (
            <div className="mb-3 px-4 py-2 rounded-xl bg-violet-950/20 border border-violet-900/40 text-xs text-violet-300 flex items-center space-x-2">
              <Tag size={12} />
              <span>Filtering context by tag: <strong>{activeTag}</strong> — only chunks with this tag will be used.</span>
              <button onClick={() => setActiveTag('')} className="ml-auto text-violet-400 hover:text-violet-200 transition-colors">Clear</button>
            </div>
          )}
          <ChatWindow
            messages={messages}
            onSendMessage={handleSendMessage}
            isThinking={isThinking}
          />
        </section>
      </main>
    </div>
  );
}
