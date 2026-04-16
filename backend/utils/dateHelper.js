const { Op } = require('sequelize');
const sequelize = require('./database');

/**
 * Unified helper to get date filter (Works for both SQLite and Postgres)
 */
const getDateFilter = (month, year) => {
    const isPostgres = sequelize.getDialect() === 'postgres';
    const m = parseInt(month);
    const y = parseInt(year);

    if (isPostgres) {
        return {
            [Op.and]: [
                sequelize.where(sequelize.fn('EXTRACT', sequelize.literal('MONTH FROM date')), m.toString()),
                sequelize.where(sequelize.fn('EXTRACT', sequelize.literal('YEAR FROM date')), y.toString())
            ]
        };
    }
    
    // Default to SQLite (Using Op.between for better cross-database compatibility)
    // SQLite stores DATEONLY as 'YYYY-MM-DD'
    const startDate = `${y}-${m.toString().padStart(2, '0')}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const endDate = `${y}-${m.toString().padStart(2, '0')}-${lastDay}`;

    return {
        date: {
            [Op.between]: [startDate, endDate]
        }
    };
};

module.exports = {
    getDateFilter
};
