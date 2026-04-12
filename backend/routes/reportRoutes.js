const express = require('express');
const router = express.Router();
const { generateTripReport, generatePaymentReport, getDashboardSummary } = require('../controllers/reportController');

router.get('/trips', generateTripReport);
router.get('/payments', generatePaymentReport);
router.get('/summary', getDashboardSummary);

module.exports = router;
