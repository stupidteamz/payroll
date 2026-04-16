const { sequelize } = require('./models');

async function fixDb() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const [results] = await sequelize.query("PRAGMA table_info(employees)");
        const columns = results.map(r => r.name);
        console.log('Current columns in employees table:', columns);

        if (!columns.includes('salary')) {
            console.log('Adding salary column...');
            await sequelize.query("ALTER TABLE employees ADD COLUMN salary DECIMAL(10, 2)");
        }
        if (!columns.includes('ot_rate')) {
            console.log('Adding ot_rate column...');
            await sequelize.query("ALTER TABLE employees ADD COLUMN ot_rate DECIMAL(10, 2) DEFAULT 100.00");
        }
        if (!columns.includes('bank_account_number')) {
            console.log('Adding bank_account_number column...');
            await sequelize.query("ALTER TABLE employees ADD COLUMN bank_account_number VARCHAR(255)");
        }
        if (!columns.includes('bank_name')) {
            console.log('Adding bank_name column...');
            await sequelize.query("ALTER TABLE employees ADD COLUMN bank_name VARCHAR(255) DEFAULT 'กสิกรไทย'");
        }

        console.log('Database fix completed.');
        process.exit(0);
    } catch (err) {
        console.error('Error fixing database:', err);
        process.exit(1);
    }
}

fixDb();
