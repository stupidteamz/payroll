const { Advance, Employee } = require('../models');
const { getDateFilter } = require('../utils/dateHelper');

exports.getAdvances = async (req, res) => {
    try {
        const { month, year, employeeId } = req.query;
        let where = {};
        
        if (month && year) {
            where = { ...where, ...getDateFilter(month, year) };
        }
        if (employeeId) {
            where.employee_id = employeeId;
        }

        const advances = await Advance.findAll({
            where,
            include: [{ model: Employee, attributes: ['thai_name', 'employee_id'] }],
            order: [['date', 'DESC']]
        });
        res.json(advances);
    } catch (err) {
        console.error('Error fetching advances:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.createAdvance = async (req, res) => {
    try {
        const { employeeId, date, amount, notes } = req.body;
        const advance = await Advance.create({
            employee_id: employeeId,
            date,
            amount,
            notes
        });
        res.status(201).json(advance);
    } catch (err) {
        console.error('Error creating advance:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.deleteAdvance = async (req, res) => {
    try {
        const { id } = req.params;
        await Advance.destroy({ where: { id } });
        res.json({ message: 'Advance deleted successfully.' });
    } catch (err) {
        console.error('Error deleting advance:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
