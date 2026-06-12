// frontend/src/components/ChatWindow.jsx: Premium light-mode chat interface with elegant bubbles, typing indicator, and citations.

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import SourceCard from './SourceCard';

export default function ChatWindow({ messages, onSendMessage, isThinking }) {
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

  return (
    <div className="flex flex-col h-full glass-card-strong rounded-2xl overflow-hidden shadow-xl">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="h-16 w-16 rounded-3xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-indigo-500 shadow-lg shadow-indigo-500/10 animate-float">
              <Sparkles size={28} />
            </div>
            <div className="max-w-sm">
              <h3 className="text-lg font-bold text-slate-700 mb-1.5">Start a Conversation</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Upload a document in the sidebar, then ask questions here. LoKi answers using <strong className="text-indigo-500">only your content</strong> — no guessing.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {messages.map((msg, idx) => {
              const isUser = msg.sender === 'user';
              return (
                <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-start gap-3 animate-fade-in`}>
                  {!isUser && (
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 flex-shrink-0">
                      <Bot size={15} />
                    </div>
                  )}

                  <div className="flex flex-col max-w-[85%] sm:max-w-[75%] space-y-2">
                    <div className={`rounded-2xl px-4 py-3 text-[13.5px] leading-relaxed shadow-sm ${
                      isUser
                        ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-tr-md'
                        : 'bg-white border border-slate-100 text-slate-700 rounded-tl-md'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      <span className={`block text-[9px] mt-2 text-right font-medium ${
                        isUser ? 'text-indigo-200' : 'text-slate-300'
                      }`}>
                        {msg.timestamp}
                      </span>
                    </div>

                    {!isUser && msg.sources?.length > 0 && (
                      <div className="space-y-1.5 mt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Sources</span>
                        {msg.sources.map((src, si) => (
                          <SourceCard key={si} source={src.source} content={src.content} chunkIndex={src.chunk_index} />
                        ))}
                      </div>
                    )}
                  </div>

                  {isUser && (
                    <div className="h-8 w-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 flex-shrink-0">
                      <User size={15} />
                    </div>
                  )}
                </div>
              );
            })}

            {isThinking && (
              <div className="flex justify-start items-start gap-3 animate-fade-in">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 flex-shrink-0">
                  <Bot size={15} />
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm flex items-center space-x-2.5">
                  <Loader2 size={15} className="animate-spin text-indigo-500" />
                  <span className="text-sm text-slate-400 font-medium animate-pulse">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 sm:p-4 border-t border-slate-100 bg-white/60 flex items-center gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isThinking}
          placeholder="Ask about your documents..."
          className="flex-1 bg-slate-50 text-slate-700 text-sm border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={!input.trim() || isThinking}
          className="h-[44px] w-[44px] rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white flex items-center justify-center transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-95 flex-shrink-0"
        >
          <Send size={17} />
        </button>
      </form>
    </div>
  );
}
