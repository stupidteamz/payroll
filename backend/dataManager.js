const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data.json');

// โหลดข้อมูลจากไฟล์ (ถ้ามี)
let data = {
    employees: [],
    vehicles: [],
    schedules: []
};

if (fs.existsSync(DATA_FILE)) {
    data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

const saveData = () => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// ใช้ data.employees แทน let employees = []
// ตัวอย่าง controller:
// exports.getEmployees = (req, res) => res.json(data.employees);
// exports.createEmployee = (req, res) => { ... data.employees.push(...); saveData(); ... }
