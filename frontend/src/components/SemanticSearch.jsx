// frontend/src/components/SemanticSearch.jsx: Premium light-mode semantic search panel with tag filtering.

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
    <div className="flex flex-col space-y-4">
      <form onSubmit={handleSearch} className="space-y-2.5">
        <div className="relative">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across your documents..."
            className="w-full bg-slate-50 text-slate-700 text-sm border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all placeholder:text-slate-400"
          />
        </div>
        <div className="relative">
          <Tag size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text" value={tagFilter} onChange={(e) => setTagFilter(e.target.value)}
            placeholder="Filter by tag (optional)"
            className="w-full bg-slate-50 text-slate-700 text-sm border border-slate-200 rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all placeholder:text-slate-400"
          />
        </div>
        <button
          type="submit" disabled={isSearching || !query.trim()}
          className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white text-sm font-semibold transition-all shadow-md shadow-indigo-500/20 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {isSearching ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
          <span>{isSearching ? 'Searching...' : 'Search'}</span>
        </button>
      </form>

      {searched && (
        <div className="space-y-2.5 animate-fade-in">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            {results.length > 0 ? `${results.length} results` : 'No results'}
          </p>
          {results.map((r, i) => (
            <div key={i} className="bg-white/70 border border-slate-100 rounded-xl p-3.5 space-y-2 hover:shadow-md hover:shadow-indigo-500/5 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BookOpen size={13} className="text-indigo-500" />
                  <span className="text-[11px] font-bold text-slate-600">{r.source}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {r.tag && (
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-violet-50 text-violet-500 border border-violet-100 font-bold">
                      {r.tag}
                    </span>
                  )}
                  <span className="text-[9px] font-mono text-slate-400">#{r.chunk_index}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed font-mono line-clamp-3">"{r.content}"</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
