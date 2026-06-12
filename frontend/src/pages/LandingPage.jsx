// frontend/src/pages/LandingPage.jsx: Premium landing page showcasing LoKi with floating mesh gradients, features, and an interactive sandbox workspace preview.

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, ArrowRight, FileText, Search, Brain, Shield,
  MessageSquare, Zap, Database, ChevronRight, ExternalLink,
  Play, RotateCcw, Check, Terminal, Code
} from 'lucide-react';

const features = [
  { icon: FileText, title: 'Document Ingestion', desc: 'Upload PDFs and text files. Content is dynamically chunked, embedded, and indexed on-the-fly.', color: 'indigo' },
  { icon: Brain, title: 'RAG Pipeline', desc: 'Queries are answered strictly using your uploaded files as grounded knowledge context.', color: 'violet' },
  { icon: Search, title: 'Semantic Search', desc: 'Search across all your documents with raw vector similarity — no LLM requests required.', color: 'purple' },
  { icon: Shield, title: 'Secure Session Controls', desc: 'Maintain complete security with JWT token headers and bcrypt pass-hashes.', color: 'emerald' },
  { icon: Database, title: 'FAISS Vector Database', desc: 'Store document vectors in a lightning-fast local FAISS database for instant retrieval.', color: 'blue' },
  { icon: MessageSquare, title: 'Source Attribution', desc: 'Every answer includes direct source snippets, showing exactly where facts came from.', color: 'pink' },
];

const techStack = [
  'React 19', 'Vite 8', 'Tailwind CSS v4', 'FastAPI', 'Python 3.12',
  'OpenAI GPT-3.5', 'LangChain', 'FAISS', 'SQLite', 'JWT + bcrypt'
];

const colorMap = {
  indigo: 'from-indigo-50 to-indigo-100 text-indigo-600 border-indigo-200/50',
  violet: 'from-violet-50 to-violet-100 text-violet-600 border-violet-200/50',
  purple: 'from-purple-50 to-purple-100 text-purple-600 border-purple-200/50',
  emerald: 'from-emerald-50 to-emerald-100 text-emerald-600 border-emerald-200/50',
  blue: 'from-blue-50 to-blue-100 text-blue-600 border-blue-200/50',
  pink: 'from-pink-50 to-pink-100 text-pink-600 border-pink-200/50',
};

const sandboxPresets = [
  {
    label: "Company Vacation Policy",
    query: "What is our policy on unused vacation days?",
    fileName: "hr_benefits_2026.pdf",
    matchingChunks: [
      { id: 1, text: "Section 4.2: ...employees can carry over up to 5 unused vacation days into the next calendar year. Any additional unused days beyond the 5-day limit will expire on December 31st..." }
    ],
    answer: "According to the hr_benefits_2026.pdf (Section 4.2), you can carry over a maximum of 5 unused vacation days into the next calendar year. Any unused days exceeding this 5-day limit will expire on December 31st."
  },
  {
    label: "Q2 Financial Report",
    query: "What was our year-over-year revenue growth in Q2?",
    fileName: "financials_q2.txt",
    matchingChunks: [
      { id: 2, text: "Operating Metrics: ...Q2 consolidated revenue reached $4.2M, representing a 28% year-over-year growth compared to $3.28M in Q2 of the previous fiscal year..." }
    ],
    answer: "As detailed in financials_q2.txt, the company's year-over-year revenue growth in Q2 was 28%, with consolidated revenue reaching $4.2M compared to $3.28M in the previous year's Q2."
  },
  {
    label: "Rust System Architecture",
    query: "How does the cache eviction policy work?",
    fileName: "cache_arch.md",
    matchingChunks: [
      { id: 3, text: "Design Document: ...we utilize a segmented LRU eviction algorithm. Fresh items are placed in the 'active' queue, while evicted elements fall back into a 'secondary' buffer..." }
    ],
    answer: "Based on the cache_arch.md specifications, the cache eviction policy uses a segmented LRU algorithm. New items go to an 'active' queue, and evicted items migrate into a 'secondary' buffer."
  }
];

