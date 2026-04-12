import React, { useState } from 'react';
import usePayrollStore from '../store/payrollStore';
import { createRoute, deleteRoute } from '../services/employeeService';

const RouteList = () => {
  const { routes, fetchData } = usePayrollStore();
  const [newRoute, setNewRoute] = useState({ name: '' });

  const handleAddRoute = async (e) => {
    e.preventDefault();
    await createRoute(newRoute);
    setNewRoute({ name: '' });
    fetchData();
  };

  const handleDeleteRoute = (id) => {
    if (confirm('ยืนยันการลบเส้นทาง?')) deleteRoute(id).then(fetchData);
  };

  return (
    <div className="card">
      <h2>จัดการเส้นทาง</h2>
      <form onSubmit={handleAddRoute} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <input placeholder="ชื่อเส้นทาง" value={newRoute.name} onChange={e => setNewRoute({...newRoute, name: e.target.value})} required />
        <button className="primary" type="submit">เพิ่มเส้นทาง</button>
      </form>
      <table>
        <thead>
          <tr><th>ชื่อเส้นทาง</th><th>จัดการ</th></tr>
        </thead>
        <tbody>
          {routes.map(r => (
            <tr key={r.id}>
              <td>{r.name}</td>
              <td><button className="delete" onClick={() => handleDeleteRoute(r.id)}>ลบ</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RouteList;
