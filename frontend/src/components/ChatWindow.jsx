// frontend/src/components/ChatWindow.jsx: Implements conversational bubble log, loading states, citations integration, and submission handlers.

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import SourceCard from './SourceCard';

export default function ChatWindow({ messages, onSendMessage, isThinking }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative">
      {/* Messages Viewport */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="h-16 w-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-500/5">
              <Bot size={32} />
            </div>
            <div className="max-w-md">
              <h3 className="text-lg font-bold text-slate-100 mb-1">Talk to your Documents</h3>
              <p className="text-sm text-slate-400">
                Upload a document in the left panel, then ask any question here. LoKi will locate the facts and reply based only on your uploads.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((msg, idx) => {
              const isUser = msg.sender === 'user';
              return (
                <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-start space-x-3`}>
                  {/* Bot Avatar */}
                  {!isUser && (
                    <div className="h-8 w-8 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400 flex-shrink-0">
                      <Bot size={16} />
                    </div>
                  )}

                  {/* Bubble & Metadata */}
                  <div className="flex flex-col max-w-[85%] space-y-2">
                    <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-md ${
                      isUser
                        ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-none'
                        : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                      <span className="block text-[9px] text-slate-400/80 mt-1.5 text-right font-mono">
                        {msg.timestamp}
                      </span>
                    </div>

                    {/* Sources citation cards directly under the bot's response bubble */}
                    {!isUser && msg.sources && msg.sources.length > 0 && (
                      <div className="flex flex-col space-y-2 mt-2 pl-1">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Sources:</span>
                        <div className="grid grid-cols-1 gap-2">
                          {msg.sources.map((src, srcIdx) => (
                            <SourceCard
                              key={srcIdx}
                              source={src.source}
                              content={src.content}
                              chunkIndex={src.chunk_index}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Avatar */}
                  {isUser && (
                    <div className="h-8 w-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 flex-shrink-0">
                      <User size={16} />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Thinking indicator bubble */}
            {isThinking && (
              <div className="flex justify-start items-start space-x-3">
                <div className="h-8 w-8 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center text-indigo-400 flex-shrink-0">
                  <Bot size={16} />
                </div>
                <div className="flex flex-col space-y-1">
                  <div className="rounded-2xl bg-slate-900 border border-slate-800 px-4 py-3 text-sm text-slate-400 rounded-tl-none flex items-center space-x-2.5 shadow-md">
                    <Loader2 size={16} className="animate-spin text-indigo-400" />
                    <span className="font-medium animate-pulse">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input panel bar */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-800 bg-slate-900/50 flex items-center space-x-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isThinking}
          placeholder="Ask LoKi about your document content..."
          className="flex-1 bg-slate-950 text-slate-100 text-sm border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500/70 transition-colors placeholder:text-slate-500"
        />
        <button
          type="submit"
          disabled={!input.trim() || isThinking}
          className="h-11 w-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-indigo-600 focus:outline-none shadow-lg shadow-indigo-600/20 active:scale-95"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
