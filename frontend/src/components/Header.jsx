// frontend/src/components/Header.jsx: Premium light-mode header with gradient branding, session badge, and action buttons.

import React from 'react';
import { Trash2, Sparkles } from 'lucide-react';

export default function Header({ threadId, onClear, isClearing }) {
  return (
    <header className="sticky top-0 z-50 glass-card-strong px-4 sm:px-6 py-3.5 flex items-center justify-between">
      {/* Brand */}
      <div className="flex items-center space-x-3">
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 animate-glow">
          <Sparkles size={20} className="text-white" />
        </div>
        <div>
          <h1 className="font-extrabold text-[1.15rem] leading-tight tracking-tight">
            <span className="gradient-text">LoKi</span>
          </h1>
          <p className="text-[11px] text-slate-400 font-medium tracking-wide">AI Second Brain</p>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center space-x-3">
        {/* Thread badge — hidden on mobile */}
        <div className="hidden md:flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/40 animate-pulse" />
          <span className="text-[11px] font-medium text-slate-400">Session</span>
          <span className="text-[11px] font-mono text-slate-500 select-all max-w-[120px] truncate">{threadId}</span>
        </div>

        {/* Clear button */}
        <button
          onClick={onClear}
          disabled={isClearing}
          className="group flex items-center space-x-1.5 bg-white hover:bg-red-50 text-slate-400 hover:text-red-500 border border-slate-200 hover:border-red-200 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm hover:shadow-md hover:shadow-red-500/5"
        >
          <Trash2 size={14} className={isClearing ? 'animate-spin' : 'group-hover:scale-110 transition-transform'} />
          <span className="hidden sm:inline">{isClearing ? 'Clearing...' : 'Clear'}</span>
        </button>
      </div>
    </header>
  );
}
