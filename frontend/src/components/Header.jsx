// frontend/src/components/Header.jsx: Navigation header showing active session thread ID, app branding, and the reset button.

import React from 'react';
import { Trash2 } from 'lucide-react';

export default function Header({ threadId, onClear, isClearing }) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <span className="font-extrabold text-white text-xl tracking-tight">Lk</span>
        </div>
        <div>
          <h1 className="font-bold text-white text-lg leading-tight">LoKi</h1>
          <p className="text-xs text-slate-400">Personal RAG Knowledge Assistant</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="hidden md:flex items-center space-x-2 bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-mono text-slate-400">Thread:</span>
          <span className="text-xs font-mono text-slate-200 select-all">{threadId}</span>
        </div>
        
        <button
          onClick={onClear}
          disabled={isClearing}
          className="flex items-center space-x-2 bg-rose-950/20 hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 border border-rose-900/50 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_15px_rgba(244,63,94,0.1)]"
        >
          <Trash2 size={16} className={isClearing ? 'animate-spin' : ''} />
          <span>{isClearing ? 'Clearing...' : 'Clear History'}</span>
        </button>
      </div>
    </header>
  );
}
