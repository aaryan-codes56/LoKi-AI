// frontend/src/components/Header.jsx: Refined header panel with brand icons, gradient logos, active badges, and safe clear database indicators.

import React from 'react';
import { Trash2, Sparkles } from 'lucide-react';

export default function Header({ threadId, onClear, isClearing }) {
  return (
    <header className="sticky top-0 z-40 glass-panel-strong px-5 sm:px-7 py-3 flex items-center justify-between border-b border-slate-200/50 shadow-sm flex-shrink-0">
      
      {/* Logo Brand */}
      <div className="flex items-center gap-3.5">
        <div className="h-9.5 w-9.5 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20">
          <Sparkles size={18} className="text-white" />
        </div>
        <div>
          <h1 className="font-black text-base tracking-tight leading-none text-slate-800">
            <span className="gradient-text">LoKi</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase mt-1">AI Knowledge Workspace</p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3">
        
        {/* Active Session Token */}
        <div className="hidden md:flex items-center gap-2 bg-slate-50 border border-slate-200/60 rounded-xl px-3.5 py-1.5 shadow-inner">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Session ID:</span>
          <span className="text-[10px] font-mono text-slate-500 select-all max-w-[130px] truncate">{threadId}</span>
        </div>

        {/* Clear Memory */}
        <button
          onClick={onClear}
          disabled={isClearing}
          className="group flex items-center gap-1.5 bg-white hover:bg-red-50 text-slate-400 hover:text-red-600 border border-slate-200/60 hover:border-red-200 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          <Trash2 size={13} className={isClearing ? 'animate-spin' : 'group-hover:scale-105 transition-transform'} />
          <span className="hidden sm:inline">{isClearing ? 'Clearing Index...' : 'Clear Session'}</span>
        </button>
      </div>
    </header>
  );
}
