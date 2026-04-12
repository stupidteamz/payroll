const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');

// SQLite database path
const dbPath = path.join(__dirname, '..', 'payroll.db');
const db = new sqlite3.Database(dbPath);

// JSON data path
const jsonDataPath = path.join(__dirname, '..', '..', 'employees_data.json');

function dbRun(query, params = []) {
    return new Promise((resolve, reject) => {
        db.run(query, params, function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

async function migrateData() {
    try {
        console.log('Starting migration to SQLite...');

        // Read JSON data
        if (!fs.existsSync(jsonDataPath)) {
            console.error(`Error: File not found at ${jsonDataPath}`);
            process.exit(1);
        }

        const jsonData = fs.readFileSync(jsonDataPath, 'utf8');
        const employees = JSON.parse(jsonData);

        console.log(`Found ${employees.length} records in employees_data.json.`);

        // Create table if not exists
        const createTableQuery = `
            CREATE TABLE IF NOT EXISTS employees (
                id VARCHAR(36) PRIMARY KEY,
                employee_id VARCHAR(50) UNIQUE NOT NULL,
                thai_name VARCHAR(255) NOT NULL,
                position VARCHAR(255),
                salary DECIMAL(10, 2),
                ot_rate DECIMAL(10, 2) DEFAULT 100.00,
                bank_account_number VARCHAR(50),
                bank_name VARCHAR(100) DEFAULT 'กสิกรไทย',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `;
        await dbRun(createTableQuery);
        console.log('Table "employees" is ready.');

        // Prepare INSERT statement
        const insertQuery = `
            INSERT OR IGNORE INTO employees (id, employee_id, thai_name, position, salary, bank_account_number, bank_name, ot_rate)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        let insertedCount = 0;
        for (const employee of employees) {
            // Data cleaning
            const bankAccountNumber = (employee.bankAccountNumber === 'nan' || employee.bankAccountNumber === null) ? null : (typeof employee.bankAccountNumber === 'string' ? employee.bankAccountNumber.trim() : employee.bankAccountNumber);
            const salary = (employee.salary === null || employee.salary === 'nan') ? 0 : parseFloat(employee.salary);
            const employeeId = employee.employeeId || `EMP-${Date.now()}-${insertedCount}`;
            const id = uuidv4();

            const values = [
                id,
                employeeId,
                employee.thaiName || 'N/A',
                employee.position || 'พนักงาน',
                salary,
                bankAccountNumber,
                employee.bankName || 'กสิกรไทย',
                employee.otRate || 100.00
            ];

            try {
                const result = await dbRun(insertQuery, values);
                if (result.changes > 0) insertedCount++;
            } catch (err) {
                console.error(`Error inserting employee "${employee.thaiName}": ${err.message}`);
            }
        }

        console.log(`Migration finished. Successfully inserted ${insertedCount} new records.`);

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        db.close();
        console.log('SQLite connection closed.');
    }
}

migrateData();
