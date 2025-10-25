const express = require('express');
const router = express.Router();

// Import Controllers
const adminFlightController = require('../controllers/adminFlightController');
const adminBookingController = require('../controllers/adminBookingController');
const adminUserController = require('../controllers/adminUserController');

// Import Middleware
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Apply authentication and admin middleware to all routes
router.use(authMiddleware, adminMiddleware);

// ====================================================================
// FLIGHT MANAGEMENT ROUTES
// ====================================================================
router.post('/flights/add', adminFlightController.addFlight);
router.get('/flights/all', adminFlightController.getAllFlights);
router.get('/flights/stats', adminFlightController.getFlightStats);
router.put('/flights/update/:flightId', adminFlightController.updateFlight);
router.delete('/flights/delete/:flightId', adminFlightController.deleteFlight);

// ====================================================================
// BOOKING MANAGEMENT ROUTES  
// ====================================================================
router.get('/bookings/all', adminBookingController.getAllBookings);
router.get('/bookings/:bookingId', adminBookingController.getBookingDetails);
router.put('/bookings/status/:bookingId', adminBookingController.updateBookingStatus);
router.delete('/bookings/cancel/:bookingId', adminBookingController.cancelBooking);
router.get('/bookings/stats/overview', adminBookingController.getBookingStats);
router.get('/bookings/report/revenue', adminBookingController.getRevenueReport);

// ====================================================================
// USER MANAGEMENT ROUTES
// ====================================================================
router.get('/users/all', adminUserController.getAllUsers);
router.get('/users/:userId', adminUserController.getUserDetails);
router.post('/users/create', adminUserController.createUser);
router.put('/users/role/:userId', adminUserController.updateUserRole);
router.put('/users/profile/:userId', adminUserController.updateUserProfile);
router.delete('/users/delete/:userId', adminUserController.deleteUser);
router.get('/users/stats/overview', adminUserController.getUserStats);

// ====================================================================
// DASHBOARD OVERVIEW ROUTE
// ====================================================================
router.get('/dashboard/overview', async (req, res) => {
  try {
    // Import models
    const User = require('../models/User');
    const Flight = require('../models/Flight');
    const Booking = require('../models/Booking');
    const { Op } = require('sequelize');

    // Get all statistics in parallel
    const [
      // User stats
      totalUsers,
      adminUsers,
      
      // Flight stats
      totalFlights,
      activeFlights,
      
      // Booking stats
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      pendingBookings,
      
      // Revenue stats
      totalRevenue,
      totalRefunds,
      
      // Recent activity (last 7 days)
      recentUsers,
      recentBookings,
    ] = await Promise.all([
      // User counts
      User.count(),
      User.count({ where: { role: 'admin' } }),
      
      // Flight counts
      Flight.count(),
      Flight.count({ where: { status: { [Op.in]: ['ontime', 'delayed'] } } }),
      
      // Booking counts
      Booking.count(),
      Booking.count({ where: { bookingStatus: 'confirmed' } }),
      Booking.count({ where: { bookingStatus: 'cancelled' } }),
      Booking.count({ where: { bookingStatus: 'pending' } }),
      
      // Revenue calculations
      Booking.sum('totalPrice', { 
        where: { 
          bookingStatus: 'confirmed',
          paymentStatus: 'completed' 
        } 
      }),
      Booking.sum('refundAmount', { 
        where: { 
          bookingStatus: 'cancelled',
          refundAmount: { [Op.ne]: null }
        } 
      }),
      
      // Recent activity
      User.count({
        where: {
          createdAt: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      }),
      Booking.count({
        where: {
          bookingDate: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      }),
    ]);

    // Calculate derived metrics
    const netRevenue = (totalRevenue || 0) - (totalRefunds || 0);
    const avgBookingValue = confirmedBookings > 0 ? (totalRevenue || 0) / confirmedBookings : 0;
    const confirmationRate = totalBookings > 0 ? (confirmedBookings / totalBookings) * 100 : 0;
    const regularUsers = totalUsers - adminUsers;

    // Get recent activity details
    const recentActivity = await Promise.all([
      // Recent bookings with details
      Booking.findAll({
        where: {
          bookingDate: { [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
        },
        include: [
          {
            model: User,
            attributes: ['fullName', 'email']
          },
          {
            model: Flight,
            attributes: ['flightNumber', 'airline', 'departureCity', 'arrivalCity']
          }
        ],
        order: [['bookingDate', 'DESC']],
        limit: 10
      }),
      
      // Recent user registrations
      User.findAll({
        where: {
          createdAt: { [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        },
        attributes: ['fullName', 'email', 'role', 'createdAt'],
        order: [['createdAt', 'DESC']],
        limit: 5
      })
    ]);

    res.json({
      success: true,
      data: {
        // Overview Stats
        overview: {
          totalUsers,
          adminUsers,
          regularUsers,
          totalFlights,
          activeFlights,
          totalBookings,
          confirmedBookings,
          cancelledBookings,
          pendingBookings,
          totalRevenue: parseFloat(totalRevenue || 0).toFixed(2),
          totalRefunds: parseFloat(totalRefunds || 0).toFixed(2),
          netRevenue: parseFloat(netRevenue).toFixed(2),
          avgBookingValue: parseFloat(avgBookingValue).toFixed(2),
          confirmationRate: parseFloat(confirmationRate).toFixed(2),
        },
        
        // Recent Activity
        recentActivity: {
          newUsers: recentUsers,
          newBookings: recentBookings,
        },
        
        // Activity Details
        activityDetails: {
          recentBookings: recentActivity[0],
          recentRegistrations: recentActivity[1],
        },
        
        // System Health
        systemHealth: {
          database: 'online',
          apiServer: 'online',
          bookingSystem: 'online',
          paymentSystem: 'online',
        }
      },
    });
  } catch (error) {
    console.error('Dashboard Overview Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching dashboard data', 
      error: error.message 
    });
  }
});

module.exports = router;

