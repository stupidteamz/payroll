const { sequelize, Employee, Schedule, Route, Vehicle } = require('../models');
const { calculateOtPay, calculateSocialSecurity } = require('../utils/payrollCalculations');
const { Op } = require('sequelize');
const XLSX = require('xlsx');

const getDateFilter = (month, year) => {
    const m = parseInt(month);
    const y = parseInt(year);
    const startDate = `${y}-${m.toString().padStart(2, '0')}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const endDate = `${y}-${m.toString().padStart(2, '0')}-${lastDay}`;
    return { date: { [Op.between]: [startDate, endDate] } };
};

exports.getDashboardSummary = async (req, res) => {
    try {
        const { month, year } = req.query;
        const totalEmployees = await Employee.count();
        const totalVehicles = await Vehicle.count();
        const totalRoutes = await Route.count();

        let totalMonthlyPayroll = 0;
        if (month && year) {
            const employees = await Employee.findAll();
            const schedules = await Schedule.findAll({ where: getDateFilter(month, year) });
            totalMonthlyPayroll = employees.reduce((sum, emp) => {
                const empSchedules = schedules.filter(s => s.employee_id === emp.id);
                const otPay = calculateOtPay({ ...emp.toJSON(), otRate: Number(emp.ot_rate) }, empSchedules);
                return sum + Number(emp.salary) + otPay - calculateSocialSecurity(Number(emp.salary));
            }, 0);
        }

        res.json({ totalEmployees, totalVehicles, totalRoutes, totalMonthlyPayroll: Math.round(totalMonthlyPayroll) });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.generateExcelReport = async (req, res) => {
    try {
        const { month, year } = req.query;
        const employees = await Employee.findAll();
        const schedules = await Schedule.findAll({ where: getDateFilter(month, year), include: [Route, Vehicle] });

        const data = employees.map(emp => {
            const salary = Number(emp.salary) || 0;
            const empSchedules = schedules.filter(s => s.employee_id === emp.id);
            const otPay = calculateOtPay({ ...emp.toJSON(), otRate: Number(emp.ot_rate) }, empSchedules);
            const ss = calculateSocialSecurity(salary);
            return {
                'ชื่อพนักงาน': emp.thai_name,
                'ตำแหน่ง': emp.position,
                'เงินเดือน': salary,
                'ค่า OT': otPay,
                'ประกันสังคม': ss,
                'รายรับสุทธิ': salary + otPay - ss
            };
        });

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'Payroll');
        
        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Payroll_${month}_${year}.xlsx`);
        res.send(buffer);
    } catch (err) {
        res.status(500).json({ message: 'Excel generation failed' });
    }
};

exports.generateVehicleReport = async (req, res) => {
    try {
        const { month, year } = req.query;
        const vehicles = await Vehicle.findAll();
        const schedules = await Schedule.findAll({ where: getDateFilter(month, year), include: [Vehicle] });

        const report = vehicles.map(v => {
            const vehicleSchedules = schedules.filter(s => s.vehicle_id === v.id);
            return {
                plate: v.plate_number,
                trips: vehicleSchedules.length,
                model: v.model
            };
        });

        res.json(report);
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.generateTripReport = async (req, res) => {
    try {
        const { month, year } = req.query;
        if (!month || !year) return res.status(400).json({ message: 'Month and Year required.' });

        const schedules = await Schedule.findAll({
            where: getDateFilter(month, year),
            include: [Route, Vehicle]
        });

        const otTrips = schedules.filter(s => s.shift === 'OT1' || s.shift === 'OT2');
        const otTripsByRoute = otTrips.reduce((acc, s) => {
            const name = s.Route ? s.Route.name : 'Unknown Route';
            acc[name] = (acc[name] || 0) + 1;
            return acc;
        }, {});

        const otTripsByVehicle = otTrips.reduce((acc, s) => {
            const plate = s.Vehicle ? s.Vehicle.plate_number : 'Unknown Vehicle';
            acc[plate] = (acc[plate] || 0) + 1;
            return acc;
        }, {});

        res.json({
            month: parseInt(month),
            year: parseInt(year),
            totalTrips: schedules.length,
            otTripsByRoute,
            otTripsByVehicle,
        });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.generatePaymentReport = async (req, res) => {
    try {
        const { month, year } = req.query;
        if (!month || !year) return res.status(400).json({ message: 'Month and Year required.' });

        const employees = await Employee.findAll();
        const schedules = await Schedule.findAll({ where: getDateFilter(month, year) });

        const payslips = employees.map(emp => {
            const salary = Number(emp.salary) || 0;
            const empData = { ...emp.toJSON(), thaiName: emp.thai_name, employeeId: emp.employee_id, otRate: Number(emp.ot_rate) };
            const empSchedules = schedules.filter(s => s.employee_id === emp.id);
            const otPay = calculateOtPay(empData, empSchedules);
            const socialSecurity = calculateSocialSecurity(salary);
            return {
                employeeId: empData.employeeId,
                thaiName: empData.thaiName,
                baseSalary: salary,
                otPay,
                socialSecurity,
                netSalary: salary + otPay - socialSecurity,
            };
        });

        res.json({
            month: parseInt(month),
            year: parseInt(year),
            totalMonthlyPayroll: payslips.reduce((sum, ps) => sum + ps.netSalary, 0),
            totalBaseSalary: payslips.reduce((sum, ps) => sum + ps.baseSalary, 0),
            totalOtPay: payslips.reduce((sum, ps) => sum + ps.otPay, 0),
            totalSocialSecurity: payslips.reduce((sum, ps) => sum + ps.socialSecurity, 0),
            employeePayslips: payslips,
        });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
