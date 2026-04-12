const { Route } = require('../models');

exports.getRoutes = async (req, res) => {
    try {
        const routes = await Route.findAll({ order: [['createdAt', 'DESC']] });
        res.json(routes);
    } catch (err) {
        console.error('Error fetching routes:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.createRoute = async (req, res) => {
    try {
        const { name } = req.body;
        const route = await Route.create({ name });
        res.status(201).json(route);
    } catch (err) {
        console.error('Error creating route:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.updateRoute = async (req, res) => {
    try {
        const { name } = req.body;
        const route = await Route.findByPk(req.params.id);
        if (!route) return res.status(404).json({ message: 'Route not found' });

        await route.update({ name: name || route.name });
        res.json(route);
    } catch (err) {
        console.error('Error updating route:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.deleteRoute = async (req, res) => {
    try {
        await Route.destroy({ where: { id: req.params.id } });
        res.status(200).json({ message: 'Route deleted' });
    } catch (err) {
        console.error('Error deleting route:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
