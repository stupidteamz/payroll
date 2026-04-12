import React, { useState } from 'react';
import usePayrollStore from '../store/payrollStore';
import { createVehicle, deleteVehicle } from '../services/employeeService';

const VehicleList = () => {
  const { vehicles, fetchData } = usePayrollStore();
  const [newVehicle, setNewVehicle] = useState({ plateNumber: '', model: '', capacity: '', status: 'active', maintenanceInfo: '' });

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    await createVehicle(newVehicle);
    setNewVehicle({ plateNumber: '', model: '', capacity: '', status: 'active', maintenanceInfo: '' });
    fetchData();
  };

  const handleDeleteVehicle = (id) => {
    if (confirm('ยืนยันการลบรถ?')) deleteVehicle(id).then(fetchData);
  };

  return (
    <div className="card">
      <h2>จัดการยานพาหนะ</h2>
      <form onSubmit={handleAddVehicle} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '20px' }}>
        <input placeholder="ทะเบียนรถ" value={newVehicle.plateNumber} onChange={e => setNewVehicle({...newVehicle, plateNumber: e.target.value})} required />
        <input placeholder="รุ่นรถ" value={newVehicle.model} onChange={e => setNewVehicle({...newVehicle, model: e.target.value})} />
        <input type="number" placeholder="ความจุ" value={newVehicle.capacity} onChange={e => setNewVehicle({...newVehicle, capacity: e.target.value})} />
        <select value={newVehicle.status} onChange={e => setNewVehicle({...newVehicle, status: e.target.value})}>
          <option value="active">ใช้งานปกติ</option>
          <option value="maintenance">กำลังซ่อม</option>
        </select>
        <input placeholder="ข้อมูลซ่อมบำรุง" value={newVehicle.maintenanceInfo} onChange={e => setNewVehicle({...newVehicle, maintenanceInfo: e.target.value})} />
        <button className="primary" type="submit">เพิ่มรถ</button>
      </form>
      <table>
        <thead>
          <tr><th>ทะเบียนรถ</th><th>รุ่น</th><th>ความจุ</th><th>สถานะ</th><th>จัดการ</th></tr>
        </thead>
        <tbody>
          {vehicles.map(v => (
            <tr key={v.id}>
              <td>{v.plateNumber || v.plate_number}</td>
              <td>{v.model}</td>
              <td>{v.capacity}</td>
              <td>{v.status}</td>
              <td><button className="delete" onClick={() => handleDeleteVehicle(v.id)}>ลบ</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default VehicleList;
