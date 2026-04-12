import React, { useState } from 'react';
import { generatePayslips, downloadPayslipPDF } from '../services/employeeService';
import * as XLSX from 'xlsx';

const PayslipView = () => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [payslips, setPayslips] = useState([]);
  const [loadingPdf, setLoadingPdf] = useState(null);

  const handleGeneratePayslips = async () => {
    try {
      const res = await generatePayslips(selectedMonth, selectedYear);
      setPayslips(res.data);
    } catch (error) {
      console.error('Error generating payslips:', error);
      alert('ไม่สามารถสร้างสลิปเงินเดือนได้');
    }
  };

  const handleDownloadPdf = async (employeeId, thaiName) => {
    setLoadingPdf(employeeId);
    await downloadPayslipPDF(employeeId, selectedMonth, selectedYear, thaiName);
    setLoadingPdf(null);
  };

  const exportPayslipsToExcel = () => {
    if (payslips.length === 0) return alert('ไม่มีข้อมูล');
    const ws = XLSX.utils.json_to_sheet(payslips);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Payslips');
    XLSX.writeFile(wb, 'Payslips_Report.xlsx');
  };

  return (
    <div className="card">
      <h2>สร้างสลิปเงินเดือน</h2>
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input type="number" placeholder="เดือน" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} />
        <input type="number" placeholder="ปี" value={selectedYear} onChange={e => setSelectedYear(e.target.value)} />
        <button className="primary" onClick={handleGeneratePayslips}>สร้างสลิป</button>
        <button className="primary" onClick={exportPayslipsToExcel}>ส่งออก Excel</button>
      </div>
      <table>
        <thead>
          <tr><th>รหัสพนักงาน</th><th>ชื่อ-นามสกุล</th><th>รายรับสุทธิ</th><th>PDF</th></tr>
        </thead>
        <tbody>
          {payslips.map((ps, idx) => (
            <tr key={idx}>
              <td>{ps.employeeId}</td>
              <td>{ps.thaiName}</td>
              <td>฿{ps.netSalary?.toLocaleString()}</td>
              <td>
                <button 
                  className="secondary small" 
                  onClick={() => handleDownloadPdf(ps.employeeId, ps.thaiName)}
                  disabled={loadingPdf === ps.employeeId}
                >
                  {loadingPdf === ps.employeeId ? '...' : '📥 PDF'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PayslipView;
