const express = require('express');
const router = express.Router();
const { getVehicles, createVehicle, updateVehicle, deleteVehicle } = require('../controllers/vehicleController');
const { validate, vehicleSchema } = require('../middleware/validator');

router.get('/', getVehicles);
router.post('/', validate(vehicleSchema), createVehicle);
router.put('/:id', validate(vehicleSchema), updateVehicle);
router.delete('/:id', deleteVehicle);

module.exports = router;
