import React from 'react';
import { exportExcel } from '../services/reportService';

const Dashboard = ({ employees, summary }) => {
  const isPostgres = window.location.hostname !== 'localhost';

  const handleExport = () => {
    const now = new Date();
    exportExcel(now.getMonth() + 1, now.getFullYear());
  };

  return (
    <div className="main-view">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>ภาพรวมระบบเงินเดือน</h2>
        <button className="primary" onClick={handleExport}>
          📥 ส่งออก Excel
        </button>
      </div>

      <div className="stat-grid">
        <div className="stat-card" style={{ borderLeftColor: '#10b981' }}>
          <div className="stat-label">พนักงานทั้งหมด</div>
          <div className="stat-value">{employees.length} <span style={{ fontSize: '1rem', fontWeight: 'normal' }}>คน</span></div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#3b82f6' }}>
          <div className="stat-label">เงินเดือนรวมเดือนนี้</div>
          <div className="stat-value">฿{summary.totalMonthlyPayroll?.toLocaleString()}</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#f59e0b' }}>
          <div className="stat-label">OT รวมเดือนนี้</div>
          <div className="stat-value">฿{summary.totalOtPay?.toLocaleString()}</div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#ef4444' }}>
          <div className="stat-label">ประกันสังคมรวม</div>
          <div className="stat-value">฿{summary.totalSocialSecurity?.toLocaleString()}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>พนักงานล่าสุด</h3>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>แสดง 5 รายการล่าสุด</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>ชื่อ-นามสกุล</th>
                <th>ตำแหน่ง</th>
                <th>เงินเดือน</th>
              </tr>
            </thead>
            <tbody>
              {employees.slice(0, 5).map(emp => (
                <tr key={emp.id}>
                  <td style={{ fontWeight: '500' }}>{emp.thaiName}</td>
                  <td><span className="badge" style={{ background: '#f1f5f9', color: '#475569' }}>{emp.position}</span></td>
                  <td style={{ fontWeight: '600', color: '#0f172a' }}>฿{emp.salary?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ margin: 0 }}>สถานะระบบ</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>โหมดการทำงาน</span>
                <span style={{ color: '#10b981', fontWeight: '600', fontSize: '0.9rem' }}>
                  {isPostgres ? 'Production (Render)' : 'Local Dev'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>ระบบฐานข้อมูล</span>
                <span style={{ color: '#3b82f6', fontWeight: '600', fontSize: '0.9rem' }}>
                  {isPostgres ? 'PostgreSQL' : 'SQLite'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>การเชื่อมต่อ API</span>
                <span style={{ color: '#10b981', fontWeight: '600', fontSize: '0.9rem' }}>Active</span>
              </div>
            </div>
            
            <div style={{ padding: '16px', background: '#ecfdf5', borderRadius: '12px', border: '1px solid #d1fae5' }}>
              <p style={{ color: '#065f46', fontSize: '0.85rem', fontWeight: '500' }}>
                💡 ระบบรันอยู่บนโครงสร้างความปลอดภัยสูง พร้อมระบบสำรองข้อมูลอัตโนมัติ
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
