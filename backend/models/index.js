const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

const Employee = sequelize.define('Employee', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  employee_id: { type: DataTypes.STRING, unique: true, allowNull: false },
  thai_name: { type: DataTypes.STRING, allowNull: false },
  position: { type: DataTypes.STRING },
  salary: { type: DataTypes.DECIMAL(10, 2) },
  ot_rate: { type: DataTypes.DECIMAL(10, 2), defaultValue: 100.00 },
  bank_account_number: { type: DataTypes.STRING },
  bank_name: { type: DataTypes.STRING, defaultValue: 'กสิกรไทย' }
});

const Vehicle = sequelize.define('Vehicle', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  plate_number: { type: DataTypes.STRING, unique: true, allowNull: false },
  model: { type: DataTypes.STRING },
  capacity: { type: DataTypes.INTEGER },
  status: { type: DataTypes.STRING, defaultValue: 'active' },
  maintenance_info: { type: DataTypes.TEXT }
});

const Route = sequelize.define('Route', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false }
});

const Schedule = sequelize.define('Schedule', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  shift: { type: DataTypes.STRING, allowNull: false }
});

// Relationships
Employee.hasMany(Schedule, { foreignKey: 'employee_id' });
Schedule.belongsTo(Employee, { foreignKey: 'employee_id' });
Route.hasMany(Schedule, { foreignKey: 'route_id' });
Schedule.belongsTo(Route, { foreignKey: 'route_id' });
Vehicle.hasMany(Schedule, { foreignKey: 'vehicle_id' });
Schedule.belongsTo(Vehicle, { foreignKey: 'vehicle_id' });

module.exports = { sequelize, Employee, Vehicle, Route, Schedule };
