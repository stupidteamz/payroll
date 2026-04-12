const express = require('express');
const router = express.Router();
const { 
    getDashboardSummary, 
    generateTripReport, 
    generatePaymentReport,
    generateExcelReport,
    generateVehicleReport
} = require('../controllers/reportController');

router.get('/summary', getDashboardSummary);
router.get('/trips', generateTripReport);
router.get('/payments', generatePaymentReport);
router.get('/excel', generateExcelReport);
router.get('/vehicle', generateVehicleReport);

module.exports = router;
