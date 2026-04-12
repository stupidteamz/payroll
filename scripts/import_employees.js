const fs = require('fs');
const axios = require('axios');

const employees = JSON.parse(fs.readFileSync('d:/gemini-bot-payroll-system/employees_data.json', 'utf-8'));

async function importEmployees() {
  for (const emp of employees) {
    // Filter out rows where name is "nan"
    if (emp.thaiName === "nan" || !emp.thaiName) continue;

    try {
      const payload = {
        employeeId: 'ID-' + Math.random().toString(36).substr(2, 5).toUpperCase(),
        thaiName: emp.thaiName,
        position: emp.position || 'พนักงานขับรถ',
        salary: emp.salary || 0,
        bankAccountNumber: emp.bankAccountNumber || '000-0-00000-0',
      };

      await axios.post('http://localhost:3000/employees', payload);
      console.log(`Imported: ${emp.thaiName}`);
    } catch (error) {
      console.error(`Failed to import ${emp.thaiName}:`, error.message);
    }
  }
}

importEmployees();
