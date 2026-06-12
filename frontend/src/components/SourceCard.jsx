// frontend/src/components/SourceCard.jsx: Premium citation card layout with clean toggle icons and formatted quote bubbles.

import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

export default function SourceCard({ source, content, chunkIndex }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-slate-200/50 bg-white/60 overflow-hidden hover:shadow-md hover:border-slate-300/60 transition-all duration-200">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-2.5 text-left hover:bg-indigo-50/20 transition-colors focus:outline-none cursor-pointer"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-6 w-6 rounded-md bg-indigo-50 text-indigo-500 flex items-center justify-center flex-shrink-0">
            <BookOpen size={11} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold text-slate-700 truncate">{source}</p>
            <p className="text-[9px] text-slate-400 font-mono">FAISS Segment #{chunkIndex}</p>
          </div>
        </div>
        <div className="text-slate-400 hover:text-indigo-600 transition-colors">
          {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </div>
      </button>

      {isExpanded && (
        <div className="px-3 pb-3 pt-1.5 border-t border-slate-100 bg-slate-50/50 animate-fade-in">
          <p className="text-[10px] text-slate-500 leading-relaxed font-mono italic whitespace-pre-wrap select-all">
            "{content}"
          </p>
        </div>
      )}
    </div>
  );
}
