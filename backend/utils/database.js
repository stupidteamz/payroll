const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

let sequelize;

const dbUrl = process.env.DATABASE_URL;

if (dbUrl && dbUrl.startsWith('postgresql')) {
  console.log('📡 Connecting to PostgreSQL database...');
  sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    logging: false,
    define: {
      underscored: true,
      timestamps: true
    },
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      },
      connectTimeout: 60000 
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else {
  console.log('💾 Connecting to SQLite database...');
  const sqlitePath = dbUrl ? dbUrl.replace('sqlite://', '') : 'payroll.db';
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
