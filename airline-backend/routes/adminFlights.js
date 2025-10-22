const express = require('express');
const router = express.Router();
const adminFlightController = require('../controllers/adminFlightController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// All admin flight routes require authentication and admin role
router.post('/add', authMiddleware, adminMiddleware, adminFlightController.addFlight);
router.put('/update/:flightId', authMiddleware, adminMiddleware, adminFlightController.updateFlight);
router.delete('/delete/:flightId', authMiddleware, adminMiddleware, adminFlightController.deleteFlight);
router.get('/all', authMiddleware, adminMiddleware, adminFlightController.getAllFlights);
router.get('/stats', authMiddleware, adminMiddleware, adminFlightController.getFlightStats);

module.exports = router;