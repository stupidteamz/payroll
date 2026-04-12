import { create } from 'zustand';
import { getEmployees, getVehicles, getRoutes, generatePaymentReport, login as loginApi } from '../services/employeeService';

const usePayrollStore = create((set, get) => ({
  token: localStorage.getItem('payroll_token') || null,
  employees: [],
  vehicles: [],
  routes: [],
  summary: { totalMonthlyPayroll: 0, totalOtPay: 0, totalSocialSecurity: 0 },
  loading: false,
  error: null,

  setToken: (token) => {
    if (token) localStorage.setItem('payroll_token', token);
    else localStorage.removeItem('payroll_token');
    set({ token });
  },

  login: async (username, password) => {
    try {
      const res = await loginApi(username, password);
      get().setToken(res.data.token);
      return true;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Login failed' });
      return false;
    }
  },

  logout: () => get().setToken(null),

  fetchData: async () => {
    set({ loading: true });
    try {
      const [empRes, vehRes, routeRes] = await Promise.all([
        getEmployees('', 1, 100),
        getVehicles(),
        getRoutes()
      ]);

      const now = new Date();
      const reportRes = await generatePaymentReport(now.getMonth() + 1, now.getFullYear());

      set({
        employees: empRes.data.data,
        vehicles: vehRes.data,
        routes: routeRes.data,
        summary: reportRes.data,
        loading: false
      });
    } catch (err) {
      set({ error: 'Failed to fetch data', loading: false });
      if (err.response?.status === 401 || err.response?.status === 403) {
        get().logout();
      }
    }
  },
}));

export default usePayrollStore;
