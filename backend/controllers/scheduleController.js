const { Schedule, Employee, Route, Vehicle } = require('../models');

exports.getSchedules = async (req, res) => {
    try {
        const schedules = await Schedule.findAll({
            include: [
                { model: Employee, attributes: ['thai_name'] },
                { model: Route, attributes: ['name'] },
                { model: Vehicle, attributes: ['plate_number'] }
            ]
        });
        
        // Map to match original response format
        const result = schedules.map(s => ({
            ...s.toJSON(),
            employeeName: s.Employee ? s.Employee.thai_name : null,
            routeName: s.Route ? s.Route.name : null,
            vehiclePlateNumber: s.Vehicle ? s.Vehicle.plate_number : null
        }));
        
        res.json(result);
    } catch (err) {
        console.error('Error fetching schedules:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.updateSchedule = async (req, res) => {
    const { date, employeeId, shift, routeId, vehicleId, isScheduled } = req.body;

    try {
        if (isScheduled) {
            await Schedule.findOrCreate({
                where: { date, employee_id: employeeId, shift, route_id: routeId, vehicle_id: vehicleId }
            });
        } else {
            await Schedule.destroy({
                where: { date, employee_id: employeeId, shift, route_id: routeId, vehicle_id: vehicleId }
            });
        }
        res.status(200).json({ message: 'Schedule updated' });
    } catch (err) {
        console.error('Error updating schedule:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
