// frontend/src/pages/LandingPage.jsx: Premium hero landing page showcasing LoKi's features with animated sections and CTAs.

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, ArrowRight, FileText, Search, Brain, Shield,
  MessageSquare, Zap, Database, ChevronRight, ExternalLink
} from 'lucide-react';

const features = [
  { icon: FileText, title: 'Document Ingestion', desc: 'Upload PDFs and text files. Content is chunked, embedded, and indexed automatically.', color: 'indigo' },
  { icon: Brain, title: 'RAG Pipeline', desc: 'Questions are answered using only your uploaded content — zero hallucination.', color: 'violet' },
  { icon: Search, title: 'Semantic Search', desc: 'Search across all your documents with vector similarity — no LLM needed.', color: 'purple' },
  { icon: Shield, title: 'JWT Authentication', desc: 'Secure accounts with bcrypt password hashing and token-based sessions.', color: 'emerald' },
  { icon: Database, title: 'FAISS Vector Store', desc: 'Lightning-fast local vector database for instant retrieval at scale.', color: 'blue' },
  { icon: MessageSquare, title: 'Source Citations', desc: 'Every answer includes the exact document chunks used as context.', color: 'pink' },
];

const techStack = [
  'React 19', 'Vite 8', 'Tailwind CSS v4', 'FastAPI', 'Python 3.12',
  'OpenAI GPT-3.5', 'LangChain', 'FAISS', 'SQLite', 'JWT + bcrypt'
];

const colorMap = {
  indigo: 'from-indigo-50 to-indigo-100 text-indigo-600',
  violet: 'from-violet-50 to-violet-100 text-violet-600',
  purple: 'from-purple-50 to-purple-100 text-purple-600',
  emerald: 'from-emerald-50 to-emerald-100 text-emerald-600',
  blue: 'from-blue-50 to-blue-100 text-blue-600',
  pink: 'from-pink-50 to-pink-100 text-pink-600',
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-indigo-50/30 font-['Inter',sans-serif]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 glass-card-strong px-4 sm:px-8 py-3.5 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="font-extrabold text-lg gradient-text tracking-tight">LoKi</span>
        </div>
        <div className="flex items-center space-x-3">
          <Link to="/login" className="text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors px-3 py-2">
            Sign In
          </Link>
          <Link
            to="/signup"
            className="text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 px-5 py-2 rounded-xl shadow-md shadow-indigo-500/25 hover:shadow-lg hover:shadow-indigo-500/30 transition-all active:scale-[0.98]"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 pt-16 sm:pt-24 pb-16 text-center">
        <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 mb-6">
          <Zap size={13} className="text-indigo-500" />
          <span className="text-xs font-bold text-indigo-600 tracking-wide">Powered by RAG + GPT-3.5</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-800 leading-[1.1] mb-5">
          Your Documents.<br />
          <span className="gradient-text">Your AI Brain.</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-500 max-w-xl mx-auto leading-relaxed mb-8">
          Upload your notes, research, or company docs. Ask questions and get instant, grounded answers with source citations — no hallucination, no guessing.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/signup"
            className="group flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold text-sm px-7 py-3.5 rounded-2xl shadow-xl shadow-indigo-500/25 hover:shadow-2xl hover:shadow-indigo-500/30 transition-all active:scale-[0.98]"
          >
            <span>Start Building Your Brain</span>
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center space-x-2 text-slate-500 hover:text-slate-700 font-semibold text-sm px-6 py-3.5 rounded-2xl border border-slate-200 bg-white hover:shadow-md transition-all"
          >
            <span>Try Without Account</span>
            <ChevronRight size={15} />
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 sm:px-8 pb-20">
        <div className="glass-card-strong rounded-3xl p-6 sm:p-8 shadow-xl">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.15em] mb-4">How It Works</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              ['01', 'Upload', 'Drop your PDFs or text files. They\'re split into 500-char chunks automatically.'],
              ['02', 'Index', 'Each chunk is converted to an embedding vector and stored in a local FAISS database.'],
              ['03', 'Ask', 'Your question retrieves the top 3 matching chunks. GPT answers from that context only.'],
            ].map(([num, title, desc]) => (
              <div key={num} className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100">
                <span className="text-xs font-black text-indigo-400 tracking-widest">{num}</span>
                <h4 className="font-bold text-slate-700 mt-1.5 mb-1">{title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 sm:px-8 pb-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight mb-2">Everything You Need</h2>
          <p className="text-sm text-slate-400">A complete AI knowledge stack built from scratch</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div key={i} className="glass-card rounded-2xl p-5 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 group">
              <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${colorMap[f.color]} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <f.icon size={18} />
              </div>
              <h3 className="font-bold text-slate-700 text-sm mb-1">{f.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="max-w-4xl mx-auto px-4 sm:px-8 pb-20">
        <div className="text-center mb-6">
          <h2 className="text-xl font-extrabold text-slate-800 tracking-tight mb-1">Tech Stack</h2>
          <p className="text-xs text-slate-400">Production-grade tools used by industry leaders</p>
        </div>
        <div className="flex flex-wrap justify-center gap-2.5">
          {techStack.map((t, i) => (
            <span key={i} className="text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-full px-4 py-2 shadow-sm hover:shadow-md hover:border-indigo-200 hover:text-indigo-600 transition-all cursor-default">
              {t}
            </span>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 py-8 px-4 text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Sparkles size={15} className="text-indigo-500" />
          <span className="font-extrabold gradient-text text-sm">LoKi</span>
        </div>
        <p className="text-[11px] text-slate-400">Built as an original portfolio project demonstrating production-grade RAG architecture.</p>
        <a
          href="https://github.com/aaryan-codes56/LoKi-AI"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1.5 mt-3 text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          <ExternalLink size={13} />
          <span>View on GitHub</span>
        </a>
      </footer>
    </div>
  );
}
