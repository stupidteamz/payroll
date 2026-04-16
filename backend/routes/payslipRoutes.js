const express = require('express');
const router = express.Router();
const { generatePayslip, downloadPayslipPDF, confirmPayroll } = require('../controllers/payslipController');

router.get('/', generatePayslip);
router.get('/download', downloadPayslipPDF);
router.post('/confirm', confirmPayroll);

module.exports = router;
