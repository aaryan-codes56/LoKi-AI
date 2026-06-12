// frontend/src/pages/Dashboard.jsx: Main workspace dashboard with sidebar, chat, upload, search, and auth-aware header.

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header';
import FileUpload from '../components/FileUpload';
import ChatWindow from '../components/ChatWindow';
import SemanticSearch from '../components/SemanticSearch';
import {
  sendMessage, clearHistory, fetchHistory, fetchFiles,
  fetchThreads, createThread
} from '../api/client';
import {
  Brain, HelpCircle, AlertTriangle, Search, Plus, History,
  LogOut, User, ChevronRight, Tag, Sparkles
} from 'lucide-react';

const generateThreadId = () => 'loki_thread_' + Math.random().toString(36).substring(2, 11);
const TAGS = ['', 'Notes', 'Finance', 'Research', 'Work', 'Personal'];

export default function Dashboard() {
  const navigate = useNavigate();

  // ─── Auth ───────────────────────────────────────────────────────────────────
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');

  // ─── Thread & workspace ─────────────────────────────────────────────────────
  const [threadId, setThreadId] = useState('');
  const [threads, setThreads] = useState([]);
  const [messages, setMessages] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [activeTag, setActiveTag] = useState('');
  const [activeTab, setActiveTab] = useState('upload');

  // ─── UI ─────────────────────────────────────────────────────────────────────
  const [isThinking, setIsThinking] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [errorBanner, setErrorBanner] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);

  // ─── Init ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('loki_auth_token');
    const storedUser = localStorage.getItem('loki_username');
    if (token && storedUser) {
      setIsAuthenticated(true);
      setUsername(storedUser);
    }
    const storedTid = localStorage.getItem('loki_thread_id');
    if (storedTid) {
      setThreadId(storedTid);
      loadSessionData(storedTid);
    } else {
      const id = generateThreadId();
      localStorage.setItem('loki_thread_id', id);
      setThreadId(id);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchThreads().then(setThreads).catch(() => {});
  }, [isAuthenticated]);

  const loadSessionData = async (tid) => {
    setErrorBanner('');
    try {
      const [h, f] = await Promise.all([fetchHistory(tid), fetchFiles(tid)]);
      setMessages(h);
      setUploadedFiles(f);
    } catch {
      setErrorBanner('Backend offline. Ensure FastAPI is running on port 8000.');
    }
  };

  const handleUploadSuccess = async () => {
    try { setUploadedFiles(await fetchFiles(threadId)); } catch {}
  };

  const handleSend = async (text) => {
    const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setErrorBanner('');
    setMessages(prev => [...prev, { sender: 'user', text, timestamp: ts, sources: [] }]);
    setIsThinking(true);
    try {
      const data = await sendMessage(threadId, text, activeTag || null);
      setMessages(prev => [...prev, {
        sender: 'bot', text: data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: data.sources
      }]);
    } catch {
      setErrorBanner('API request failed. Check OPENAI_API_KEY.');
      setMessages(prev => [...prev, { sender: 'bot', text: 'Error — check your API key and server.', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), sources: [] }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm("Clear this session's documents and history?")) return;
    setIsClearing(true);
    try {
      await clearHistory(threadId);
      setMessages([]);
      setUploadedFiles([]);
      const id = generateThreadId();
      localStorage.setItem('loki_thread_id', id);
      setThreadId(id);
    } catch { setErrorBanner('Failed to clear.'); } finally { setIsClearing(false); }
  };

  const switchThread = async (tid) => {
    localStorage.setItem('loki_thread_id', tid);
    setThreadId(tid);
    setMessages([]);
    setUploadedFiles([]);
    setShowSidebar(false);
    await loadSessionData(tid);
  };

  const newThread = async () => {
    const id = generateThreadId();
    const title = `Session ${new Date().toLocaleString()}`;
    localStorage.setItem('loki_thread_id', id);
    setThreadId(id);
    setMessages([]);
    setUploadedFiles([]);
    if (isAuthenticated) {
      try { await createThread(id, title); setThreads(prev => [{ id, title, created_at: new Date().toISOString() }, ...prev]); } catch {}
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('loki_auth_token');
    localStorage.removeItem('loki_username');
    localStorage.removeItem('loki_user_id');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/20 text-slate-800 flex flex-col font-['Inter',sans-serif]">
      {/* Thread sidebar overlay */}
      {showSidebar && isAuthenticated && (
        <div className="fixed inset-0 z-40 flex">
          <div className="w-72 bg-white border-r border-slate-200 flex flex-col h-full shadow-2xl animate-fade-in">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-700 flex items-center space-x-2 text-sm">
                <History size={15} className="text-indigo-500" />
                <span>Past Threads</span>
              </h2>
              <button onClick={() => setShowSidebar(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>
            <button onClick={newThread} className="m-3 flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-600 text-xs font-bold transition-colors">
              <Plus size={14} /> <span>New Thread</span>
            </button>
            <div className="flex-1 overflow-y-auto px-3 space-y-1 custom-scrollbar">
              {threads.map(t => (
                <button
                  key={t.id} onClick={() => switchThread(t.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs transition-all ${
                    t.id === threadId
                      ? 'bg-indigo-50 text-indigo-600 border border-indigo-100 font-bold'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                >
                  <p className="font-semibold truncate">{t.title}</p>
                  <p className="text-[9px] text-slate-400 mt-0.5 font-mono">{t.id.slice(0, 20)}...</p>
                </button>
              ))}
              {threads.length === 0 && <p className="text-[11px] text-slate-400 text-center py-6">No saved threads yet.</p>}
            </div>
          </div>
          <div className="flex-1 bg-slate-950/20 backdrop-blur-sm" onClick={() => setShowSidebar(false)} />
        </div>
      )}

      {/* Header */}
      <Header threadId={threadId} onClear={handleClear} isClearing={isClearing} />

      {/* Sub-nav */}
      <div className="border-b border-slate-100 bg-white/50 backdrop-blur-md px-4 sm:px-6 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {isAuthenticated && (
            <button onClick={() => setShowSidebar(true)} className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-indigo-500 font-semibold transition-colors">
              <History size={13} /> <span className="hidden sm:inline">Threads</span>
            </button>
          )}
          <button onClick={newThread} className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-emerald-500 font-semibold transition-colors">
            <Plus size={13} /> <span className="hidden sm:inline">New Thread</span>
          </button>
        </div>
        {isAuthenticated ? (
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5 text-xs text-slate-400">
              <User size={12} className="text-indigo-500" />
              <span className="text-slate-600 font-semibold">{username}</span>
            </div>
            <button onClick={handleLogout} className="flex items-center space-x-1 text-xs text-red-400 hover:text-red-500 font-semibold transition-colors">
              <LogOut size={12} /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <Link to="/login" className="text-xs text-indigo-500 hover:text-indigo-600 font-bold transition-colors">
            Sign in to save threads →
          </Link>
        )}
      </div>

      {/* Error */}
      {errorBanner && (
        <div className="bg-red-50 border-b border-red-100 text-red-600 px-4 sm:px-6 py-2 flex items-center justify-between text-xs font-medium animate-fade-in">
          <div className="flex items-center space-x-2">
            <AlertTriangle size={13} className="text-red-500 animate-pulse" />
            <span>{errorBanner}</span>
          </div>
          <button onClick={() => setErrorBanner('')} className="text-red-400 hover:text-red-600 px-2 py-0.5 rounded-lg bg-red-100/50 border border-red-200/50 transition-colors">Dismiss</button>
        </div>
      )}

      {/* Main layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 overflow-hidden">
        {/* Left sidebar */}
        <section className="lg:col-span-4 flex flex-col space-y-4">
          {/* Tabs */}
          <div className="glass-card-strong rounded-2xl overflow-hidden shadow-lg">
            <div className="flex border-b border-slate-100">
              {[['upload', 'Documents', Brain], ['search', 'Search', Search]].map(([id, label, Icon]) => (
                <button
                  key={id} onClick={() => setActiveTab(id)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 text-xs font-bold transition-all ${
                    activeTab === id
                      ? 'text-indigo-600 border-b-2 border-indigo-500 bg-indigo-50/30'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Icon size={14} /> <span>{label}</span>
                </button>
              ))}
            </div>
            <div className="p-5">
              {activeTab === 'upload'
                ? <FileUpload threadId={threadId} onUploadSuccess={handleUploadSuccess} uploadedFiles={uploadedFiles} />
                : <SemanticSearch threadId={threadId} />
              }
            </div>
          </div>

          {/* Tag filter */}
          <div className="glass-card rounded-2xl p-4">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center space-x-1.5">
              <Tag size={11} className="text-violet-500" /> <span>Filter by Tag</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {TAGS.map(tag => (
                <button
                  key={tag} onClick={() => setActiveTag(tag)}
                  className={`text-[11px] px-3 py-1.5 rounded-full border font-bold transition-all ${
                    activeTag === tag
                      ? 'bg-violet-100 text-violet-600 border-violet-200 shadow-sm'
                      : 'bg-white text-slate-400 border-slate-200 hover:border-indigo-200 hover:text-slate-600'
                  }`}
                >
                  {tag || 'All'}
                </button>
              ))}
            </div>
          </div>

          {/* How it works */}
          <div className="glass-card rounded-2xl p-5 text-slate-400 text-xs leading-relaxed space-y-1.5">
            <h3 className="font-bold text-slate-600 flex items-center space-x-1.5 text-[13px] mb-2">
              <HelpCircle size={14} className="text-indigo-500" /> <span>How LoKi works</span>
            </h3>
            <p>1. Upload PDFs or TXT files with optional tags.</p>
            <p>2. Chunks are embedded into FAISS for instant retrieval.</p>
            <p>3. Use Semantic Search to find snippets without the LLM.</p>
            <p>4. Tag filters narrow context to specific categories.</p>
            <p>5. Sign in to persist and switch between sessions.</p>
          </div>
        </section>

        {/* Chat */}
        <section className="lg:col-span-8 h-[calc(100vh-180px)] min-h-[450px]">
          {activeTag && (
            <div className="mb-3 px-4 py-2 rounded-xl bg-violet-50 border border-violet-100 text-xs text-violet-600 flex items-center space-x-2 font-medium animate-fade-in">
              <Tag size={12} />
              <span>Filtering by tag: <strong>{activeTag}</strong></span>
              <button onClick={() => setActiveTag('')} className="ml-auto text-violet-400 hover:text-violet-600 transition-colors font-bold">Clear</button>
            </div>
          )}
          <ChatWindow messages={messages} onSendMessage={handleSend} isThinking={isThinking} />
        </section>
      </main>
    </div>
  );
}
