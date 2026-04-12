import React, { useState } from 'react';
import usePayrollStore from '../store/payrollStore';
import { createEmployee, deleteEmployee } from '../services/employeeService';
import * as XLSX from 'xlsx';

const EmployeeList = () => {
  const { employees, fetchData } = usePayrollStore();
  const [newEmployee, setNewEmployee] = useState({ thaiName: '', position: '', salary: '', bankAccountNumber: '', employeeId: '', otRate: 100 });
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    try {
      await createEmployee(newEmployee);
      setNewEmployee({ thaiName: '', position: '', salary: '', bankAccountNumber: '', employeeId: '', otRate: 100 });
      fetchData();
    } catch (err) {
      alert('Failed to add employee');
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (confirm('ยืนยันการลบพนักงาน?')) {
      try {
        await deleteEmployee(id);
        fetchData();
      } catch (err) {
        alert('Failed to delete employee');
      }
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.thaiName?.includes(searchTerm) || emp.employeeId?.includes(searchTerm)
  );

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(employees);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'พนักงาน');
    XLSX.writeFile(wb, 'Employee_Report.xlsx');
  };

  return (
    <div className="card">
      <h2>จัดการพนักงาน</h2>
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input placeholder="ค้นหา..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        <button className="primary" onClick={exportToExcel}>ส่งออกข้อมูล</button>
      </div>
      <form onSubmit={handleAddEmployee} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '20px' }}>
        <input placeholder="รหัสพนักงาน" value={newEmployee.employeeId} onChange={e => setNewEmployee({...newEmployee, employeeId: e.target.value})} />
        <input placeholder="ชื่อ-นามสกุล" value={newEmployee.thaiName} onChange={e => setNewEmployee({...newEmployee, thaiName: e.target.value})} required />
        <input placeholder="ตำแหน่ง" value={newEmployee.position} onChange={e => setNewEmployee({...newEmployee, position: e.target.value})} />
        <input type="number" placeholder="เงินเดือน" value={newEmployee.salary} onChange={e => setNewEmployee({...newEmployee, salary: e.target.value})} />
        <input placeholder="เลขบัญชี" value={newEmployee.bankAccountNumber} onChange={e => setNewEmployee({...newEmployee, bankAccountNumber: e.target.value})} />
        <input type="number" placeholder="อัตรา OT" value={newEmployee.otRate} onChange={e => setNewEmployee({...newEmployee, otRate: parseFloat(e.target.value)})} />
        <button className="primary" type="submit">เพิ่มพนักงาน</button>
      </form>
      <table>
        <thead>
          <tr><th>รหัส</th><th>ชื่อ</th><th>ตำแหน่ง</th><th>เงินเดือน</th><th>OT</th><th>จัดการ</th></tr>
        </thead>
        <tbody>
          {filteredEmployees.map(emp => (
            <tr key={emp.id}>
              <td>{emp.employeeId}</td>
              <td>{emp.thaiName}</td>
              <td>{emp.position}</td>
              <td>{Number(emp.salary).toLocaleString()}</td>
              <td>{emp.otRate}</td>
              <td><button className="delete" onClick={() => handleDeleteEmployee(emp.id)}>ลบ</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeList;
