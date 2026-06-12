// frontend/src/components/FileUpload.jsx: Premium drag-and-drop file upload with vector icons and dynamic file index states.

import React, { useState, useRef } from 'react';
import { FileText, CheckCircle2, AlertCircle, Loader2, CloudUpload, Trash2 } from 'lucide-react';
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
      setUploadState({ status: 'error', message: 'Only PDF and TXT files are supported.', filename: file.name });
      return;
    }
    setUploadState({ status: 'uploading', message: 'Parsing pages & building FAISS index...', filename: file.name });
    try {
      const data = await uploadFile(threadId, file);
      setUploadState({ status: 'success', message: data.message || `Successfully indexed ${file.name}`, filename: file.name });
      if (onUploadSuccess) onUploadSuccess();
    } catch (err) {
      setUploadState({ status: 'error', message: err.response?.data?.detail || 'Vector index compilation failed.', filename: file.name });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all duration-300 group ${
          dragActive
            ? 'border-indigo-400 bg-indigo-50/50 scale-[1.01]'
            : 'border-slate-200/80 bg-white/50 hover:border-indigo-300 hover:bg-indigo-50/10'
        }`}
      >
        <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.txt" onChange={handleChange} />

        <div className={`h-10.5 w-10.5 rounded-xl flex items-center justify-center mb-2.5 transition-all duration-300 ${
          dragActive
            ? 'bg-indigo-100 text-indigo-600 scale-105'
            : 'bg-indigo-50 text-indigo-500 group-hover:scale-105'
        }`}>
          <CloudUpload size={20} />
        </div>

        <p className="text-xs font-bold text-slate-600 mb-0.5">
          Drop files here or <span className="text-indigo-500 hover:underline">browse</span>
        </p>
        <p className="text-[10px] text-slate-400">Supports PDF & TXT — up to 10MB</p>
      </div>

      {/* Upload State Alerts */}
      {uploadState.status !== 'idle' && (
        <div className={`p-3 rounded-xl flex items-start gap-2.5 animate-fade-in text-xs ${
          uploadState.status === 'uploading' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100/50' :
          uploadState.status === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/50' :
          'bg-red-50 text-red-600 border border-red-100/50'
        }`}>
          {uploadState.status === 'uploading' && <Loader2 size={14} className="animate-spin mt-0.5 text-indigo-500 flex-shrink-0" />}
          {uploadState.status === 'success' && <CheckCircle2 size={14} className="mt-0.5 text-emerald-500 flex-shrink-0" />}
          {uploadState.status === 'error' && <AlertCircle size={14} className="mt-0.5 text-red-500 flex-shrink-0" />}
          <div className="min-w-0">
            <p className="font-bold text-[11px] truncate">{uploadState.filename}</p>
            <p className="text-[10px] opacity-80 mt-0.5">{uploadState.message}</p>
          </div>
        </div>
      )}

      {/* Uploaded Documents List */}
      <div className="flex flex-col gap-2">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-0.5">Files in Current Session</h3>
        {uploadedFiles.length === 0 ? (
          <div className="border border-dashed border-slate-200/80 rounded-xl p-4 text-center text-slate-400 text-xs bg-white/35">
            No source documents uploaded
          </div>
        ) : (
          <div className="max-h-[160px] overflow-y-auto pr-0.5 gap-1.5 flex flex-col custom-scrollbar">
            {uploadedFiles.map((f, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/80 border border-slate-100/80 hover:shadow-sm hover:border-slate-200/60 transition-all duration-200 animate-fade-in"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-7 w-7 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center flex-shrink-0">
                    <FileText size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-700 truncate">{f.name}</p>
                    <p className="text-[9px] text-slate-400">{f.size || 'Size unknown'}</p>
                  </div>
                </div>
                <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100/50 flex-shrink-0">
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
