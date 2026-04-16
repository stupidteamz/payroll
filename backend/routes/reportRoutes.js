const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

console.log('Report Controller Loaded:', reportController);

router.get('/trips', reportController.generateTripReport);
router.get('/payments', reportController.generatePaymentReport);
router.get('/summary', reportController.getDashboardSummary);

module.exports = router;
