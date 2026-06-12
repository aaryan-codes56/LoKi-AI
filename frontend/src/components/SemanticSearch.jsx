// frontend/src/components/SemanticSearch.jsx: Search tab that queries the FAISS index for matching snippets without calling the LLM.

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
      // Perform raw vector similarity search and return matching document snippets
      const data = await semanticSearch(threadId, query, tagFilter || null, 5);
      setResults(data);
      setSearched(true);
    } catch (err) {
      console.error("Semantic search failed:", err);
      setResults([]);
      setSearched(true);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <form onSubmit={handleSearch} className="space-y-3">
        {/* Query input */}
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across your documents..."
            className="w-full bg-slate-950 text-slate-100 text-sm border border-slate-800 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-indigo-500/70 transition-colors placeholder:text-slate-500"
          />
        </div>

        {/* Optional tag filter */}
        <div className="relative">
          <Tag size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            placeholder="Filter by tag (optional)"
            className="w-full bg-slate-950 text-slate-100 text-sm border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-indigo-500/70 transition-colors placeholder:text-slate-500"
          />
        </div>

        <button
          type="submit"
          disabled={isSearching || !query.trim()}
          className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          <span>{isSearching ? 'Searching...' : 'Search'}</span>
        </button>
      </form>

      {/* Results */}
      {searched && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {results.length > 0 ? `${results.length} matching snippets` : 'No results found'}
          </p>
          {results.map((r, i) => (
            <div key={i} className="bg-slate-900/40 border border-slate-800 rounded-xl p-4 space-y-2 hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BookOpen size={14} className="text-indigo-400" />
                  <span className="text-xs font-semibold text-slate-300">{r.source}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {r.tag && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-950/40 text-violet-400 border border-violet-900/50">
                      {r.tag}
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-slate-500">Chunk {r.chunk_index}</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-mono line-clamp-4">
                "{r.content}"
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
