const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(cors());

// Proxy Endpoint
app.get('/api/config', async (req, res) => {
    try {
        // ดึงจากต้นทางจริง
        const response = await axios.get('https://animegood-admin.vercel.app/api/config?app_id=dooball66');
        
        // เราสามารถแทรกแซงหรือปรับเปลี่ยนค่าได้ตรงนี้ถ้าพี่เอฟต้องการ
        const config = response.data;
        
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch config' });
    }
});

app.listen(process.env.PORT || 3000, () => {
    console.log('Proxy Server running');
});
