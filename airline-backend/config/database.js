const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create connection to MySQL database
const sequelize = new Sequelize(
  process.env.DB_NAME,      // Database name
  process.env.DB_USER,      // Username
  process.env.DB_PASSWORD,  // Password
  {
    host: process.env.DB_HOST,  // localhost
    dialect: 'mysql',           // Database type
    logging: false,             // Don't log SQL queries
  }
);

module.exports = sequelize;