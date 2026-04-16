const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

const Employee = sequelize.define('Employee', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  employee_id: { type: DataTypes.STRING, unique: true, allowNull: false },
  thai_name: { type: DataTypes.STRING, allowNull: false },
  position: { type: DataTypes.STRING },
  base_salary: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  salary: { type: DataTypes.VIRTUAL, get() { return this.base_salary; } }, // Backward compatibility
  clothing_allowance: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  utility_allowance: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  deposit_target: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  deposit_balance: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  bank_account_number: { type: DataTypes.STRING },
  bank_name: { type: DataTypes.STRING, defaultValue: 'กสิกรไทย' },
  ot_rate: { type: DataTypes.DECIMAL(10, 2), defaultValue: 100.00 }
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
  trip_rate: { type: DataTypes.DECIMAL(10, 2), defaultValue: 590.00 }
});

const WorkRecord = sequelize.define('WorkRecord', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  date: { type: DataTypes.DATEONLY, allowNull: false },
  type: { 
    type: DataTypes.ENUM('Regular', 'OT_Holiday', 'OT_Sunday', 'OT_Replace'), 
    allowNull: false 
  },
  trips: { type: DataTypes.INTEGER, defaultValue: 0 },
  hours: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  rate: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 }
});

const MonthlyDeduction = sequelize.define('MonthlyDeduction', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  month: { type: DataTypes.INTEGER, allowNull: false },
  year: { type: DataTypes.INTEGER, allowNull: false },
  type: { 
    type: DataTypes.ENUM('Advance', 'Absent', 'SocialSecurity', 'Other'), 
    allowNull: false 
  },
  amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  note: { type: DataTypes.STRING }
});

// For backward compatibility with some scripts that use 'Schedule'
const Schedule = WorkRecord;

// Relationships
Employee.hasMany(WorkRecord, { foreignKey: 'employee_id' });
WorkRecord.belongsTo(Employee, { foreignKey: 'employee_id' });

Employee.hasMany(MonthlyDeduction, { foreignKey: 'employee_id' });
MonthlyDeduction.belongsTo(Employee, { foreignKey: 'employee_id' });

Route.hasMany(WorkRecord, { foreignKey: 'route_id' });
WorkRecord.belongsTo(Route, { foreignKey: 'route_id' });

Vehicle.hasMany(WorkRecord, { foreignKey: 'vehicle_id' });
WorkRecord.belongsTo(Vehicle, { foreignKey: 'vehicle_id' });

module.exports = { sequelize, Employee, Vehicle, Route, WorkRecord, MonthlyDeduction, Schedule };
