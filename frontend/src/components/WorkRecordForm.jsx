import React, { useState, useEffect } from 'react';
import axios from 'axios';
import usePayrollStore from '../store/payrollStore';

function WorkRecordForm() {
  const [formData, setFormData] = useState({
    employee_id: '',
    date: new Date().toISOString().split('T')[0],
    type: 'Regular',
    trips: 0,
    rate: 590
  });

  const { employees, routes, fetchData } = usePayrollStore();

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/payroll/record`, formData);
      alert('บันทึกข้อมูลเรียบร้อย!');
    } catch (err) {
      alert('เกิดข้อผิดพลาด: ' + err.message);
    }
  };

  return (
    <div className="card">
      <h3>บันทึกรายการวิ่งรถ (สายบ้านทา)</h3>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
        <select onChange={e => setFormData({...formData, employee_id: e.target.value})}>
          <option value="">เลือกพนักงาน</option>
          {employees.map(e => <option key={e.id} value={e.id}>{e.thaiName}</option>)}
        </select>
        
        <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
        
        <input type="number" placeholder="จำนวนเที่ยว" onChange={e => setFormData({...formData, trips: e.target.value})} />
        
        <input type="number" placeholder="อัตราต่อเที่ยว" value={formData.rate} onChange={e => setFormData({...formData, rate: e.target.value})} />
        
        <button className="primary" type="submit">บันทึกรายการ</button>
      </form>
    </div>
  );
}

export default WorkRecordForm;
