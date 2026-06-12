// frontend/src/pages/SignupPage.jsx: Premium split-pane signup page with custom technical stats and secure form components.

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Eye, EyeOff, Loader2, Sparkles, Database, Shield, Zap } from 'lucide-react';
import { signup } from '../api/client';

export default function SignupPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) { setError('All fields are required'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    setError('');
    try {
      const data = await signup(username, password);
      localStorage.setItem('loki_auth_token', data.token);
      localStorage.setItem('loki_username', data.username);
      localStorage.setItem('loki_user_id', String(data.user_id));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Choose a different username or try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 font-['Inter',sans-serif] bg-[#f8fafc] overflow-hidden relative">
      
      {/* Background Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-indigo-300/10 to-violet-300/10 blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-pink-300/10 to-purple-300/10 blur-[100px] pointer-events-none z-0" />

      {/* Left Pane: Marketing Showcase (Desktop only) */}
      <div className="hidden lg:flex lg:col-span-5 relative bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950 text-white flex-col justify-between p-12 overflow-hidden shadow-2xl z-10">
        
        {/* Decorative Grid Lines */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Brand */}
        <Link to="/" className="flex items-center space-x-2.5 relative z-10">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Sparkles size={17} className="text-white" />
          </div>
          <span className="font-extrabold text-lg tracking-tight text-white">LoKi</span>
        </Link>

        {/* Info list */}
        <div className="space-y-10 my-auto relative z-10">
          <div className="space-y-3.5">
            <h2 className="text-3xl font-black tracking-tight leading-snug">
              Construct Your <br />
              <span className="text-indigo-400">AI Knowledge Brain.</span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Register in seconds to organize your files, query source material, filter by custom tags, and access saved threads.
            </p>
          </div>

          <div className="space-y-5">
            {[
              { icon: Zap, title: "Lightning FAISS Retrieval", desc: "Index and match query segments in under 10 milliseconds." },
              { icon: Database, title: "Structured SQLite Threads", desc: "Keep separate logs for personal, work, or research projects." },
              { icon: Shield, title: "Zero-Trust Data Hashing", desc: "Your user account is securely salt-hashed and authenticated." }
            ].map((item, idx) => (
              <div key={idx} className="flex items-start space-x-3.5 group">
                <div className="h-9 w-9 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform flex-shrink-0">
                  <item.icon size={16} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-200">{item.title}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-[11px] text-slate-500">Built as an original portfolio project demonstrating production-grade RAG architecture.</p>
        </div>
      </div>

      {/* Right Pane: Form */}
      <div className="lg:col-span-7 flex flex-col justify-center items-center px-4 sm:px-12 py-16 relative z-10">
        
        {/* Mobile Header */}
        <Link to="/" className="lg:hidden flex items-center space-x-2.5 mb-8">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="font-extrabold text-lg gradient-text">LoKi</span>
        </Link>

        {/* Sign Up Form Card */}
        <div className="glass-panel-strong w-full max-w-[440px] rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-200/60">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Create your account</h1>
            <p className="text-xs text-slate-400 mt-1.5">Get started with a premium user account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4.5">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-0.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                className="mt-1.5 w-full premium-input text-slate-700 text-xs rounded-xl px-4 py-3.5 focus:outline-none placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-0.5">Password</label>
              <div className="relative mt-1.5">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password (min 6 chars)"
                  className="w-full premium-input text-slate-700 text-xs rounded-xl px-4 py-3.5 pr-10 focus:outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-0.5">Confirm Password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirm password"
                className="mt-1.5 w-full premium-input text-slate-700 text-xs rounded-xl px-4 py-3.5 focus:outline-none placeholder:text-slate-400"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-xs font-semibold rounded-xl px-4 py-3 animate-fade-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] mt-3 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <UserPlus size={14} />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>

          {/* Nav links */}
          <div className="text-center mt-6.5 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-indigo-500 hover:text-indigo-600 transition-colors">
                Sign in
              </Link>
            </p>
            <p className="mt-3.5">
              <Link to="/dashboard" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
                Continue without account →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
