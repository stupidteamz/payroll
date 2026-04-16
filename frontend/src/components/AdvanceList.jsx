import React, { useState, useEffect } from 'react';
import usePayrollStore from '../store/payrollStore';
import api from '../services/employeeService';

const AdvanceList = () => {
  const { employees } = usePayrollStore();
  const [advances, setAdvances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    amount: '',
    notes: ''
  });

  useEffect(() => {
    fetchAdvances();
  }, []);

  const fetchAdvances = async () => {
    setLoading(true);
    try {
      const res = await api.get('/advances');
      setAdvances(res.data);
    } catch (err) {
      console.error('Failed to fetch advances');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employeeId || !formData.amount) return alert('กรุณากรอกข้อมูลให้ครบ');
    
    try {
      await api.post('/advances', formData);
      setFormData({ ...formData, amount: '', notes: '' });
      fetchAdvances();
      alert('บันทึกเงินเบิกสำเร็จ');
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการบันทึก');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('ยืนยันการลบรายการนี้?')) return;
    try {
      await api.delete(`/advances/${id}`);
      fetchAdvances();
    } catch (err) {
      alert('ลบไม่สำเร็จ');
    }
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: '20px' }}>จัดการเงินเบิกรายสัปดาห์</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '30px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div className="form-group">
          <label>พนักงาน</label>
          <select value={formData.employeeId} onChange={e => setFormData({...formData, employeeId: e.target.value})}>
            <option value="">เลือกพนักงาน</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.thaiName || e.thai_name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>วันที่เบิก</label>
          <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
        </div>
        <div className="form-group">
          <label>จำนวนเงิน (บาท)</label>
          <input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} placeholder="0.00" />
        </div>
        <div className="form-group">
          <label>หมายเหตุ</label>
          <input type="text" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="ระบุเหตุผล (ถ้ามี)" />
        </div>
        <button type="submit" className="primary" style={{ height: '38px' }}>เพิ่มรายการ</button>
      </form>

      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>วันที่</th>
              <th>ชื่อพนักงาน</th>
              <th>จำนวนเงิน</th>
              <th>หมายเหตุ</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="5">กำลังโหลด...</td></tr> : advances.map(a => (
              <tr key={a.id}>
                <td>{new Date(a.date).toLocaleDateString('th-TH')}</td>
                <td>{a.Employee?.thai_name}</td>
                <td style={{ fontWeight: 'bold', color: '#ef4444' }}>฿{Number(a.amount).toLocaleString()}</td>
                <td>{a.notes || '-'}</td>
                <td>
                  <button className="delete" onClick={() => handleDelete(a.id)}>ลบ</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdvanceList;
