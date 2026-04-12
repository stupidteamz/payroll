import React, { useState } from 'react';
import { generateTripReport, generatePaymentReport } from '../services/employeeService';
import * as XLSX from 'xlsx';

const ReportView = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [tripReport, setTripReport] = useState(null);
  const [paymentReport, setPaymentReport] = useState(null);

  const handleGenerateTripReport = async () => {
    const res = await generateTripReport(selectedMonth, selectedYear);
    setTripReport(res.data);
  };

  const handleGeneratePaymentReport = async () => {
    const res = await generatePaymentReport(selectedMonth, selectedYear);
    setPaymentReport(res.data);
  };

  const exportTripReportToExcel = () => {
    if (!tripReport) return alert('ไม่มีข้อมูล');
    const data = [{ 'หัวข้อ': 'จำนวนเที่ยวทั้งหมด', 'ค่า': tripReport.totalTrips }];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'TripReport');
    XLSX.writeFile(wb, 'Trip_Report.xlsx');
  };

  return (
    <div className="card">
      <h2>รายงานระบบ</h2>
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input type="number" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} />
        <input type="number" value={selectedYear} onChange={e => setSelectedYear(e.target.value)} />
      </div>
      <div style={{ display: 'flex', gap: '20px' }}>
        <div className="card" style={{ flex: 1 }}>
          <h3>รายงานการเดินรถ</h3>
          <button className="primary" onClick={handleGenerateTripReport}>สร้างรายงาน</button>
          <button className="primary" onClick={exportTripReportToExcel} style={{ marginLeft: '10px' }}>ส่งออก</button>
          {tripReport && <div style={{ marginTop: '10px' }}>จำนวนเที่ยวทั้งหมด: {tripReport.totalTrips}</div>}
        </div>
        <div className="card" style={{ flex: 1 }}>
          <h3>รายงานการจ่ายเงิน</h3>
          <button className="primary" onClick={handleGeneratePaymentReport}>สร้างรายงาน</button>
          {paymentReport && <div style={{ marginTop: '10px' }}>ยอดจ่ายสุทธิ: ฿{paymentReport.totalMonthlyPayroll.toLocaleString()}</div>}
        </div>
      </div>
    </div>
  );
};

export default ReportView;
