const { sequelize, Employee, Schedule, Route } = require('./models');
const { calculateTripIncome } = require('./utils/payrollCalculations');

async function testCalculation() {
    try {
        await sequelize.authenticate();
        // ทดสอบพนักงานนาย สุธิต คำพุก (รหัส EMP-...)
        const emp = await Employee.findOne({ where: { thai_name: 'นาย สุธิต คำพุก' } });
        if (!emp) {
            console.log('ไม่พบพนักงาน');
            return;
        }

        const schedules = await Schedule.findAll({
            where: { employee_id: emp.id },
            include: [Route]
        });

        console.log(`พนักงาน: ${emp.thai_name}`);
        console.log(`จำนวนเที่ยวที่ลงไว้: ${schedules.length}`);
        
        const income = calculateTripIncome(schedules);
        console.log(`รายได้จากเที่ยววิ่ง: ฿${income.toLocaleString()}`);
        console.log(`เงินเดือนพื้นฐาน: ฿${Number(emp.salary).toLocaleString()}`);
        console.log(`รวมรายได้: ฿${(Number(emp.salary) + income).toLocaleString()}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

testCalculation();
