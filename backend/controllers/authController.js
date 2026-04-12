const jwt = require('jsonwebtoken');

const login = (req, res) => {
    const { username, password } = req.body;
    
    // Trim and handle case-sensitivity if needed
    const submittedUser = (username || '').trim();
    const submittedPass = (password || '').trim();
    
    const adminUser = (process.env.ADMIN_USER || 'admin').trim();
    const adminPass = (process.env.ADMIN_PASS || 'payroll2026').trim();
    const jwtSecret = process.env.JWT_SECRET || 'super_secret_payroll_key_2026';

    console.log(`[Auth] Attempt: "${submittedUser}" (len: ${submittedUser.length}) | Expected: "${adminUser}" (len: ${adminUser.length})`);
    console.log(`[Auth] Password match: ${submittedPass === adminPass}`);

    if (submittedUser === adminUser && submittedPass === adminPass) {
        const token = jwt.sign({ username }, jwtSecret, { expiresIn: '8h' });
        console.log('[Auth] Login successful');
        res.json({ token });
    } else {
        console.log('[Auth] Login failed: Invalid credentials');
        res.status(401).json({ message: 'Invalid credentials' });
    }
};

module.exports = login;
