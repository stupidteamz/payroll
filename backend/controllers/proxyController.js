const axios = require('axios');

exports.getProxyConfig = async (req, res) => {
    try {
        const response = await axios.get('https://animegood-admin.vercel.app/api/config?app_id=dooball66');
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch config' });
    }
};
