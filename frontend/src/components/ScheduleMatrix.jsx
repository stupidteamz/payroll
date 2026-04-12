import { useState, useEffect } from 'react'
import usePayrollStore from '../store/payrollStore'
import { getSchedules, updateSchedule } from '../services/employeeService'
import '../Dashboard.css'

function ScheduleMatrix() {
  const { employees, routes, vehicles, fetchData: refreshGlobalData } = usePayrollStore();
  const [schedules, setSchedules] = useState([])
  const [selectedRouteId, setSelectedRouteId] = useState('')
  const [selectedVehicleId, setSelectedVehicleId] = useState('')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const shifts = { 'Morning': 'เช้า', 'Afternoon': 'บ่าย', 'OT1': 'OT1', 'OT2': 'OT2' }

  useEffect(() => {
    fetchSchedules()
  }, [])

  const fetchSchedules = async () => {
    try {
      const schedRes = await getSchedules()
      setSchedules(schedRes.data)
    } catch (err) {
      console.error('Failed to fetch schedules');
    }
  }

  const toggleSchedule = async (employeeId, shift) => {
    if (!selectedRouteId || !selectedVehicleId) {
      alert('กรุณาเลือกเส้นทางและยานพาหนะก่อน');
      return;
    }

    const isScheduled = !schedules.some(s => 
      s.date === selectedDate && 
      s.employee_id === employeeId && 
      s.shift === shift && 
      s.route_id === selectedRouteId && 
      s.vehicle_id === selectedVehicleId
    );
    
    try {
      await updateSchedule({ date: selectedDate, employeeId, shift, routeId: selectedRouteId, vehicleId: selectedVehicleId, isScheduled });
      fetchSchedules(); 
      refreshGlobalData(); 
    } catch (err) {
      alert('Failed to update schedule');
    }
  }

  return (
    <div className="card">
      <h2>ตารางการทำงาน</h2>
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input 
          type="date" 
          value={selectedDate} 
          onChange={e => setSelectedDate(e.target.value)} 
          style={{ padding: '8px' }}
        />
        <select value={selectedRouteId} onChange={e => setSelectedRouteId(e.target.value)}>
          <option value="">เลือกเส้นทาง</option>
          {routes.map(route => (
            <option key={route.id} value={route.id}>{route.name}</option>
          ))}
        </select>
        <select value={selectedVehicleId} onChange={e => setSelectedVehicleId(e.target.value)}>
          <option value="">เลือกยานพาหนะ</option>
          {vehicles.map(vehicle => (
            <option key={vehicle.id} value={vehicle.id}>{vehicle.plateNumber || vehicle.plate_number} ({vehicle.model})</option>
          ))}
        </select>
      </div>
      <table>
        <thead>
          <tr>
            <th>ชื่อ-นามสกุล</th>
            {Object.values(shifts).map(s => <th key={s}>{s}</th>)}
          </tr>
        </thead>
        <tbody>
          {employees.map(emp => (
            <tr key={emp.id}>
              <td>{emp.thaiName || emp.thai_name}</td>
              {Object.keys(shifts).map(shift => (
                <td key={shift}>
                  <input 
                    type="checkbox" 
                    checked={schedules.some(s => 
                      s.date === selectedDate &&
                      s.employee_id === emp.id && 
                      s.shift === shift && 
                      s.route_id === selectedRouteId && 
                      s.vehicle_id === selectedVehicleId
                    )}
                    onChange={() => toggleSchedule(emp.id, shift)}
                    disabled={!selectedRouteId || !selectedVehicleId}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
export default ScheduleMatrix
