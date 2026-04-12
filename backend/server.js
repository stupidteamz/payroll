const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

const logStream = fs.createWriteStream(path.join(__dirname, 'debug.log'), { flags: 'a' });
const log = (msg) => {
    const output = `${new Date().toISOString()} ${msg}\n`;
    console.log(msg);
    logStream.write(output);
};

// Load env FIRST
dotenv.config({ path: path.join(__dirname, '.env') });
if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'super_secret_key_1234';

const { sequelize } = require('./models');
const authMiddleware = require('./middleware/authMiddleware');
const authController = require('./controllers/authController');

const employeeRoutes = require('./routes/employeeRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const routeRoutes = require('./routes/routeRoutes');
const payslipRoutes = require('./routes/payslipRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: '*', // Allow all origins for production stability
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.json());

app.use((req, res, next) => {
    log(`${req.method} ${req.url}`);
    next();
});

// Public Routes
app.post('/login', authController);

// Protected Routes
app.use(authMiddleware);
app.use('/employees', employeeRoutes);
app.use('/vehicles', vehicleRoutes);
app.use('/schedules', scheduleRoutes);
app.use('/routes', routeRoutes);
app.use('/payslips', payslipRoutes);
app.use('/reports', reportRoutes);

app.use((err, req, res, next) => {
    log(`ERROR: ${err.message}`);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

const startServer = async (retries = 5) => {
    while (retries > 0) {
        try {
            await sequelize.authenticate();
            log('Database connection established.');
            await sequelize.sync();
            log('Database models synced.');
            app.listen(port, () => log(`Server is running on port ${port}`));
            return;
        } catch (err) {
            log(`Database connection failed. Retries left: ${retries - 1}`);
            log(`Error: ${err.message}`);
            retries -= 1;
            if (retries === 0) {
                log('CRITICAL STARTUP ERROR: Could not connect to database after multiple retries.');
                process.exit(1);
            }
            await new Promise(res => setTimeout(res, 5000)); // Wait 5 seconds before retrying
        }
    }
};

startServer();
