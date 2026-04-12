import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000'; // Assuming backend runs on 3000

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to include JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('payroll_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const login = (username, password) => api.post('/login', { username, password });
export const getEmployees = (search = '', page = 1, limit = 10) => api.get(`/employees?search=${search}&page=${page}&limit=${limit}`);
export const createEmployee = (data) => api.post('/employees', data);
export const updateEmployee = (id, data) => api.put(`/employees/${id}`, data);
export const deleteEmployee = (id) => api.delete(`/employees/${id}`);
// Vehicle Services
export const getVehicles = () => api.get('/vehicles');
export const createVehicle = (data) => api.post('/vehicles', data);
export const updateVehicle = (id, data) => api.put(`/vehicles/${id}`, data);
export const deleteVehicle = (id) => api.delete(`/vehicles/${id}`);
// Route Services
export const getRoutes = () => api.get('/routes');
export const createRoute = (data) => api.post('/routes', data);
export const updateRoute = (id, data) => api.put(`/routes/${id}`, data);
export const deleteRoute = (id) => api.delete(`/routes/${id}`);
// Schedule Services
export const getSchedules = () => api.get('/schedules');
export const updateSchedule = (data) => api.post('/schedules', data);

// Payslip Services
export const generatePayslips = (month, year) => api.get(`/payslips?month=${month}&year=${year}`);

export const downloadPayslipPDF = async (employeeId, month, year, thaiName) => {
  try {
    const response = await api.get(`/payslips/download?employeeId=${employeeId}&month=${month}&year=${year}`, {
      responseType: 'blob', // Important for handling binary data
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Payslip_${thaiName}_${month}_${year}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (error) {
    console.error('Error downloading PDF:', error);
    alert('ไม่สามารถดาวน์โหลด PDF ได้');
  }
};

// Report Services
export const generateTripReport = (month, year) => api.get(`/reports/trips?month=${month}&year=${year}`);
export const generatePaymentReport = (month, year) => api.get(`/reports/payments?month=${month}&year=${year}`);


export default api;
