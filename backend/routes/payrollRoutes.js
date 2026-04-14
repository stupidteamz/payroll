const express = require('express');
const router = express.Router();
const { WorkRecord, MonthlyDeduction, Employee } = require('../models/new_models');

// บันทึกรายการทำงานรายวัน
router.post('/record', async (req, res) => {
    try {
        const { employee_id, date, type, hours_or_trips, rate } = req.body;
        const record = await WorkRecord.create({ employee_id, date, type, hours_or_trips, rate });
        res.status(201).json(record);
    } catch (err) {
        res.status(500).json({ message: 'Error recording work', error: err.message });
    }
});

// บันทึกรายการหักเงินรายเดือน
router.post('/deduction', async (req, res) => {
    try {
        const { employee_id, month, year, type, amount, note } = req.body;
        const deduction = await MonthlyDeduction.create({ employee_id, month, year, type, amount, note });
        res.status(201).json(deduction);
    } catch (err) {
        res.status(500).json({ message: 'Error recording deduction', error: err.message });
    }
});

module.exports = router;
