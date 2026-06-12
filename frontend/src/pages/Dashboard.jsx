// frontend/src/pages/Dashboard.jsx: Premium RAG workspace dashboard with collapsible panels, structured metadata filters, empty states, and floating inputs.

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
  LogOut, User, ChevronRight, Tag, Sparkles, SlidersHorizontal,
  FolderOpen, MessageSquare, ChevronLeft, Menu
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
  const [activeTab, setActiveTab] = useState('upload'); // upload, search

  // ─── UI Layout Toggles ──────────────────────────────────────────────────────
  const [isThinking, setIsThinking] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [errorBanner, setErrorBanner] = useState('');
  const [showHistorySidebar, setShowHistorySidebar] = useState(false);
  const [showDocSidebar, setShowDocSidebar] = useState(true);

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
      setErrorBanner('API request failed. Verify server status or configurations.');
      setMessages(prev => [...prev, { sender: 'bot', text: 'Error retrieving vector response. Verify backend state.', timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), sources: [] }]);
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
    } catch { setErrorBanner('Failed to clear session.'); } finally { setIsClearing(false); }
  };

  const switchThread = async (tid) => {
    localStorage.setItem('loki_thread_id', tid);
    setThreadId(tid);
    setMessages([]);
    setUploadedFiles([]);
    setShowHistorySidebar(false);
    await loadSessionData(tid);
  };

  const newThread = async () => {
    const id = generateThreadId();
    const title = `Session ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    localStorage.setItem('loki_thread_id', id);
    setThreadId(id);
    setMessages([]);
    setUploadedFiles([]);
    if (isAuthenticated) {
      try {
        await createThread(id, title);
        setThreads(prev => [{ id, title, created_at: new Date().toISOString() }, ...prev]);
      } catch {}
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('loki_auth_token');
    localStorage.removeItem('loki_username');
    localStorage.removeItem('loki_user_id');
    navigate('/');
  };

  return (
    <div className="h-screen w-screen bg-[#f8fafc] text-slate-800 flex flex-col font-['Inter',sans-serif] overflow-hidden relative">
      
      {/* Background blurs */}
      <div className="absolute top-[-20%] left-[-10%] w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-indigo-300/10 to-violet-300/10 blur-[90px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-gradient-to-br from-pink-300/10 to-purple-300/10 blur-[90px] pointer-events-none z-0" />

      {/* History Sidebar Panel (Overlay for Saved Threads) */}
      {showHistorySidebar && isAuthenticated && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-80 bg-white border-r border-slate-200/60 flex flex-col h-full shadow-2xl animate-fade-in">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-extrabold text-slate-700 flex items-center gap-2 text-sm">
                <History size={16} className="text-indigo-500" />
                <span>Saved Sessions</span>
              </h2>
              <button
                onClick={() => setShowHistorySidebar(false)}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
              >
                <ChevronLeft size={18} />
              </button>
            </div>
            
            <button
              onClick={newThread}
              className="m-4 flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-100/50 text-indigo-600 text-xs font-bold transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>Start New Thread</span>
            </button>

            <div className="flex-1 overflow-y-auto px-4 pb-6 gap-1.5 flex flex-col custom-scrollbar">
              {threads.map(t => (
                <button
                  key={t.id}
                  onClick={() => switchThread(t.id)}
                  className={`w-full text-left p-3.5 rounded-xl text-xs transition-all border ${
                    t.id === threadId
                      ? 'bg-indigo-50 border-indigo-100/60 text-indigo-600 font-bold'
                      : 'bg-white border-transparent text-slate-500 hover:bg-slate-50/80 hover:text-slate-700'
                  }`}
                >
                  <p className="font-bold truncate">{t.title}</p>
                  <p className="text-[9px] text-slate-400 mt-1 font-mono">{t.id}</p>
                </button>
              ))}
              {threads.length === 0 && (
                <p className="text-[11px] text-slate-400 text-center py-12">No saved threads yet.</p>
              )}
            </div>
          </div>
          <div className="flex-1 bg-slate-950/20 backdrop-blur-xs" onClick={() => setShowHistorySidebar(false)} />
        </div>
      )}

      {/* Main Workspace Header */}
      <Header threadId={threadId} onClear={handleClear} isClearing={isClearing} />

      {/* Sub-bar / Info Navigation */}
      <div className="border-b border-slate-200/40 bg-white/40 backdrop-blur-md px-4 sm:px-6 py-2.5 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowDocSidebar(!showDocSidebar)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            <FolderOpen size={14} />
            <span>{showDocSidebar ? 'Hide Source Panel' : 'Show Source Panel'}</span>
          </button>

          {isAuthenticated && (
            <button
              onClick={() => setShowHistorySidebar(true)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
            >
              <History size={14} />
              <span>Saved Threads</span>
            </button>
          )}

          <button
            onClick={newThread}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors cursor-pointer"
          >
            <Plus size={14} />
            <span>New Session</span>
          </button>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-3.5">
              <div className="flex items-center gap-1.5 text-xs bg-indigo-50 border border-indigo-100/50 px-2.5 py-1 rounded-lg">
                <User size={12} className="text-indigo-500" />
                <span className="text-indigo-600 font-bold">{username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-bold transition-colors cursor-pointer"
              >
                <LogOut size={13} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-xs text-indigo-600 hover:text-indigo-700 font-extrabold flex items-center gap-1 transition-all"
            >
              <span>Sign in to save threads</span>
              <ChevronRight size={13} />
            </Link>
          )}
        </div>
      </div>

      {/* Database Offline Banner */}
      {errorBanner && (
        <div className="bg-red-50 border-b border-red-100 text-red-600 px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs font-semibold animate-fade-in z-10">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-500 animate-pulse" />
            <span>{errorBanner}</span>
          </div>
          <button
            onClick={() => setErrorBanner('')}
            className="text-red-400 hover:text-red-600 px-2.5 py-1 rounded-lg bg-red-100/50 border border-red-200/50 transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Workspace Frame */}
      <main className="flex-1 flex w-full overflow-hidden relative z-10">
        
        {/* Collapsible Source Side Panel (Uploads, Search, Tags) */}
        <div
          className={`flex-shrink-0 border-r border-slate-200/60 flex flex-col h-full bg-white/40 backdrop-blur-md transition-all duration-300 z-10 overflow-hidden ${
            showDocSidebar ? 'w-80 opacity-100 px-4 py-5' : 'w-0 opacity-0 px-0 py-0'
          }`}
        >
          <div className="flex-1 flex flex-col gap-5 min-w-[288px]">
            {/* Sidebar Tabs */}
            <div className="glass-panel rounded-xl overflow-hidden shadow-sm flex-shrink-0">
              <div className="flex border-b border-slate-100">
                {[
                  ['upload', 'Documents', Brain],
                  ['search', 'Search', Search]
                ].map(([id, label, Icon]) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold transition-all cursor-pointer ${
                      activeTab === id
                        ? 'text-indigo-600 border-b-2 border-indigo-500 bg-indigo-50/20'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <Icon size={13} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
              <div className="p-4 bg-white/50">
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

            {/* Custom Tag Metadata Filter */}
            <div className="glass-panel rounded-xl p-4 flex-shrink-0">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <Tag size={11} className="text-violet-500" />
                <span>Filter Knowledge Base</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {TAGS.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(tag)}
                    className={`text-[10px] px-2.5 py-1.5 rounded-full border font-bold transition-all cursor-pointer ${
                      activeTag === tag
                        ? 'bg-violet-100 text-violet-600 border-violet-200/50 shadow-sm'
                        : 'bg-white text-slate-400 border-slate-200/60 hover:border-indigo-200 hover:text-slate-600'
                    }`}
                  >
                    {tag || 'All Contents'}
                  </button>
                ))}
              </div>
            </div>

            {/* Sidebar Guide */}
            <div className="glass-panel rounded-xl p-4.5 text-slate-400 text-[11px] leading-relaxed gap-1.5 flex flex-col overflow-y-auto custom-scrollbar flex-1">
              <h4 className="font-bold text-slate-600 flex items-center gap-1.5 text-xs mb-2">
                <HelpCircle size={13} className="text-indigo-500" />
                <span>RAG Instructions</span>
              </h4>
              <p>1. Drop PDFs or text files to build your vector database indices.</p>
              <p>2. Chunks are automatically tokenized and stored in FAISS.</p>
              <p>3. Tag queries to restrict vector matches to specific fields.</p>
              <p>4. Citations list the direct matches retrieved by cosine distance.</p>
            </div>
          </div>
        </div>

        {/* Floating Toggler Overlay (For smaller desktop screens) */}
        {!showDocSidebar && (
          <button
            onClick={() => setShowDocSidebar(true)}
            className="absolute top-4 left-4 z-20 h-9 w-9 bg-white border border-slate-200/80 shadow-md rounded-xl flex items-center justify-center text-slate-500 hover:text-indigo-600 transition-all cursor-pointer"
          >
            <Menu size={16} />
          </button>
        )}

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col h-full bg-transparent p-4 sm:p-5 relative">
          {activeTag && (
            <div className="mb-3.5 px-4 py-2 rounded-xl bg-violet-50 border border-violet-100 text-xs text-violet-600 flex items-center justify-between font-semibold animate-fade-in">
              <div className="flex items-center gap-2">
                <Tag size={12} />
                <span>Active Query Category Filter: <strong>{activeTag}</strong></span>
              </div>
              <button
                onClick={() => setActiveTag('')}
                className="text-violet-400 hover:text-violet-600 font-bold text-[11px] transition-colors cursor-pointer"
              >
                Clear Tag Filter
              </button>
            </div>
          )}

          <div className="flex-1 h-full min-h-0">
            <ChatWindow
              messages={messages}
              onSendMessage={handleSend}
              isThinking={isThinking}
              activeTag={activeTag}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
