const { sequelize, Employee, Schedule, Route, Vehicle, Advance, PayrollHistory } = require('../models');
const { calculateOtPay, calculateSocialSecurity, calculateDepositDeduction } = require('../utils/payrollCalculations');
const { Op } = require('sequelize');
const { createPayslipPDF } = require('../utils/pdfGenerator');
const { getDateFilter } = require('../utils/dateHelper');

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

        // Fetch Advances
        const advances = await Advance.findAll({
            where: { employee_id: emp.id, ...getDateFilter(month, year) }
        });
        const totalAdvance = advances.reduce((sum, a) => sum + Number(a.amount), 0);

        // Fetch Installment Count
        const installmentCount = await PayrollHistory.count({
            where: { employee_id: emp.id }
        }) + 1;

        const salary = Number(emp.salary) || 0;
        const otPaySunday = calculateOtPay(emp, schedules.filter(s => s.work_type === 'sunday'));
        const otPayHoliday = calculateOtPay(emp, schedules.filter(s => s.work_type === 'holiday'));
        const otPayExtra = calculateOtPay(emp, schedules.filter(s => s.work_type === 'extra' || s.work_type === 'regular'));
        
        const clothingAllowance = Number(emp.clothing_allowance) || 0;
        const utilityAllowance = Number(emp.utility_allowance) || 0;
        
        const socialSecurity = calculateSocialSecurity(salary);
        const depositDeduction = calculateDepositDeduction(emp, emp.deposit_balance);

        const totalEarnings = salary + otPaySunday + otPayHoliday + otPayExtra + clothingAllowance + utilityAllowance;
        const totalDeductions = socialSecurity + totalAdvance + depositDeduction;
        const netSalary = totalEarnings - totalDeductions;

        const payslipResult = {
            employeeId: emp.employee_id,
            thaiName: emp.thai_name,
            position: emp.position,
            bankAccountNumber: emp.bank_account_number,
            bankName: emp.bank_name,
            plateNumber: schedules[0]?.Vehicle?.plate_number || '-',
            month: parseInt(month),
            year: parseInt(year),
            earnings: {
                baseSalary: salary,
                otSunday: otPaySunday,
                otHoliday: otPayHoliday,
                otExtra: otPayExtra,
                clothingAllowance,
                utilityAllowance,
                otCountSunday: schedules.filter(s => s.work_type === 'sunday' && (s.shift === 'OT1' || s.shift === 'OT2')).length,
                otCountHoliday: schedules.filter(s => s.work_type === 'holiday' && (s.shift === 'OT1' || s.shift === 'OT2')).length,
                otCountExtra: schedules.filter((s => s.work_type === 'extra' || s.work_type === 'regular') && (s.shift === 'OT1' || s.shift === 'OT2')).length,
            },
            deductions: { 
                socialSecurity,
                advances: totalAdvance,
                deposit: depositDeduction
            },
            netSalary,
            accumulatedDeposit: Number(emp.deposit_balance) + depositDeduction,
            installmentCount
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
        if (!month || !year) return res.status(400).json({ message: 'Month/Year required.' });

        const employees = await Employee.findAll();
        const schedules = await Schedule.findAll({ where: getDateFilter(month, year), include: [Vehicle] });
        const advances = await Advance.findAll({ where: getDateFilter(month, year) });

        const payslips = employees.map(emp => {
            const empSchedules = schedules.filter(s => s.employee_id === emp.id);
            if (empSchedules.length === 0) return null;

            const empAdvances = advances.filter(a => a.employee_id === emp.id);
            const totalAdvance = empAdvances.reduce((sum, a) => sum + Number(a.amount), 0);

            const salary = Number(emp.salary) || 0;
            const otPaySunday = calculateOtPay(emp, empSchedules.filter(s => s.work_type === 'sunday'));
            const otPayHoliday = calculateOtPay(emp, empSchedules.filter(s => s.work_type === 'holiday'));
            const otPayExtra = calculateOtPay(emp, empSchedules.filter(s => s.work_type === 'extra' || s.work_type === 'regular'));
            
            const clothingAllowance = Number(emp.clothing_allowance) || 0;
            const utilityAllowance = Number(emp.utility_allowance) || 0;
            
            const socialSecurity = calculateSocialSecurity(salary);
            const depositDeduction = calculateDepositDeduction(emp, emp.deposit_balance);

            const totalEarnings = salary + otPaySunday + otPayHoliday + otPayExtra + clothingAllowance + utilityAllowance;
            const totalDeductions = socialSecurity + totalAdvance + depositDeduction;
            const netSalary = totalEarnings - totalDeductions;

            return {
                id: emp.id,
                employeeId: emp.employee_id,
                thaiName: emp.thai_name,
                position: emp.position,
                month: parseInt(month),
                year: parseInt(year),
                totalEarnings,
                totalDeductions,
                netSalary,
                earnings: {
                    baseSalary: salary,
                    otSunday: otPaySunday,
                    otHoliday: otPayHoliday,
                    otExtra: otPayExtra,
                    clothingAllowance,
                    utilityAllowance
                },
                deductions: {
                    socialSecurity,
                    advances: totalAdvance,
                    deposit: depositDeduction
                }
            };
        }).filter(p => p !== null);

        res.json(payslips);
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.confirmPayroll = async (req, res) => {
    const { month, year, payslips } = req.body;
    const transaction = await sequelize.transaction();
    try {
        for (const p of payslips) {
            await PayrollHistory.create({
                employee_id: p.id,
                month,
                year,
                base_salary: p.earnings.baseSalary,
                ot_pay: p.earnings.otSunday + p.earnings.otHoliday + p.earnings.otExtra,
                social_security: p.deductions.socialSecurity,
                advance_deduction: p.deductions.advances,
                deposit_deduction: p.deductions.deposit,
                net_salary: p.netSalary,
                accumulated_deposit: (await Employee.findByPk(p.id)).deposit_balance + p.deductions.deposit
            }, { transaction });

            const emp = await Employee.findByPk(p.id, { transaction });
            if (emp) {
                emp.deposit_balance = Number(emp.deposit_balance) + Number(p.deductions.deposit);
                await emp.save({ transaction });
            }
        }
        await transaction.commit();
        res.json({ message: 'Payroll confirmed.' });
    } catch (err) {
        await transaction.rollback();
        res.status(500).json({ message: 'Error' });
    }
};
