const express = require('express');
const router = express.Router();
const flightController = require('../controllers/flightController');
const { authMiddleware } = require('../middleware/auth');

// Public routes (no auth required)
router.get('/search', flightController.searchFlights);
router.get('/:flightId', flightController.getFlightDetails);

// Protected routes (auth required)
router.post('/book', authMiddleware, flightController.createBooking);
router.get('/my-bookings', authMiddleware, flightController.getUserBookings);
router.get('/details/:bookingId', authMiddleware, flightController.getBookingDetails);
router.put('/update/:bookingId', authMiddleware, flightController.updateBooking);
router.delete('/cancel/:bookingId', authMiddleware, flightController.cancelBooking);

module.exports = router;