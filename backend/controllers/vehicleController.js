const { Vehicle } = require('../models');

exports.getVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.findAll({ order: [['createdAt', 'DESC']] });
        res.json(vehicles.map(v => ({
            ...v.toJSON(),
            plateNumber: v.plate_number,
            maintenanceInfo: v.maintenance_info
        })));
    } catch (err) {
        console.error('Error fetching vehicles:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.createVehicle = async (req, res) => {
    try {
        const { plateNumber, model, capacity, status, maintenanceInfo } = req.body;
        const v = await Vehicle.create({
            plate_number: plateNumber,
            model,
            capacity,
            status: status || 'active',
            maintenance_info: maintenanceInfo || ''
        });
        res.status(201).json({
            ...v.toJSON(),
            plateNumber: v.plate_number,
            maintenanceInfo: v.maintenance_info
        });
    } catch (err) {
        console.error('Error creating vehicle:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.updateVehicle = async (req, res) => {
    try {
        const { plateNumber, model, capacity, status, maintenanceInfo } = req.body;
        const v = await Vehicle.findByPk(req.params.id);
        if (!v) return res.status(404).json({ message: 'Vehicle not found' });

        await v.update({
            plate_number: plateNumber || v.plate_number,
            model: model || v.model,
            capacity: capacity || v.capacity,
            status: status || v.status,
            maintenance_info: maintenanceInfo || v.maintenance_info
        });
        
        res.json({
            ...v.toJSON(),
            plateNumber: v.plate_number,
            maintenanceInfo: v.maintenance_info
        });
    } catch (err) {
        console.error('Error updating vehicle:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.deleteVehicle = async (req, res) => {
    try {
        await Vehicle.destroy({ where: { id: req.params.id } });
        res.status(200).json({ message: 'Vehicle deleted' });
    } catch (err) {
        console.error('Error deleting vehicle:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
