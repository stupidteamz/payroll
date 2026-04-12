const jwt = require('jsonwebtoken');

const login = (req, res) => {
    const { username, password } = req.body;
    
    // ดึงค่าจาก env มาเก็บไว้ก่อนเพื่อความชัวร์ (ถ้าไม่มีให้ใช้ค่าเริ่มต้น)
    const adminUser = process.env.ADMIN_USER || 'admin';
    const adminPass = process.env.ADMIN_PASS || 'payroll2026';
    const jwtSecret = process.env.JWT_SECRET || 'super_secret_payroll_key_2026';

    console.log(`[Auth] Attempt: ${username} | Expected: ${adminUser}`);

    if (username === adminUser && password === adminPass) {
        const token = jwt.sign({ username }, jwtSecret, { expiresIn: '8h' });
        console.log('[Auth] Login successful');
        res.json({ token });
    } else {
        console.log('[Auth] Login failed: Invalid credentials');
        res.status(401).json({ message: 'Invalid credentials' });
    }
};

module.exports = login;
