// frontend/src/api/client.js: Handles all Axios API calls including auth, threads, upload, chat, search, history, and file registry.

import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// Helper to build a client with the JWT Authorization header attached
const getAuthClient = () => {
  const token = localStorage.getItem('loki_auth_token');
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
};

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const signup = async (username, password) => {
  const res = await axios.post(`${API_BASE_URL}/auth/signup`, { username, password });
  return res.data;
};

export const login = async (username, password) => {
  const res = await axios.post(`${API_BASE_URL}/auth/login`, { username, password });
  return res.data;
};

// ─── Threads ──────────────────────────────────────────────────────────────────

export const fetchThreads = async () => {
  const res = await getAuthClient().get('/threads');
  return res.data;
};

export const createThread = async (threadId, title) => {
  const res = await getAuthClient().post('/threads', { thread_id: threadId, title });
  return res.data;
};

// ─── Upload ───────────────────────────────────────────────────────────────────

export const uploadFile = async (threadId, file, tag = '') => {
  const formData = new FormData();
  formData.append('file', file);
  const tagParam = tag ? `&tag=${encodeURIComponent(tag)}` : '';
  const res = await axios.post(
    `${API_BASE_URL}/upload?thread_id=${threadId}${tagParam}`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return res.data;
};

// ─── Chat ─────────────────────────────────────────────────────────────────────

export const sendMessage = async (threadId, question, tagFilter = null) => {
  const res = await axios.post(`${API_BASE_URL}/chat`, {
    thread_id: threadId,
    question,
    tag_filter: tagFilter || null
  });
  return res.data;
};

export const clearHistory = async (threadId) => {
  const res = await axios.delete(`${API_BASE_URL}/clear/${threadId}`);
  return res.data;
};

// ─── History & Files ──────────────────────────────────────────────────────────

export const fetchHistory = async (threadId) => {
  const res = await axios.get(`${API_BASE_URL}/history/${threadId}`);
  return res.data;
};

export const fetchFiles = async (threadId) => {
  const res = await axios.get(`${API_BASE_URL}/files/${threadId}`);
  return res.data;
};

// ─── Semantic Search ──────────────────────────────────────────────────────────

export const semanticSearch = async (threadId, query, tagFilter = null, k = 5) => {
  const res = await axios.post(`${API_BASE_URL}/search`, {
    thread_id: threadId,
    query,
    tag_filter: tagFilter || null,
    k
  });
  return res.data;
};

export default getAuthClient;
