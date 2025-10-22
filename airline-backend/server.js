const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/database');
const authRoutes = require('./routes/auth');
const flightRoutes = require('./routes/flights');

// Import models
const User = require('./models/User');
const Flight = require('./models/Flight');
const Booking = require('./models/Booking');
const Passenger = require('./models/Passenger');

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup model associations
User.hasMany(Booking, { foreignKey: 'userId' });
Booking.belongsTo(User, { foreignKey: 'userId' });

Flight.hasMany(Booking, { foreignKey: 'flightId' });
Booking.belongsTo(Flight, { foreignKey: 'flightId' });

Booking.hasMany(Passenger, { foreignKey: 'bookingId' });
Passenger.belongsTo(Booking, { foreignKey: 'bookingId' });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/flights', flightRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Airline Management Backend API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Server error', error: err.message });
});

// Sync database and start server
sequelize.sync({ alter: true }).then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📊 Database: ${process.env.DB_NAME}`);
    console.log(`🔌 CORS enabled for: ${process.env.CLIENT_URL || 'http://localhost:5173'}`);
  });
}).catch(err => {
  console.error('❌ Database sync failed:', err.message);
  process.exit(1);
});