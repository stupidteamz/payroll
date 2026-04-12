const fs = require('fs');
const path = require('path');
const { Employee, sequelize } = require('./models');

async function migrateData() {
    try {
        await sequelize.sync();
        const dataPath = path.join(__dirname, '../employees_data.json');
        const employees = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

        console.log(`Found ${employees.length} employees to migrate.`);

        for (const emp of employees) {
            if (emp.thaiName === 'nan' || !emp.thaiName) continue;

            await Employee.findOrCreate({
                where: { thai_name: emp.thaiName },
                defaults: {
                    employee_id: `EMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    thai_name: emp.thaiName,
                    position: emp.position,
                    salary: emp.salary || 0,
                    bank_account_number: emp.bankAccountNumber === 'nan' ? '' : emp.bankAccountNumber,
                    bank_name: emp.bankName || 'กสิกรไทย',
                    ot_rate: 100
                }
            });
        }

        console.log('Migration completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        process.exit();
    }
}

migrateData();
