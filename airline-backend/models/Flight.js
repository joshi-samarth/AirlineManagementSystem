const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Flight = sequelize.define('Flight', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  flightNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  airline: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  departureCity: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  arrivalCity: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  departureTime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  arrivalTime: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  departureDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  totalSeats: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 180,
  },
  availableSeats: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 180,
  },
  duration: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  flightType: {
    type: DataTypes.ENUM('domestic', 'international'),
    allowNull: false,
    defaultValue: 'domestic',
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'delayed', 'cancelled', 'ontime'),
    allowNull: false,
    defaultValue: 'ontime',
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: true,
});

module.exports = Flight;