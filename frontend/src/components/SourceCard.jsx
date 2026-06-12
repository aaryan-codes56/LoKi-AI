// frontend/src/components/SourceCard.jsx: UI card component that displays chunk snippet citations and origin filenames for AI answers.

import React, { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

export default function SourceCard({ source, content, chunkIndex }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/30 overflow-hidden hover:border-slate-700/80 transition-all duration-200 shadow-sm">
      {/* Header Summary */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-900/50 transition-colors duration-150 focus:outline-none"
      >
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="h-7 w-7 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 flex-shrink-0">
            <BookOpen size={14} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-300 truncate">{source}</p>
            <p className="text-[10px] text-slate-500 font-mono">Chunk: {chunkIndex}</p>
          </div>
        </div>
        <div className="text-slate-400 hover:text-slate-200 ml-2">
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Expanded Content Snippet */}
      {isExpanded && (
        <div className="px-4 pb-3 pt-1 border-t border-slate-800 bg-slate-950/20">
          <p className="text-xs text-slate-400 leading-relaxed font-mono whitespace-pre-wrap select-all">
            "{content}"
          </p>
        </div>
      )}
    </div>
  );
}
