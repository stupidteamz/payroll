const { Schedule, Employee, Route, Vehicle } = require('../models');
const { getDateFilter } = require('../utils/dateHelper');

exports.getSchedules = async (req, res) => {
    try {
        const { month, year, employeeId } = req.query;
        let where = {};
        
        if (month && year) {
            where = { ...where, ...getDateFilter(month, year) };
        }
        if (employeeId) {
            where.employee_id = employeeId;
        }

        const schedules = await Schedule.findAll({
            where,
            include: [
                { model: Employee, attributes: ['thai_name'] },
                { model: Route, attributes: ['name'] },
                { model: Vehicle, attributes: ['plate_number'] }
            ]
        });
        
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
    const { date, employeeId, shift, routeId, vehicleId, isScheduled, workType, timeSlot } = req.body;

    try {
        if (isScheduled) {
            // Updated to handle timeSlot as part of the unique key for Matrix view
            await Schedule.findOrCreate({
                where: { 
                    date, 
                    employee_id: employeeId, 
                    shift: shift || timeSlot || 'Regular', // Handle both old and new format
                    time_slot: timeSlot || null,
                    route_id: routeId, 
                    vehicle_id: vehicleId 
                },
                defaults: { work_type: workType || 'regular' }
            });
        } else {
            await Schedule.destroy({
                where: { 
                    date, 
                    employee_id: employeeId, 
                    shift: shift || timeSlot || 'Regular',
                    time_slot: timeSlot || null,
                    route_id: routeId, 
                    vehicle_id: vehicleId 
                }
            });
        }
        res.status(200).json({ message: 'Schedule updated' });
    } catch (err) {
        console.error('Error updating schedule:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
