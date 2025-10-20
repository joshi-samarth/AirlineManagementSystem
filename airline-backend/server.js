const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/database');
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);

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
    console.log(`📁 Database: ${process.env.DB_NAME}`);
  });
}).catch(err => {
  console.error('❌ Database sync failed:', err.message);
  process.exit(1);
});
