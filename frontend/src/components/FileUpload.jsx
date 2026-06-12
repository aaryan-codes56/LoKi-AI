// frontend/src/components/FileUpload.jsx: Premium light-mode drag-and-drop upload panel with animated states and file list.

import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, CloudUpload } from 'lucide-react';
import { uploadFile } from '../api/client';

export default function FileUpload({ onUploadSuccess, threadId, uploadedFiles = [] }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadState, setUploadState] = useState({ status: 'idle', message: '', filename: '' });
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const processFile = async (file) => {
    if (!file) return;
    const fn = file.name.toLowerCase();
    if (!fn.endsWith('.pdf') && !fn.endsWith('.txt')) {
      setUploadState({ status: 'error', message: 'Only PDF and TXT files are allowed.', filename: file.name });
      return;
    }
    setUploadState({ status: 'uploading', message: 'Building knowledge index...', filename: file.name });
    try {
      const data = await uploadFile(threadId, file);
      setUploadState({ status: 'success', message: data.message || `Indexed ${file.name}`, filename: file.name });
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      setUploadState({ status: 'error', message: err.response?.data?.detail || 'Upload failed.', filename: file.name });
    }
  };

  const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]); };
  const handleChange = (e) => { e.preventDefault(); if (e.target.files?.[0]) processFile(e.target.files[0]); };

  return (
    <div className="flex flex-col space-y-5">
      {/* Drop Zone */}
      <div
        onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-7 text-center cursor-pointer transition-all duration-300 group ${
          dragActive
            ? 'border-indigo-400 bg-indigo-50/80 scale-[1.02]'
            : 'border-slate-200 bg-white/40 hover:border-indigo-300 hover:bg-indigo-50/30'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.txt" onChange={handleChange} />

        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-3 transition-all duration-300 ${
          dragActive
            ? 'bg-indigo-100 text-indigo-600 scale-110'
            : 'bg-gradient-to-br from-indigo-50 to-violet-50 text-indigo-400 group-hover:scale-105'
        }`}>
          <CloudUpload size={24} />
        </div>

        <p className="text-sm font-semibold text-slate-600 mb-0.5">
          Drop your file here or <span className="text-indigo-500">browse</span>
        </p>
        <p className="text-[11px] text-slate-400">Supports PDF and TXT — up to 10MB</p>
      </div>

      {/* Status */}
      {uploadState.status !== 'idle' && (
        <div className={`p-3.5 rounded-xl flex items-start space-x-3 animate-fade-in text-sm ${
          uploadState.status === 'uploading' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
          uploadState.status === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
          'bg-red-50 text-red-600 border border-red-100'
        }`}>
          {uploadState.status === 'uploading' && <Loader2 size={16} className="animate-spin mt-0.5 text-indigo-500 flex-shrink-0" />}
          {uploadState.status === 'success' && <CheckCircle2 size={16} className="mt-0.5 text-emerald-500 flex-shrink-0" />}
          {uploadState.status === 'error' && <AlertCircle size={16} className="mt-0.5 text-red-500 flex-shrink-0" />}
          <div className="min-w-0">
            <p className="font-semibold text-[13px]">{uploadState.filename}</p>
            <p className="text-[11px] opacity-80 mt-0.5">{uploadState.message}</p>
          </div>
        </div>
      )}

      {/* Documents */}
      <div className="space-y-2.5">
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Knowledge Base</h3>
        {uploadedFiles.length === 0 ? (
          <div className="border border-dashed border-slate-200 rounded-xl p-4 text-center text-slate-400 text-xs bg-white/30">
            No documents uploaded yet
          </div>
        ) : (
          <div className="max-h-44 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
            {uploadedFiles.map((f, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/60 border border-slate-100 hover:shadow-md hover:shadow-indigo-500/5 transition-all duration-200 animate-fade-in">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center text-indigo-500 flex-shrink-0">
                    <FileText size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-slate-700 truncate">{f.name}</p>
                    <p className="text-[10px] text-slate-400">{f.size || 'Local'}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-500 border border-indigo-100 flex-shrink-0">
                  {f.chunks} chunks
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
