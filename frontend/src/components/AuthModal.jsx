// frontend/src/components/AuthModal.jsx: Glassmorphic login and sign-up modal overlay with tab switching and form validation.

import React, { useState } from 'react';
import { X, LogIn, UserPlus, Eye, EyeOff, Loader2, Brain } from 'lucide-react';
import { login, signup } from '../api/client';

export default function AuthModal({ onAuthSuccess, onClose }) {
  const [tab, setTab] = useState('login'); // 'login' | 'signup'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Username and password are required');
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      // Call login or signup depending on the active tab
      const data = tab === 'login'
        ? await login(username, password)
        : await signup(username, password);

      // Persist auth token and user info in localStorage
      localStorage.setItem('loki_auth_token', data.token);
      localStorage.setItem('loki_username', data.username);
      localStorage.setItem('loki_user_id', String(data.user_id));

      onAuthSuccess(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl shadow-black/50 overflow-hidden">
        {/* Close button */}
        {onClose && (
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors z-10">
            <X size={20} />
          </button>
        )}

        {/* Header */}
        <div className="p-8 pb-6 text-center border-b border-slate-800 bg-gradient-to-b from-slate-900 to-slate-900/0">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 mx-auto mb-4">
            <Brain size={28} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Welcome to LoKi</h2>
          <p className="text-slate-400 text-sm mt-1">Your personal RAG knowledge assistant</p>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-800">
          {[['login', 'Sign In', LogIn], ['signup', 'Create Account', UserPlus]].map(([id, label, Icon]) => (
            <button
              key={id}
              onClick={() => { setTab(id); setError(''); }}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 text-sm font-semibold transition-colors ${
                tab === id
                  ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-500/5'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {/* Username field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full bg-slate-950 text-slate-100 text-sm border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500/70 transition-colors placeholder:text-slate-500"
            />
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-slate-950 text-slate-100 text-sm border border-slate-800 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-indigo-500/70 transition-colors placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-rose-950/30 border border-rose-900/50 text-rose-400 text-xs rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : null}
            <span>{isLoading ? 'Please wait...' : tab === 'login' ? 'Sign In' : 'Create Account'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
