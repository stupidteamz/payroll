const express = require('express');
const router = express.Router();
const { generatePayslip, downloadPayslipPDF } = require('../controllers/payslipController');

router.get('/', generatePayslip);
router.get('/download', downloadPayslipPDF);

module.exports = router;
