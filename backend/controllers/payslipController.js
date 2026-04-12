const { sequelize, Employee, Schedule, Route, Vehicle } = require('../models');
const { calculateOtPay, calculateSocialSecurity } = require('../utils/payrollCalculations');
const { Op } = require('sequelize');
const { createPayslipPDF } = require('../utils/pdfGenerator');

/**
 * Helper to get date filter based on database dialect
 */
const getDateFilter = (month, year) => {
    const isPostgres = sequelize.getDialect() === 'postgres';
    if (isPostgres) {
        return {
            [Op.and]: [
                sequelize.where(sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM date')), month.toString()),
                sequelize.where(sequelize.fn('EXTRACT', sequelize.literal('YEAR FROM date')), year.toString())
            ]
        };
    }
    // Default to SQLite (strftime)
    return {
        [Op.and]: [
            sequelize.where(sequelize.fn('strftime', '%m', sequelize.col('date')), month.toString().padStart(2, '0')),
            sequelize.where(sequelize.fn('strftime', '%Y', sequelize.col('date')), year.toString())
        ]
    };
};

exports.downloadPayslipPDF = async (req, res) => {
    try {
        const { employeeId, month, year } = req.query;

        if (!employeeId || !month || !year) {
            return res.status(400).json({ message: 'Missing parameters: employeeId, month, and year are required.' });
        }

        const emp = await Employee.findOne({ where: { employee_id: employeeId } });
        if (!emp) {
            return res.status(404).json({ message: 'Employee not found.' });
        }

        const schedules = await Schedule.findAll({
            where: {
                employee_id: emp.id,
                ...getDateFilter(month, year)
            },
            include: [Route, Vehicle]
        });

        if (schedules.length === 0) {
            return res.status(404).json({ message: 'ไม่พบข้อมูลการทำงานของพนักงานคนนี้ในเดือนที่เลือก จึงไม่สามารถสร้างสลิปได้' });
        }

        // Calculate payslip data
        // ... (rest of the calculation logic)
        const salary = Number(emp.salary) || 0;
        const empData = {
            ...emp.toJSON(),
            thaiName: emp.thai_name,
            employeeId: emp.employee_id,
            otRate: Number(emp.ot_rate),
        };

        const otPay = calculateOtPay(empData, schedules);
        const otCount = schedules.filter(s => s.shift === 'OT1' || s.shift === 'OT2').length;
        const socialSecurity = calculateSocialSecurity(salary);

        const regularShiftsGrouped = schedules
            .filter(s => s.shift !== 'OT1' && s.shift !== 'OT2')
            .reduce((acc, s) => {
                const key = `${s.Route ? s.Route.name : 'Unknown Route'} - ${s.Vehicle ? s.Vehicle.plate_number : 'Unknown Vehicle'}`;
                acc[key] = (acc[key] || 0) + 1;
                return acc;
            }, {});

        const totalEarnings = salary + otPay;
        const netSalary = totalEarnings - socialSecurity;

        const payslipResult = {
            employeeId: empData.employeeId,
            thaiName: empData.thaiName,
            position: emp.position,
            month: parseInt(month),
            year: parseInt(year),
            earnings: {
                baseSalary: salary,
                otPay: otPay,
                otCount: otCount,
                regularShifts: regularShiftsGrouped,
            },
            deductions: { socialSecurity: socialSecurity },
            netSalary,
        };

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Payslip_${employeeId}_${month}_${year}.pdf`);

        await createPayslipPDF(payslipResult, res);

    } catch (err) {
        console.error('Error generating PDF payslip:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.generatePayslip = async (req, res) => {
    try {
        const { month, year } = req.query;
        
        if (!month || !year) {
            return res.status(400).json({ message: 'Month and Year are required for payslip generation.' });
        }

        const employees = await Employee.findAll();
        
        const schedules = await Schedule.findAll({
            where: getDateFilter(month, year),
            include: [Route, Vehicle]
        });

        const payslips = employees.map(emp => {
            const employeeSchedules = schedules.filter(s => s.employee_id === emp.id);
            
            // SKIP if no work records found for this employee in the selected month
            if (employeeSchedules.length === 0) return null;

            const salary = Number(emp.salary) || 0;
            const empData = {
                ...emp.toJSON(),
                thaiName: emp.thai_name,
                employeeId: emp.employee_id,
                otRate: Number(emp.ot_rate),
                bankAccountNumber: emp.bank_account_number,
                bankName: emp.bank_name
            };

            const otPay = calculateOtPay(empData, employeeSchedules);
            const otCount = employeeSchedules.filter(s => s.shift === 'OT1' || s.shift === 'OT2').length;
            const socialSecurity = calculateSocialSecurity(salary);

            const regularShiftsGrouped = employeeSchedules
                .filter(s => s.shift !== 'OT1' && s.shift !== 'OT2')
                .reduce((acc, s) => {
                    const key = `${s.Route ? s.Route.name : 'Unknown Route'} - ${s.Vehicle ? s.Vehicle.plate_number : 'Unknown Vehicle'}`;
                    acc[key] = (acc[key] || 0) + 1;
                    return acc;
                }, {});

            const totalEarnings = salary + otPay;
            const netSalary = totalEarnings - socialSecurity;

            return {
                employeeId: empData.employeeId,
                thaiName: empData.thaiName,
                position: emp.position,
                bankAccountNumber: empData.bankAccountNumber,
                bankName: empData.bankName,
                month: parseInt(month),
                year: parseInt(year),
                earnings: {
                    baseSalary: salary,
                    otPay: otPay,
                    otCount: otCount,
                    regularShifts: regularShiftsGrouped,
                },
                deductions: { socialSecurity: socialSecurity },
                totalEarnings,
                totalDeductions: socialSecurity,
                netSalary,
            };
        }).filter(p => p !== null); // Remove null entries

        res.json(payslips);
    } catch (err) {
        console.error('Error generating payslips:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
