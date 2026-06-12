// frontend/src/components/SourceCard.jsx: Premium light citation card with expandable snippet and tag badge.

import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

export default function SourceCard({ source, content, chunkIndex }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-slate-100 bg-white/70 overflow-hidden hover:shadow-md hover:shadow-indigo-500/5 transition-all duration-200">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-2.5 text-left hover:bg-slate-50/80 transition-colors focus:outline-none"
      >
        <div className="flex items-center space-x-2 min-w-0">
          <div className="h-6 w-6 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500 flex-shrink-0">
            <BookOpen size={12} />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-600 truncate">{source}</p>
            <p className="text-[9px] text-slate-400 font-mono">Chunk #{chunkIndex}</p>
          </div>
        </div>
        <div className="text-slate-300 hover:text-slate-500 ml-2">
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>

      {isExpanded && (
        <div className="px-3 pb-3 pt-1 border-t border-slate-100 bg-slate-50/40 animate-fade-in">
          <p className="text-[11px] text-slate-500 leading-relaxed font-mono whitespace-pre-wrap">
            "{content}"
          </p>
        </div>
      )}
    </div>
  );
}
