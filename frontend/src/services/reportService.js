import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('payroll_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ... (other exports) ...

// Export to Excel
export const exportExcel = async (month, year) => {
  const response = await api.get(`/reports/excel?month=${month}&year=${year}`, {
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Payroll_${month}_${year}.xlsx`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

// Dashboard Report
export const getDashboardSummary = (month, year) => api.get(`/reports/summary?month=${month}&year=${year}`);
