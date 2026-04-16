import React, { useState, useEffect } from 'react';
import usePayrollStore from '../store/payrollStore';
import { getSchedules, updateSchedule } from '../services/employeeService';
import '../Dashboard.css';

const MonthMatrix = () => {
  const { employees, routes, vehicles } = usePayrollStore();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedRouteId, setSelectedRouteId] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);

  const timeSlots = [
    '05.10 - 06.10',
    '06.20 - 07.40',
    '08.10 - 09.10',
    '17.10 - 18.10',
    '18.20 - 19.40',
    '20.10 - 21.10'
  ];

  useEffect(() => {
    if (selectedEmployeeId && selectedMonth && selectedYear) {
      fetchSchedules();
    }
  }, [selectedEmployeeId, selectedMonth, selectedYear]);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await getSchedules(selectedMonth, selectedYear, selectedEmployeeId);
      setSchedules(res.data);
    } catch (err) {
      console.error('Failed to fetch schedules');
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (month, year) => {
    const date = new Date(year, month - 1, 1);
    const days = [];
    while (date.getMonth() === month - 1) {
      days.push(new Date(date).toISOString().split('T')[0]);
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const days = getDaysInMonth(selectedMonth, selectedYear);

  const toggleTrip = async (date, timeSlot) => {
    if (!selectedRouteId || !selectedVehicleId || !selectedEmployeeId) {
      alert('กรุณาเลือก พนักงาน, เส้นทาง และยานพาหนะก่อน');
      return;
    }

    const existing = schedules.find(s => s.date === date && s.time_slot === timeSlot);
    const isScheduled = !existing;

    try {
      await updateSchedule({
        date,
        employeeId: selectedEmployeeId,
        routeId: selectedRouteId,
        vehicleId: selectedVehicleId,
        timeSlot,
        isScheduled,
        workType: 'regular' // Default for matrix view
      });
      fetchSchedules();
    } catch (err) {
      alert('Error updating schedule');
    }
  };

  const calculateTotals = () => {
    const totalTrips = schedules.length;
    const emp = employees.find(e => e.id === selectedEmployeeId);
    const pricePerTrip = emp ? Number(emp.price_per_trip) || 590 : 590;
    const totalBaht = totalTrips * pricePerTrip;
    return { totalTrips, pricePerTrip, totalBaht };
  };

  const stats = calculateTotals();

  return (
    <div className="card">
      <h2 style={{ marginBottom: '20px', color: '#1e2d45' }}>ตารางสรุปเที่ยววิ่งรายเดือน (Matrix View)</h2>
      
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="form-group">
          <label>พนักงาน</label>
          <select value={selectedEmployeeId} onChange={e => setSelectedEmployeeId(e.target.value)}>
            <option value="">เลือกพนักงาน</option>
            {employees.map(e => <option key={e.id} value={e.id}>{e.thaiName || e.thai_name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>เดือน</label>
          <input type="number" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} style={{ width: '60px' }} />
        </div>
        <div className="form-group">
          <label>ปี (ค.ศ.)</label>
          <input type="number" value={selectedYear} onChange={e => setSelectedYear(e.target.value)} style={{ width: '80px' }} />
        </div>
        <div className="form-group">
          <label>เส้นทางหลัก</label>
          <select value={selectedRouteId} onChange={e => setSelectedRouteId(e.target.value)}>
            <option value="">เลือกเส้นทาง</option>
            {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>ยานพาหนะหลัก</label>
          <select value={selectedVehicleId} onChange={e => setSelectedVehicleId(e.target.value)}>
            <option value="">เลือกรถ</option>
            {vehicles.map(v => <option key={v.id} value={v.id}>{v.plateNumber || v.plate_number}</option>)}
          </select>
        </div>
      </div>

      {loading ? <p>กำลังโหลด...</p> : (
        <div style={{ overflowX: 'auto' }}>
          <table className="matrix-table">
            <thead>
              <tr>
                <th style={{ width: '150px' }}>วันที่ / สายวิ่ง</th>
                {timeSlots.map(slot => <th key={slot}>{slot}</th>)}
                <th>รวม</th>
              </tr>
            </thead>
            <tbody>
              {days.map(date => {
                const dayTrips = schedules.filter(s => s.date === date);
                return (
                  <tr key={date}>
                    <td style={{ textAlign: 'left', fontWeight: 'bold' }}>
                      {new Date(date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' })}
                    </td>
                    {timeSlots.map(slot => (
                      <td key={slot} onClick={() => toggleTrip(date, slot)} style={{ cursor: 'pointer', background: dayTrips.some(s => s.time_slot === slot) ? '#dcfce7' : 'transparent' }}>
                        {dayTrips.some(s => s.time_slot === slot) ? '1' : ''}
                      </td>
                    ))}
                    <td style={{ background: '#f8fafc', fontWeight: 'bold' }}>{dayTrips.length || ''}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ background: '#f1f5f9', fontWeight: 'bold' }}>
                <td>รวมทั้งหมด</td>
                {timeSlots.map(slot => (
                  <td key={slot}>{schedules.filter(s => s.time_slot === slot).length}</td>
                ))}
                <td style={{ background: '#e2e8f0', fontSize: '1.2em' }}>{stats.totalTrips}</td>
              </tr>
            </tfoot>
          </table>

          <div style={{ marginTop: '20px', padding: '15px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', textAlign: 'center' }}>
              <div>
                <p style={{ color: '#64748b', fontSize: '0.9em' }}>จำนวนเที่ยวทั้งหมด</p>
                <p style={{ fontSize: '1.5em', fontWeight: 'bold' }}>{stats.totalTrips}</p>
              </div>
              <div>
                <p style={{ color: '#64748b', fontSize: '0.9em' }}>ราคา/เที่ยว</p>
                <p style={{ fontSize: '1.5em', fontWeight: 'bold' }}>฿{stats.pricePerTrip.toLocaleString()}</p>
              </div>
              <div>
                <p style={{ color: '#64748b', fontSize: '0.9em' }}>ค่าปรับ</p>
                <p style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#ef4444' }}>฿0</p>
              </div>
              <div>
                <p style={{ color: '#64748b', fontSize: '0.9em' }}>รวมเงิน</p>
                <p style={{ fontSize: '1.5em', fontWeight: 'bold', color: '#10b981' }}>฿{stats.totalBaht.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthMatrix;
