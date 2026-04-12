import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('payroll_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ... (other exports) ...

// Dashboard Report
export const getDashboardSummary = (month, year) => api.get(`/reports/summary?month=${month}&year=${year}`);
