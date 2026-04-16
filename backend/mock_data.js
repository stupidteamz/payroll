const { sequelize, Employee, Schedule, Route, Vehicle, Advance } = require('./models');

async function mockData() {
    try {
        await sequelize.authenticate();
        const emp = await Employee.findOne({ where: { thai_name: 'นาย สุธิต คำพุก' } });
        const route = await Route.findOne(); // เอาเส้นทางไหนก็ได้
        const vehicle = await Vehicle.findOne();

        if (!emp || !route || !vehicle) {
            console.log('ข้อมูลไม่ครบ (Employee/Route/Vehicle)');
            process.exit(1);
        }

        // Mock Schedule (30 days, 2 trips/day)
        for (let i = 1; i <= 30; i++) {
            const date = `2026-04-${i.toString().padStart(2, '0')}`;
            await Schedule.create({
                date,
                shift: 'Morning',
                time_slot: '05.10-06.10',
                employee_id: emp.id,
                route_id: route.id,
                vehicle_id: vehicle.id,
                work_type: 'regular'
            });
            await Schedule.create({
                date,
                shift: 'Evening',
                time_slot: '17.10-18.10',
                employee_id: emp.id,
                route_id: route.id,
                vehicle_id: vehicle.id,
                work_type: 'regular'
            });
        }

        // Mock Advance
        await Advance.create({
            employee_id: emp.id,
            date: '2026-04-15',
            amount: 500.00,
            notes: 'เบิกรายสัปดาห์'
        });

        console.log('Mock Data Added Successfully!');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

mockData();
