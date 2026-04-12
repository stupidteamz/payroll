import React from 'react';

const Dashboard = ({ employees, summary }) => {
  return (
    <div>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">พนักงานทั้งหมด</div>
          <div className="stat-value">{employees.length} คน</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">เงินเดือนรวมเดือนนี้</div>
          <div className="stat-value">฿{summary.totalMonthlyPayroll?.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">OT รวมเดือนนี้</div>
          <div className="stat-value">฿{summary.totalOtPay?.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">ประกันสังคมรวม</div>
          <div className="stat-value">฿{summary.totalSocialSecurity?.toLocaleString()}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px' }}>
        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>พนักงานล่าสุด</h3>
          <table>
            <thead>
              <tr><th>ชื่อ-นามสกุล</th><th>ตำแหน่ง</th><th>เงินเดือน</th></tr>
            </thead>
            <tbody>
              {employees.slice(0, 5).map(emp => (
                <tr key={emp.id}>
                  <td>{emp.thaiName}</td>
                  <td>{emp.position}</td>
                  <td>฿{emp.salary?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card">
          <h3 style={{ marginBottom: '16px' }}>สรุปสถานะ</h3>
          <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
            <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>ระบบฐานข้อมูล</span> <span style={{ color: '#22c55e', fontWeight: '600' }}>SQLite (เสถียร)</span>
            </p>
            <p style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>การเชื่อมต่อ API</span> <span style={{ color: '#22c55e', fontWeight: '600' }}>เชื่อมต่อแล้ว</span>
            </p>
            <p style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>ความปลอดภัย</span> <span style={{ color: '#22c55e', fontWeight: '600' }}>JWT Active</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
