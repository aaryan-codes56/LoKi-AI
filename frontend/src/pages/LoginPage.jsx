// frontend/src/pages/LoginPage.jsx: Dedicated login page with premium card layout and navigation links.

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';
import { login } from '../api/client';

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) { setError('All fields are required'); return; }
    setLoading(true);
    setError('');
    try {
      const data = await login(username, password);
      localStorage.setItem('loki_auth_token', data.token);
      localStorage.setItem('loki_username', data.username);
      localStorage.setItem('loki_user_id', String(data.user_id));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-indigo-50/30 to-violet-50/30 flex items-center justify-center p-4 font-['Inter',sans-serif]">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center space-x-2.5 mb-8">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Sparkles size={20} className="text-white" />
          </div>
          <span className="font-extrabold text-xl gradient-text">LoKi</span>
        </Link>

        {/* Card */}
        <div className="glass-card-strong rounded-3xl p-7 sm:p-8 shadow-xl">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Welcome back</h1>
            <p className="text-sm text-slate-400 mt-1">Sign in to access your knowledge sessions</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Username</label>
              <input
                type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="mt-1.5 w-full bg-slate-50 text-slate-700 text-sm border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Password</label>
              <div className="relative mt-1.5">
                <input
                  type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-slate-50 text-slate-700 text-sm border border-slate-200 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 transition-all placeholder:text-slate-400"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-medium rounded-xl px-4 py-2.5 animate-fade-in">
                {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="font-bold text-indigo-500 hover:text-indigo-600 transition-colors">Create one</Link>
          </p>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          <Link to="/dashboard" className="hover:text-slate-600 transition-colors">Continue without account →</Link>
        </p>
      </div>
    </div>
  );
}
