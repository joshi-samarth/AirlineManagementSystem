// Run this file once to seed your database with sample flights
// Command: node seedFlights.js

require('dotenv').config();
const sequelize = require('./config/database');
const Flight = require('./models/Flight');

const sampleFlights = [
  {
    flightNumber: 'AI101',
    airline: 'Air India',
    departureCity: 'Mumbai',
    arrivalCity: 'Delhi',
    departureTime: '08:00',
    arrivalTime: '10:15',
    departureDate: '2025-11-15',
    price: 4500,
    totalSeats: 180,
    availableSeats: 45,
    duration: '2h 15m',
    flightType: 'domestic',
    status: 'ontime',
  },
  {
    flightNumber: 'IG202',
    airline: 'IndiGo',
    departureCity: 'Mumbai',
    arrivalCity: 'Delhi',
    departureTime: '11:30',
    arrivalTime: '13:45',
    departureDate: '2025-11-15',
    price: 5200,
    totalSeats: 180,
    availableSeats: 32,
    duration: '2h 15m',
    flightType: 'domestic',
    status: 'ontime',
  },
  {
    flightNumber: 'SG303',
    airline: 'SpiceJet',
    departureCity: 'Mumbai',
    arrivalCity: 'Delhi',
    departureTime: '15:15',
    arrivalTime: '17:30',
    departureDate: '2025-11-15',
    price: 3800,
    totalSeats: 180,
    availableSeats: 28,
    duration: '2h 15m',
    flightType: 'domestic',
    status: 'ontime',
  },
  {
    flightNumber: 'AI104',
    airline: 'Air India',
    departureCity: 'Mumbai',
    arrivalCity: 'Delhi',
    departureTime: '18:45',
    arrivalTime: '21:00',
    departureDate: '2025-11-15',
    price: 6100,
    totalSeats: 180,
    availableSeats: 50,
    duration: '2h 15m',
    flightType: 'domestic',
    status: 'ontime',
  },
  {
    flightNumber: 'AI501',
    airline: 'Air India',
    departureCity: 'Delhi',
    arrivalCity: 'Bangalore',
    departureTime: '09:00',
    arrivalTime: '12:30',
    departureDate: '2025-11-15',
    price: 5500,
    totalSeats: 180,
    availableSeats: 35,
    duration: '3h 30m',
    flightType: 'domestic',
    status: 'ontime',
  },
  {
    flightNumber: 'IG602',
    airline: 'IndiGo',
    departureCity: 'Delhi',
    arrivalCity: 'Bangalore',
    departureTime: '14:00',
    arrivalTime: '17:30',
    departureDate: '2025-11-15',
    price: 4900,
    totalSeats: 180,
    availableSeats: 42,
    duration: '3h 30m',
    flightType: 'domestic',
    status: 'ontime',
  },
  {
    flightNumber: 'AI701',
    airline: 'Air India',
    departureCity: 'Bangalore',
    arrivalCity: 'Chennai',
    departureTime: '08:30',
    arrivalTime: '10:00',
    departureDate: '2025-11-15',
    price: 3200,
    totalSeats: 180,
    availableSeats: 55,
    duration: '1h 30m',
    flightType: 'domestic',
    status: 'ontime',
  },
  {
    flightNumber: 'SG804',
    airline: 'SpiceJet',
    departureCity: 'Bangalore',
    arrivalCity: 'Chennai',
    departureTime: '16:00',
    arrivalTime: '17:30',
    departureDate: '2025-11-15',
    price: 2900,
    totalSeats: 180,
    availableSeats: 60,
    duration: '1h 30m',
    flightType: 'domestic',
    status: 'ontime',
  },
  {
    flightNumber: 'AI901',
    airline: 'Air India',
    departureCity: 'Mumbai',
    arrivalCity: 'Bangalore',
    departureTime: '10:00',
    arrivalTime: '13:30',
    departureDate: '2025-11-15',
    price: 5800,
    totalSeats: 180,
    availableSeats: 40,
    duration: '3h 30m',
    flightType: 'domestic',
    status: 'ontime',
  },
  {
    flightNumber: 'IG1002',
    airline: 'IndiGo',
    departureCity: 'Delhi',
    arrivalCity: 'Kolkata',
    departureTime: '07:30',
    arrivalTime: '10:00',
    departureDate: '2025-11-15',
    price: 4100,
    totalSeats: 180,
    availableSeats: 48,
    duration: '2h 30m',
    flightType: 'domestic',
    status: 'ontime',
  },
];

const seedDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');

    await Flight.sync({ alter: true });
    console.log('Flight table synced');

    await Flight.bulkCreate(sampleFlights);
    console.log('✅ Sample flights seeded successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();