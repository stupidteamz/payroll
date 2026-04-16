import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import usePayrollStore from './store/payrollStore';
import Dashboard from './components/Dashboard';
import EmployeeList from './components/EmployeeList';
import ScheduleMatrix from './components/ScheduleMatrix';
import MonthMatrix from './components/MonthMatrix';
import VehicleList from './components/VehicleList';
import RouteList from './components/RouteList';
import PayslipView from './components/PayslipView';
import ReportView from './components/ReportView';
import Login from './components/Login';
import './Dashboard.css';

function Layout() {
  const location = useLocation();
  const { token, employees, vehicles, routes, summary, fetchData, logout } = usePayrollStore();

  useEffect(() => {
    if (token) fetchData();
  }, [token, fetchData]);

  const isActive = (path) => location.pathname === path ? 'nav-item active' : 'nav-item';

  if (!token) return <Login />;

  const getTitle = () => {
    switch (location.pathname) {
      case '/': return 'แดชบอร์ด';
      case '/employees': return 'จัดการพนักงาน';
      case '/schedule': return 'จัดการตารางงาน';
      case '/matrix': return 'ตารางสรุปรายเดือน';
      case '/vehicles': return 'จัดการยานพาหนะ';
      case '/routes': return 'จัดการเส้นทาง';
      case '/payslips': return 'สร้างสลิปเงินเดือน';
      case '/reports': return 'รายงาน';
      default: return 'ระบบจัดการเงินเดือน';
    }
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="logo">ดาวรุ่ง ทราเวล</div>
        <div className="nav">
          <Link to="/" className={isActive('/')}>📊 แดชบอร์ด</Link>
          <Link to="/employees" className={isActive('/employees')}>👥 พนักงาน</Link>
          <Link to="/schedule" className={isActive('/schedule')}>📅 ตารางงาน (รายวัน)</Link>
          <Link to="/matrix" className={isActive('/matrix')}>📅 ตารางงาน (รายเดือน)</Link>
          <Link to="/vehicles" className={isActive('/vehicles')}>🚛 ยานพาหนะ</Link>
          <Link to="/routes" className={isActive('/routes')}>📍 เส้นทาง</Link>
          <Link to="/payslips" className={isActive('/payslips')}>💰 สลิปเงินเดือน</Link>
          <Link to="/reports" className={isActive('/reports')}>📄 รายงาน</Link>
          <button onClick={logout} style={{ marginTop: '20px', background: 'transparent', color: '#ef4444', textAlign: 'left', padding: '12px 16px', width: '100%', cursor: 'pointer' }}>🚪 ออกจากระบบ</button>
        </div>
      </div>
      <div className="main-content">
        <div className="topbar">
          <div style={{ fontSize: '18px', fontWeight: '600' }}>{getTitle()}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '14px', color: '#64748b' }}>ยินดีต้อนรับ, พี่เอฟ</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>เอฟ</div>
          </div>
        </div>
        <div className="scroll-area">
          <Routes>
            <Route path="/" element={<Dashboard employees={employees} summary={summary} />} />
            <Route path="/employees" element={<EmployeeList employees={employees} fetchData={fetchData} />} />
            <Route path="/schedule" element={<ScheduleMatrix employees={employees} routes={routes} vehicles={vehicles} fetchData={fetchData} />} />
            <Route path="/matrix" element={<MonthMatrix />} />
            <Route path="/vehicles" element={<VehicleList vehicles={vehicles} fetchData={fetchData} />} />
            <Route path="/routes" element={<RouteList routes={routes} fetchData={fetchData} />} />
            <Route path="/payslips" element={<PayslipView />} />
            <Route path="/reports" element={<ReportView />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  </React.StrictMode>
);
