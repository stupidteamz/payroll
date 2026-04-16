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
  bank_name: { type: DataTypes.STRING, defaultValue: 'กสิกรไทย' },
  clothing_allowance: { type: DataTypes.DECIMAL(10, 2), defaultValue: 500.00 },
  utility_allowance: { type: DataTypes.DECIMAL(10, 2), defaultValue: 500.00 },
  deposit_target: { type: DataTypes.DECIMAL(10, 2), defaultValue: 5000.00 },
  deposit_balance: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 }
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
  name: { type: DataTypes.STRING, allowNull: false },
  price_per_trip: { type: DataTypes.DECIMAL(10, 2), defaultValue: 590.00 }
});

const Schedule = sequelize.define('Schedule', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  shift: { type: DataTypes.STRING, allowNull: false }, 
  time_slot: { type: DataTypes.STRING }, 
  work_type: { type: DataTypes.STRING, defaultValue: 'regular' }
});

const Advance = sequelize.define('Advance', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  notes: { type: DataTypes.STRING }
});

const PayrollHistory = sequelize.define('PayrollHistory', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  month: { type: DataTypes.INTEGER, allowNull: false },
  year: { type: DataTypes.INTEGER, allowNull: false },
  base_salary: { type: DataTypes.DECIMAL(10, 2) },
  ot_pay: { type: DataTypes.DECIMAL(10, 2) },
  social_security: { type: DataTypes.DECIMAL(10, 2) },
  advance_deduction: { type: DataTypes.DECIMAL(10, 2) },
  deposit_deduction: { type: DataTypes.DECIMAL(10, 2) },
  net_salary: { type: DataTypes.DECIMAL(10, 2) },
  accumulated_deposit: { type: DataTypes.DECIMAL(10, 2) }
});

// Relationships
Employee.hasMany(Schedule, { foreignKey: 'employee_id' });
Schedule.belongsTo(Employee, { foreignKey: 'employee_id' });

Route.hasMany(Schedule, { foreignKey: 'route_id' });
Schedule.belongsTo(Route, { foreignKey: 'route_id' });

Vehicle.hasMany(Schedule, { foreignKey: 'vehicle_id' });
Schedule.belongsTo(Vehicle, { foreignKey: 'vehicle_id' });

Employee.hasMany(Advance, { foreignKey: 'employee_id' });
Advance.belongsTo(Employee, { foreignKey: 'employee_id' });

Employee.hasMany(PayrollHistory, { foreignKey: 'employee_id' });
PayrollHistory.belongsTo(Employee, { foreignKey: 'employee_id' });

module.exports = { sequelize, Employee, Vehicle, Route, Schedule, Advance, PayrollHistory };
