import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getAllPatents = async () => {
  const response = await api.get('/api/patents');
  return response.data;
};

export const getPatentById = async (id) => {
  const response = await api.get(`/api/patents/${id}`);
  return response.data;
};

export const addPatent = async (patentData) => {
  const response = await api.post('/api/patents', patentData);
  return response.data;
};

export const updatePatent = async (id, patentData) => {
  const response = await api.put(`/api/patents/${id}`, patentData);
  return response.data;
};

export const deletePatent = async (id) => {
  const response = await api.delete(`/api/patents/${id}`);
  return response.data;
};

export const getPatentAnalysis = async (params = {}) => {
  const response = await api.get('/api/patents/analysis/summary', { params });
  return response.data;
};
