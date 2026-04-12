const express = require('express');
const router = express.Router();
const { getSchedules, updateSchedule } = require('../controllers/scheduleController');

router.get('/', getSchedules);
router.post('/', updateSchedule);

module.exports = router;
