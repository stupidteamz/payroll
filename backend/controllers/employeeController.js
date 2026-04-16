const { Employee, Schedule } = require('../models');
const { calculateOtPay, calculateSocialSecurity } = require('../utils/payrollCalculations');
const { Op } = require('sequelize');

// ดึงรายชื่อพนักงานพร้อมระบบค้นหาและแบ่งหน้า
exports.getEmployees = async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;
        const offset = (page - 1) * limit;
        
        const whereClause = search ? {
            [Op.or]: [
                { thai_name: { [Op.like]: `%${search}%` } },
                { employee_id: { [Op.like]: `%${search}%` } }
            ]
        } : {};

        const { count, rows: employees } = await Employee.findAndCountAll({
            where: whereClause,
            limit: Number(limit),
            offset: Number(offset)
        });

        // ดึงตารางงานเพื่อคำนวณ OT
        const schedules = await Schedule.findAll();

        // คำนวณเงินเดือน
        const employeesWithSalary = employees.map(emp => {
            const salary = Number(emp.salary) || 0;
            const empData = {
                ...emp.toJSON(),
                thaiName: emp.thai_name,
                employeeId: emp.employee_id,
                otRate: Number(emp.ot_rate),
                bankAccountNumber: emp.bank_account_number,
                bankName: emp.bank_name
            };
            const otPay = calculateOtPay(empData, schedules);
            const socialSecurity = calculateSocialSecurity(salary);
            const netSalary = salary + otPay - socialSecurity;
            return { ...empData, otPay, socialSecurity, netSalary };
        });

        res.json({
            data: employeesWithSalary,
            total: count,
            currentPage: Number(page),
            totalPages: Math.ceil(count / limit)
        });
    } catch (err) {
        console.error('Error fetching employees:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getEmployeeById = async (req, res) => {
    try {
        const emp = await Employee.findByPk(req.params.id);
        if (emp) {
            res.json({
                ...emp.toJSON(),
                thaiName: emp.thai_name,
                employeeId: emp.employee_id,
                otRate: Number(emp.ot_rate),
                bankAccountNumber: emp.bank_account_number,
                bankName: emp.bank_name
            });
        } else {
            res.status(404).json({ message: 'Not found' });
        }
    } catch (err) {
        console.error('Error fetching employee:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.createEmployee = async (req, res) => {
    try {
        const { thaiName, position, salary, bankAccountNumber, employeeId, otRate, bankName } = req.body;
        const newEmployee = await Employee.create({
            employee_id: employeeId || `EMP-${Date.now()}`,
            thai_name: thaiName,
            position,
            salary: salary || 0,
            ot_rate: otRate || 100,
            bank_account_number: bankAccountNumber,
            bank_name: bankName || 'กสิกรไทย'
        });
        
        res.status(201).json({
            ...newEmployee.toJSON(),
            thaiName: newEmployee.thai_name,
            employeeId: newEmployee.employee_id,
            otRate: Number(newEmployee.ot_rate),
            bankAccountNumber: newEmployee.bank_account_number,
            bankName: newEmployee.bank_name
        });
    } catch (err) {
        console.error('Error creating employee:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.updateEmployee = async (req, res) => {
    try {
        const { thaiName, position, salary, bankAccountNumber, employeeId, otRate, bankName } = req.body;
        const emp = await Employee.findByPk(req.params.id);
        
        if (!emp) return res.status(404).json({ message: 'Not found' });

        await emp.update({
            thai_name: thaiName || emp.thai_name,
            position: position || emp.position,
            salary: salary || emp.salary,
            bank_account_number: bankAccountNumber || emp.bank_account_number,
            employee_id: employeeId || emp.employee_id,
            ot_rate: otRate || emp.ot_rate,
            bank_name: bankName || emp.bank_name
        });
        
        res.json({
            ...emp.toJSON(),
            thaiName: emp.thai_name,
            employeeId: emp.employee_id,
            otRate: Number(emp.ot_rate),
            bankAccountNumber: emp.bank_account_number,
            bankName: emp.bank_name
        });
    } catch (err) {
        console.error('Error updating employee:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.deleteEmployee = async (req, res) => {
    try {
        await Employee.destroy({ where: { id: req.params.id } });
        res.status(200).json({ message: 'Deleted' });
    } catch (err) {
        console.error('Error deleting employee:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
