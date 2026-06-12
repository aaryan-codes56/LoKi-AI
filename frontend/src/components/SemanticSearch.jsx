// frontend/src/components/SemanticSearch.jsx: Premium semantic search input panels with responsive citation boxes and tag labels.

import React, { useState } from 'react';
import { Search, Loader2, BookOpen, Tag } from 'lucide-react';
import { semanticSearch } from '../api/client';

export default function SemanticSearch({ threadId }) {
  const [query, setQuery] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    setSearched(false);
    try {
      const data = await semanticSearch(threadId, query, tagFilter || null, 5);
      setResults(data);
      setSearched(true);
    } catch (err) {
      setResults([]);
      setSearched(true);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSearch} className="flex flex-col gap-2.5">
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Query semantic index..."
            className="w-full premium-input text-slate-700 text-xs rounded-xl pl-9.5 pr-4 py-3 focus:outline-none placeholder:text-slate-400"
          />
        </div>
        
        <div className="relative">
          <Tag size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            placeholder="Filter by tag (optional)"
            className="w-full premium-input text-slate-700 text-xs rounded-xl pl-9.5 pr-4 py-2.5 focus:outline-none placeholder:text-slate-400"
          />
        </div>

        <button
          type="submit"
          disabled={isSearching || !query.trim()}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm shadow-indigo-500/10 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSearching ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
          <span>{isSearching ? 'Searching...' : 'Search Vectors'}</span>
        </button>
      </form>

      {searched && (
        <div className="flex flex-col gap-2.5 animate-fade-in">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-0.5">
            {results.length > 0 ? `${results.length} vector segments found` : 'No segments found'}
          </p>
          
          <div className="max-h-[180px] overflow-y-auto pr-0.5 gap-2 flex flex-col custom-scrollbar">
            {results.map((r, i) => (
              <div
                key={i}
                className="bg-white/80 border border-slate-100/90 rounded-xl p-3.5 gap-2.5 flex flex-col hover:shadow-sm hover:border-slate-200/50 transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen size={12} className="text-indigo-500" />
                    <span className="text-[10px] font-bold text-slate-600 truncate max-w-[120px]">{r.source}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {r.tag && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-violet-50 text-violet-600 border border-violet-100/50 font-bold">
                        {r.tag}
                      </span>
                    )}
                    <span className="text-[9px] font-mono text-slate-400">#{r.chunk_index}</span>
                  </div>
                </div>
                
                <p className="text-[10px] text-slate-500 leading-relaxed font-mono italic">
                  "{r.content}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
