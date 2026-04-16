const express = require('express');
const router = express.Router();
const { getAdvances, createAdvance, deleteAdvance } = require('../controllers/advanceController');

router.get('/', getAdvances);
router.post('/', createAdvance);
router.delete('/:id', deleteAdvance);

module.exports = router;
