const { sequelize, Employee, Schedule } = require('./models');
const { calculateOtPay, calculateSocialSecurity } = require('./utils/payrollCalculations');
const { Op } = require('sequelize');

async function checkApril() {
    try {
        await sequelize.authenticate();
        const month = 4;
        const year = 2026;

        const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
        const lastDay = new Date(year, month, 0).getDate();
        const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay}`;

        const schedules = await Schedule.findAll({
            where: {
                date: { [Op.between]: [startDate, endDate] }
            }
        });

        console.log(`Found ${schedules.length} schedules for April 2026.`);

        const employees = await Employee.findAll();
        for (const emp of employees) {
            const empSchedules = schedules.filter(s => s.employee_id === emp.id);
            if (empSchedules.length > 0) {
                const otPay = calculateOtPay({ ...emp.toJSON(), otRate: Number(emp.ot_rate) }, empSchedules);
                console.log(`Employee: ${emp.thai_name}, Shifts: ${empSchedules.length}, OT Pay: ${otPay}`);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkApril();
