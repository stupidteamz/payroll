const { Employee, WorkRecord, MonthlyDeduction, Route } = require('../models/new_models');
const { Op } = require('sequelize');

/**
 * คำนวณเงินเดือนตาม Schema ใหม่ (Trip-based Pay)
 */
exports.calculateMonthlyPayroll = async (month, year) => {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay}`;

    const employees = await Employee.findAll({
        include: [
            {
                model: WorkRecord,
                where: { date: { [Op.between]: [startDate, endDate] } },
                required: false,
                include: [Route]
            },
            {
                model: MonthlyDeduction,
                where: { month, year },
                required: false
            }
        ]
    });

    return employees.map(emp => {
        const base = Number(emp.base_salary);
        const allowances = Number(emp.clothing_allowance) + Number(emp.utility_allowance);
        
        // คำนวณรายได้จากรายการทำงาน (จำนวนเที่ยว * อัตราเส้นทาง)
        const earningsFromWork = emp.WorkRecords.reduce((sum, wr) => {
            const tripRate = wr.Route ? Number(wr.Route.trip_rate) : Number(wr.rate);
            return sum + (Number(wr.trips) * tripRate);
        }, 0);

        // คำนวณรายการหัก
        const deductions = emp.MonthlyDeductions.reduce((sum, md) => sum + Number(md.amount), 0);

        // รวมยอด (เงินเดือน + เบี้ยเลี้ยง + รายได้จากเที่ยววิ่ง - รายการหัก)
        const netSalary = base + allowances + earningsFromWork - deductions;

        return {
            employeeId: emp.employee_id,
            thaiName: emp.thai_name,
            baseSalary: base,
            allowances,
            earningsFromWork,
            deductions,
            netSalary
        };
    });
};
