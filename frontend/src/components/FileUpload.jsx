// frontend/src/components/FileUpload.jsx: Drag-and-drop document upload panel with file lists, type checking, and progress feedback.

import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { uploadFile } from '../api/client';

export default function FileUpload({ onUploadSuccess, threadId, uploadedFiles = [] }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadState, setUploadState] = useState({ status: 'idle', message: '', filename: '' });
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file) => {
    if (!file) return;
    
    // Check file extensions (PDF and TXT supported)
    const fileNameLower = file.name.toLowerCase();
    const isPDF = fileNameLower.endsWith('.pdf');
    const isTXT = fileNameLower.endsWith('.txt');
    
    if (!isPDF && !isTXT) {
      setUploadState({
        status: 'error',
        message: 'Only PDF and TXT files are allowed.',
        filename: file.name
      });
      return;
    }

    setUploadState({ status: 'uploading', message: 'Ingesting file & building vector store...', filename: file.name });
    
    try {
      // Send upload request to FastAPI backend
      const data = await uploadFile(threadId, file);
      
      setUploadState({
        status: 'success',
        message: data.message || `Successfully parsed ${file.name}`,
        filename: file.name
      });
      
      // Notify parent to fetch updated list of documents from backend
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (err) {
      console.error(err);
      setUploadState({
        status: 'error',
        message: err.response?.data?.detail || 'Failed to upload and ingest file. Please check backend log.',
        filename: file.name
      });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* Drag and Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
          dragActive 
            ? 'border-indigo-500 bg-indigo-500/5' 
            : 'border-slate-800 bg-slate-900/30 hover:border-slate-700 hover:bg-slate-900/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.txt"
          onChange={handleChange}
        />
        
        <div className="h-12 w-12 rounded-xl bg-slate-900/80 flex items-center justify-center border border-slate-800 text-slate-400 mb-4 shadow-inner">
          <Upload size={24} className="text-indigo-400" />
        </div>
        
        <p className="text-sm text-slate-200 font-medium mb-1">
          Drag & drop your document here, or{' '}
          <button onClick={onButtonClick} className="text-indigo-400 hover:underline focus:outline-none">
            browse
          </button>
        </p>
        <p className="text-xs text-slate-500">Supports PDF or TXT up to 10MB</p>
      </div>

      {/* Upload Progress Status Indicator */}
      {uploadState.status !== 'idle' && (
        <div className={`p-4 rounded-xl flex items-start space-x-3 border ${
          uploadState.status === 'uploading' ? 'bg-slate-900/50 border-slate-800 text-slate-300' :
          uploadState.status === 'success' ? 'bg-emerald-950/20 border-emerald-900/50 text-emerald-400' :
          'bg-rose-950/20 border-rose-900/50 text-rose-400'
        }`}>
          {uploadState.status === 'uploading' && <Loader2 size={18} className="animate-spin mt-0.5 text-indigo-400" />}
          {uploadState.status === 'success' && <CheckCircle2 size={18} className="mt-0.5 text-emerald-400" />}
          {uploadState.status === 'error' && <AlertCircle size={18} className="mt-0.5 text-rose-400" />}
          
          <div className="flex-1 text-sm">
            <p className="font-semibold text-slate-200">{uploadState.filename}</p>
            <p className="text-xs opacity-90 mt-0.5">{uploadState.message}</p>
          </div>
        </div>
      )}

      {/* Uploaded Documents List */}
      <div className="flex flex-col space-y-3">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Documents</h3>
        {uploadedFiles.length === 0 ? (
          <div className="border border-slate-800/80 rounded-xl p-4 text-center text-slate-500 text-sm bg-slate-950/10">
            No documents uploaded to this thread yet.
          </div>
        ) : (
          <div className="max-h-48 overflow-y-auto pr-1 space-y-2 custom-scrollbar">
            {uploadedFiles.map((f, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-800/60 hover:bg-slate-900/60 transition-all duration-200">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
                    <FileText size={16} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{f.name}</p>
                    <p className="text-xs text-slate-500">{f.size}</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-950/30 text-indigo-400 border border-indigo-900/50">
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
