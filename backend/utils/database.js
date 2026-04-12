const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

let sequelize;

if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql')) {
  // PostgreSQL configuration (for Docker/Production)
  console.log('📡 Connecting to PostgreSQL database...');
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    define: {
      underscored: true,
      timestamps: true
    },
    // Useful for some hosted Postgres providers like Render/Heroku
    dialectOptions: process.env.NODE_ENV === 'production' ? {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    } : {}
  });
} else {
  // SQLite configuration (for Local Development)
  console.log('💾 Connecting to SQLite database...');
  const sqlitePath = process.env.DATABASE_URL 
    ? process.env.DATABASE_URL.replace('sqlite://', '') 
    : 'payroll.db';
    
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.isAbsolute(sqlitePath) ? sqlitePath : path.join(__dirname, '..', sqlitePath),
    logging: false,
    define: {
      underscored: true,
      timestamps: true
    }
  });
}

module.exports = sequelize;
