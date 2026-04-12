const express = require('express');
const router = express.Router();
const { getEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee } = require('../controllers/employeeController');
const { validate, employeeSchema } = require('../middleware/validator');

router.get('/', getEmployees);
router.post('/', validate(employeeSchema), createEmployee);
router.get('/:id', getEmployeeById);
router.put('/:id', validate(employeeSchema), updateEmployee);
router.delete('/:id', deleteEmployee);

module.exports = router;