export default function LandingPage() {
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [simulationState, setSimulationState] = useState('idle'); // idle, typing, matching, streaming, complete
  const [typedQuery, setTypedQuery] = useState('');
  const [streamedAnswer, setStreamedAnswer] = useState('');

  const currentPreset = sandboxPresets[selectedPresetIndex];

  // Run simulation sequence
  const startSimulation = () => {
    setSimulationState('typing');
    setTypedQuery('');
    setStreamedAnswer('');

    // Typing speed simulator
    let curText = '';
    const queryText = currentPreset.query;
    let i = 0;
    const typingTimer = setInterval(() => {
      if (i < queryText.length) {
        curText += queryText[i];
        setTypedQuery(curText);
        i++;
      } else {
        clearInterval(typingTimer);
        setSimulationState('matching');
        
        // Matching pause
        setTimeout(() => {
          setSimulationState('streaming');
          
          // Streaming answer speed simulator
          let j = 0;
          let answerText = currentPreset.answer;
          let curAnswer = '';
          const streamingTimer = setInterval(() => {
            if (j < answerText.length) {
              // Add characters or words
              curAnswer += answerText.slice(j, j + 4);
              setStreamedAnswer(curAnswer);
              j += 4;
            } else {
              clearInterval(streamingTimer);
              setSimulationState('complete');
            }
          }, 35);
        }, 1200);
      }
    }, 45);
  };

  // Reset simulation when preset changes
  useEffect(() => {
    setSimulationState('idle');
    setTypedQuery('');
    setStreamedAnswer('');
  }, [selectedPresetIndex]);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#0f172a] relative overflow-hidden font-['Inter',sans-serif]">
      
      {/* Animated Background Glow Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-indigo-300/20 to-violet-300/10 blur-[120px] pointer-events-none animate-blob-slow-1 z-0" />
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-pink-300/15 to-purple-300/10 blur-[150px] pointer-events-none animate-blob-slow-2 z-0" />

      {/* Navigation */}
      <nav className="sticky top-4 z-50 glass-panel-strong px-4 sm:px-8 py-3.5 flex items-center justify-between max-w-7xl mx-auto my-3 rounded-2xl">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 animate-pulse-glow">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="font-extrabold text-xl gradient-text tracking-tight">LoKi</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors px-3 py-2">
            Sign In
          </Link>
          <Link
            to="/signup"
            className="text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 px-5 py-2.5 rounded-xl shadow-md shadow-indigo-500/20 hover:shadow-lg transition-all active:scale-[0.98]"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 pt-16 sm:pt-28 pb-24 text-center relative z-10">
        <div className="inline-flex items-center gap-2 bg-indigo-50/80 border border-indigo-100/50 backdrop-blur-md rounded-full px-4.5 py-1.5 mb-8 animate-fade-in shadow-sm">
          <Zap size={13} className="text-indigo-500 animate-bounce" />
          <span className="text-[11px] font-extrabold text-indigo-600 uppercase tracking-widest">State-of-the-Art Local RAG Pipeline</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-slate-800 leading-[1.08] mb-6 animate-fade-in">
          Interact with documents.<br />
          <span className="gradient-text">Instant vector answers.</span>
        </h1>

        <p className="text-base sm:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed mb-10 animate-fade-in">
          Upload PDFs, notes, or codebases. Query them instantly and get verified answers with clear text citations — powered by local FAISS storage and SQLite indexing.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
          <Link
            to="/signup"
            className="group flex items-center gap-2 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:opacity-95 text-white font-bold text-sm px-8 py-4 rounded-2xl shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.98]"
          >
            <span>Start Building Your Brain</span>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 font-bold text-sm px-7 py-4 rounded-2xl border border-slate-200/80 bg-white/70 backdrop-blur-md hover:bg-white hover:shadow-md transition-all active:scale-[0.98]"
          >
            <span>Try in Sandbox Mode</span>
            <ChevronRight size={15} />
          </Link>
        </div>
      </section>

      {/* Interactive Sandbox Simulator */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 mt-20 pt-12 pb-24 relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-800 tracking-tight mb-2">Live Demo</h2>
          <p className="text-sm text-slate-400">See how LoKi processes document queries dynamically</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Preset Selector Pane */}
          <div className="lg:col-span-4 flex flex-col justify-center gap-3">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1 pl-1">Select Scenario</h3>
            {sandboxPresets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedPresetIndex(idx)}
                className={`w-full text-left p-4 rounded-2xl transition-all duration-300 border ${
                  selectedPresetIndex === idx
                    ? 'bg-white border-indigo-200 shadow-md shadow-indigo-500/5 translate-x-1.5'
                    : 'bg-white/40 border-slate-100 hover:bg-white/75 hover:border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${
                    selectedPresetIndex === idx ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'
                  }`}>
                    <FileText size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-black ${selectedPresetIndex === idx ? 'text-indigo-600' : 'text-slate-500'}`}>
                      {preset.label}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{preset.fileName}</p>
                  </div>
                </div>
              </button>
            ))}

            <button
              onClick={startSimulation}
              disabled={simulationState === 'typing' || simulationState === 'matching' || simulationState === 'streaming'}
              className="mt-4 flex items-center justify-center gap-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-2xl transition-all shadow-md shadow-indigo-500/10 active:scale-[0.98]"
            >
              {simulationState === 'idle' || simulationState === 'complete' ? (
                <>
                  <Play size={14} fill="white" />
                  <span>Run Query Simulation</span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                  <span>Simulating...</span>
                </>
              )}
            </button>
          </div>

          {/* Simulated Workspace Sandbox */}
          <div className="lg:col-span-8 glass-panel-strong rounded-3xl overflow-hidden flex flex-col shadow-xl border border-slate-200/80 min-h-[380px]">
            {/* Mock Header */}
            <div className="bg-slate-50/80 px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                <span className="text-[11px] font-mono text-slate-400 ml-2">LoKi Workspace Sandbox</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-white border border-slate-200 rounded-lg px-2.5 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse mr-1" />
                <span>{currentPreset.fileName}</span>
              </div>
            </div>

            {/* Mock Chat View */}
            <div className="flex-1 p-5 gap-4 overflow-y-auto bg-white/40 flex flex-col justify-end">
              {simulationState === 'idle' && (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 my-auto">
                  <Terminal size={32} className="text-slate-300 animate-pulse mb-3" />
                  <p className="text-xs font-bold text-slate-400">Click the button on the left to start query simulation</p>
                </div>
              )}

              {/* User Query */}
              {simulationState !== 'idle' && (
                <div className="flex justify-end animate-fade-in">
                  <div className="max-w-[85%] bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xs px-4 py-2.5 rounded-2xl rounded-tr-sm shadow-sm">
                    <p>{typedQuery || ' '}</p>
                  </div>
                </div>
              )}

              {/* Match/Embedding State */}
              {simulationState === 'matching' && (
                <div className="flex items-center gap-2 text-indigo-500 font-bold text-[11px] py-2 animate-pulse">
                  <Search size={12} className="animate-spin" />
                  <span>Searching FAISS vector database for matching chunks...</span>
                </div>
              )}

              {/* Streaming/Complete Answer */}
              {(simulationState === 'streaming' || simulationState === 'complete') && (
                <div className="gap-3 flex flex-col animate-fade-in">
                  <div className="flex items-start gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white flex-shrink-0">
                      <Sparkles size={13} />
                    </div>
                    <div className="max-w-[85%] bg-white border border-slate-100 text-slate-700 text-xs px-4 py-2.5 rounded-2xl rounded-tl-sm shadow-sm leading-relaxed">
                      <p>{streamedAnswer}</p>
                    </div>
                  </div>

                  {/* Sources display */}
                  {simulationState === 'complete' && (
                    <div className="pl-9 gap-1.5 flex flex-col animate-fade-in">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Retrieved Chunks (100% Match)</span>
                      {currentPreset.matchingChunks.map(chunk => (
                        <div key={chunk.id} className="p-3 bg-indigo-50/50 border border-indigo-100/30 rounded-xl">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-1">
                              <FileText size={10} /> <span>{currentPreset.fileName}</span>
                            </span>
                            <span className="text-[9px] text-slate-400">FAISS Segment {chunk.id}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-mono italic leading-relaxed">
                            "{chunk.text}"
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mock Input Bar */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <input
                type="text"
                readOnly
                placeholder="Ask about your documents..."
                value={simulationState === 'idle' ? '' : typedQuery}
                className="flex-1 bg-white text-xs border border-slate-200 rounded-xl px-4.5 py-2.5 focus:outline-none text-slate-400"
              />
              <div className="h-9 w-9 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400">
                <Play size={13} fill="currentColor" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 pt-12 pb-24 relative z-10">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-800 tracking-tight mb-2">Everything You Need</h2>
          <p className="text-sm text-slate-400">A fully production-grade local knowledge indexing architecture</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="glass-panel-interactive rounded-2xl p-6 relative group overflow-hidden">
              {/* Corner Glow Accent */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-400/5 blur-xl rounded-full group-hover:bg-indigo-400/10 transition-colors" />

              <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${colorMap[f.color]} flex items-center justify-center mb-4.5 group-hover:scale-110 transition-transform shadow-sm`}>
                <f.icon size={20} />
              </div>
              <h3 className="font-extrabold text-slate-700 text-sm mb-2 group-hover:text-indigo-600 transition-colors">{f.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="max-w-4xl mx-auto px-4 sm:px-8 pt-12 pb-24 text-center relative z-10">
        <div className="mb-10">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight mb-2">The LoKi Technology Stack</h2>
          <p className="text-xs text-slate-400">Built using state-of-the-art open source libraries and modern frameworks</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {techStack.map((t, i) => (
            <span
              key={i}
              className="text-xs font-bold text-slate-500 bg-white/70 border border-slate-200 rounded-full px-5 py-2.5 shadow-sm hover:shadow-md hover:border-indigo-200 hover:text-indigo-600 hover:bg-white hover:scale-105 transition-all cursor-default"
            >
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/50 py-10 px-4 text-center bg-white/40 backdrop-blur-md relative z-10">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/10">
              <Sparkles size={14} className="text-white" />
            </div>
            <span className="font-extrabold gradient-text text-sm">LoKi Workspace</span>
          </div>

          <p className="text-[11px] text-slate-400 max-w-md md:text-left leading-relaxed">
            LoKi is a complete, original RAG application. Files are chunked and converted into vectors, matching search terms with cosine similarity backends.
          </p>

          <a
            href="https://github.com/aaryan-codes56/LoKi-AI"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 transition-colors font-bold"
          >
            <ExternalLink size={13} />
            <span>View GitHub Project</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
