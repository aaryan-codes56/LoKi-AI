// frontend/src/components/ChatWindow.jsx: High-fidelity chat interface with codeblock styling, suggestions, responsive input slots, and animated citation states.

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, AlertCircle, FileText } from 'lucide-react';
import SourceCard from './SourceCard';

const suggestions = [
  { text: "What is the policy for unused vacation days?", label: "Vacation Carryover" },
  { text: "What was the consolidated revenue and YoY growth in Q2?", label: "Q2 Revenues" },
  { text: "Explain the segmented LRU cache eviction algorithm.", label: "Eviction Logic" }
];

export default function ChatWindow({ messages, onSendMessage, isThinking, activeTag }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;
    onSendMessage(input);
    setInput('');
  };

  const handleSuggestionClick = (text) => {
    if (isThinking) return;
    onSendMessage(text);
  };

  // Helper function to extract and format code blocks in answers
  const renderMessageText = (text) => {
    if (!text.includes('```')) {
      return <p className="whitespace-pre-wrap">{text}</p>;
    }

    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        // Extract language and code content
        const lines = part.slice(3, -3).trim().split('\n');
        const firstLine = lines[0].trim();
        const hasLang = /^[a-zA-Z0-9_-]+$/.test(firstLine);
        const language = hasLang ? firstLine : '';
        const code = hasLang ? lines.slice(1).join('\n') : lines.join('\n');

        return (
          <div key={index} className="my-3.5 rounded-xl overflow-hidden border border-slate-750 bg-slate-900 shadow-md">
            {language && (
              <div className="bg-slate-800/80 px-4 py-1.5 flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-slate-700/40 uppercase tracking-wider">
                <span>{language}</span>
                <span className="opacity-75">Code Snippet</span>
              </div>
            )}
            <pre className="p-4 overflow-x-auto text-xs font-mono text-indigo-200 custom-scrollbar leading-relaxed">
              <code>{code}</code>
            </pre>
          </div>
        );
      }
      return <p key={index} className="whitespace-pre-wrap my-1">{part}</p>;
    });
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-md">
      
      {/* Scrollable Message Box */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar bg-slate-50/20">
        
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 max-w-lg mx-auto space-y-5 my-auto">
            
            {/* Animated Float Icon */}
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-100 flex items-center justify-center text-indigo-500 shadow-sm animate-pulse-glow">
              <Sparkles size={24} />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-slate-800 tracking-tight">LoKi Knowledge Brain</h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-2">
                Upload PDFs or notes in the left side drawer. Your files will be indexed as semantic vectors to answer queries with absolute factual precision.
              </p>
            </div>

            {/* Quick Suggestions */}
            <div className="w-full space-y-2 pt-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-center mb-1">Simulate Quick Inquiries</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {suggestions.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestionClick(item.text)}
                    className="p-3 bg-white hover:bg-indigo-50/20 border border-slate-200/60 hover:border-indigo-200 rounded-xl text-left text-[11px] font-bold text-slate-500 hover:text-indigo-600 transition-all shadow-xs cursor-pointer active:scale-98"
                  >
                    <p className="opacity-75 font-mono text-[9px] uppercase tracking-wider text-slate-400 mb-1">Preset {i+1}</p>
                    <p className="line-clamp-2 leading-snug">{item.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((msg, idx) => {
              const isUser = msg.sender === 'user';
              return (
                <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-start gap-3.5 animate-fade-in`}>
                  
                  {!isUser && (
                    <div className="h-8.5 w-8.5 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
                      <Bot size={15} />
                    </div>
                  )}

                  <div className="flex flex-col max-w-[85%] sm:max-w-[75%] space-y-2.5">
                    <div className={`rounded-2xl px-4.5 py-3.5 text-[13px] leading-relaxed shadow-xs border ${
                      isUser
                        ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white border-transparent rounded-tr-md shadow-indigo-500/5'
                        : 'bg-white border-slate-100/90 text-slate-700 rounded-tl-md markdown-body'
                    }`}>
                      {renderMessageText(msg.text)}
                      <span className={`block text-[9px] mt-2 text-right font-medium ${
                        isUser ? 'text-indigo-200' : 'text-slate-350'
                      }`}>
                        {msg.timestamp}
                      </span>
                    </div>

                    {/* Citations / References */}
                    {!isUser && msg.sources?.length > 0 && (
                      <div className="space-y-2 mt-1 pl-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Retrieved Vector Snippets</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {msg.sources.map((src, si) => (
                            <SourceCard
                              key={si}
                              source={src.source}
                              content={src.content}
                              chunkIndex={src.chunk_index}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="h-8.5 w-8.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-slate-400 flex-shrink-0 shadow-xs">
                      <User size={15} />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Thinking Skeleton */}
            {isThinking && (
              <div className="flex justify-start items-start gap-3.5 animate-fade-in">
                <div className="h-8.5 w-8.5 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center text-white shadow-sm flex-shrink-0">
                  <Bot size={15} />
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-md px-4.5 py-3.5 shadow-xs flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full typing-dot" style={{ animationDelay: '0s' }} />
                    <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full typing-dot" style={{ animationDelay: '0.2s' }} />
                    <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full typing-dot" style={{ animationDelay: '0.4s' }} />
                  </div>
                  <span className="text-xs text-slate-400 font-bold">Querying local FAISS...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Floating Query Form input */}
      <form onSubmit={handleSubmit} className="p-3.5 border-t border-slate-200/60 bg-white flex items-center gap-3">
        <div className="flex-1 relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isThinking}
            placeholder={activeTag ? `Ask about documents tagged with "${activeTag}"...` : "Ask about your indexed files..."}
            className="w-full bg-slate-50 text-slate-700 text-xs.5 border border-slate-200 rounded-xl px-4.5 py-3.5 pr-14 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-300 focus:bg-white transition-all placeholder:text-slate-400"
          />
          {activeTag && (
            <span className="absolute right-4 text-[9px] font-black uppercase text-violet-500 bg-violet-50 px-2 py-0.5 rounded-md border border-violet-100">
              {activeTag}
            </span>
          )}
        </div>
        <button
          type="submit"
          disabled={!input.trim() || isThinking}
          className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 hover:opacity-95 text-white flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-md shadow-indigo-500/20 active:scale-95 flex-shrink-0 cursor-pointer"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
