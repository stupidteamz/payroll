const { sequelize, Employee, Route, Vehicle, WorkRecord } = require('./models/new_models');

async function seedMockup() {
    try {
        await sequelize.authenticate();
        console.log('📡 Connected to database for seeding...');

        // 1. Seed Routes
        const routes = [
            { name: 'เชียงใหม่ - กรุงเทพ (สายเหนือ)' },
            { name: 'กรุงเทพ - พัทยา (สายตะวันออก)' },
            { name: 'กรุงเทพ - หัวหิน (สายตะวันตก)' },
            { name: 'เชียงใหม่ - สัตหีบ (สายยาว)' }
        ];
        
        const createdRoutes = [];
        for (const r of routes) {
            const [route] = await Route.findOrCreate({ where: { name: r.name } });
            createdRoutes.push(route);
        }
        console.log(`✅ Seeded ${createdRoutes.length} routes.`);

        // 2. Seed Vehicles
        const vehicles = [
            { plate_number: 'กข 1234', model: 'Toyota Commuter', capacity: 10 },
            { plate_number: 'ฮห 5678', model: 'Toyota All New Commuter', capacity: 10 },
            { plate_number: 'บบ 9999', model: 'Mercedes-Benz Sprinter', capacity: 12 },
            { plate_number: 'มม 8888', model: 'Hyundai H1', capacity: 7 }
        ];

        const createdVehicles = [];
        for (const v of vehicles) {
            const [vehicle] = await Vehicle.findOrCreate({ 
                where: { plate_number: v.plate_number },
                defaults: v
            });
            createdVehicles.push(vehicle);
        }
        console.log(`✅ Seeded ${createdVehicles.length} vehicles.`);

        // 3. Seed WorkRecords (April 2026)
        const employees = await Employee.findAll({ limit: 10 });
        if (employees.length === 0) {
            console.log('❌ No employees found.');
            return;
        }

        const year = 2026;
        const month = 4;
        let recordCount = 0;

        for (let i = 0; i < 5; i++) {
            const emp = employees[i];
            for (let day = 1; day <= 10; day++) {
                const date = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                const route = createdRoutes[Math.floor(Math.random() * createdRoutes.length)];
                const vehicle = createdVehicles[Math.floor(Math.random() * createdVehicles.length)];
                const types = ['Regular', 'OT_Holiday', 'OT_Sunday', 'OT_Replace'];
                const type = types[Math.floor(Math.random() * types.length)];

                await WorkRecord.create({
                    date,
                    type,
                    trips: Math.floor(Math.random() * 3) + 1,
                    rate: route.trip_rate,
                    employee_id: emp.id,
                    route_id: route.id,
                    vehicle_id: vehicle.id
                });
                recordCount++;
            }
        }
        console.log(`✅ Seeded ${recordCount} work records for April 2026.`);
        console.log('🚀 Mockup data seeding completed!');

    } catch (err) {
        console.error('❌ Seeding failed:', err);
    } finally {
        process.exit();
    }
}

seedMockup();
