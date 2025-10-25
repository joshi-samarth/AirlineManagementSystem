const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const User = require('../models/User');
const Passenger = require('../models/Passenger');
const { Op } = require('sequelize');

// ADMIN: GET ALL BOOKINGS
exports.getAllBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    if (status && status !== 'all') {
      whereClause.bookingStatus = status;
    }

    const bookings = await Booking.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          attributes: ['id', 'fullName', 'email'],
        },
        {
          model: Flight,
          attributes: ['flightNumber', 'airline', 'departureCity', 'arrivalCity', 'departureDate', 'departureTime', 'arrivalTime'],
        },
        {
          model: Passenger,
          attributes: ['fullName', 'age', 'gender', 'seatAssignment'],
        },
      ],
      order: [['bookingDate', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      success: true,
      data: {
        bookings: bookings.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(bookings.count / limit),
          totalBookings: bookings.count,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error('Get All Bookings Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching bookings', 
      error: error.message 
    });
  }
};

// ADMIN: GET SINGLE BOOKING DETAILS
exports.getBookingDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findByPk(bookingId, {
      include: [
        {
          model: User,
          attributes: ['id', 'fullName', 'email', 'age', 'role'],
        },
        {
          model: Flight,
        },
        {
          model: Passenger,
        },
      ],
    });

    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found' 
      });
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error('Get Booking Details Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching booking details', 
      error: error.message 
    });
  }
};

// ADMIN: UPDATE BOOKING STATUS
exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { bookingStatus, paymentStatus, specialRequests } = req.body;

    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found' 
      });
    }

    // Prepare update data
    const updateData = {};
    if (bookingStatus) updateData.bookingStatus = bookingStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (specialRequests !== undefined) updateData.specialRequests = specialRequests;

    // If changing to cancelled, set cancellation date
    if (bookingStatus === 'cancelled' && booking.bookingStatus !== 'cancelled') {
      updateData.cancellationDate = new Date();
      updateData.refundAmount = booking.totalPrice; // Full refund for admin cancellation
      
      // Restore available seats
      const flight = await Flight.findByPk(booking.flightId);
      if (flight) {
        await flight.update({
          availableSeats: flight.availableSeats + booking.numberOfPassengers,
        });
      }
    }

    await booking.update(updateData);

    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: booking,
    });
  } catch (error) {
    console.error('Update Booking Status Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating booking', 
      error: error.message 
    });
  }
};

// ADMIN: CANCEL BOOKING WITH FULL REFUND
exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found' 
      });
    }

    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({ 
        success: false,
        message: 'Booking already cancelled' 
      });
    }

    // Update booking status
    await booking.update({
      bookingStatus: 'cancelled',
      cancellationDate: new Date(),
      refundAmount: booking.totalPrice, // Full refund for admin cancellation
      specialRequests: reason ? `${booking.specialRequests || ''}\nAdmin Cancellation: ${reason}`.trim() : booking.specialRequests,
    });

    // Restore available seats
    const flight = await Flight.findByPk(booking.flightId);
    if (flight) {
      await flight.update({
        availableSeats: flight.availableSeats + booking.numberOfPassengers,
      });
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully with full refund',
      data: {
        bookingReference: booking.bookingReference,
        refundAmount: booking.totalPrice,
      },
    });
  } catch (error) {
    console.error('Admin Cancel Booking Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error cancelling booking', 
      error: error.message 
    });
  }
};

// ADMIN: GET BOOKING STATISTICS
exports.getBookingStats = async (req, res) => {
  try {
    const totalBookings = await Booking.count();
    const confirmedBookings = await Booking.count({ where: { bookingStatus: 'confirmed' } });
    const cancelledBookings = await Booking.count({ where: { bookingStatus: 'cancelled' } });
    const pendingBookings = await Booking.count({ where: { bookingStatus: 'pending' } });
    
    const totalRevenue = await Booking.sum('totalPrice', { 
      where: { 
        bookingStatus: 'confirmed',
        paymentStatus: 'completed'
      } 
    }) || 0;
    
    const totalRefunds = await Booking.sum('refundAmount', { 
      where: { 
        bookingStatus: 'cancelled',
        refundAmount: { [Op.ne]: null }
      } 
    }) || 0;

    // Calculate average booking value
    const avgBookingValue = totalBookings > 0 ? totalRevenue / confirmedBookings : 0;
    
    // Calculate confirmation rate
    const confirmationRate = totalBookings > 0 ? (confirmedBookings / totalBookings) * 100 : 0;

    // Get recent bookings (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentBookings = await Booking.count({
      where: {
        bookingDate: { [Op.gte]: sevenDaysAgo }
      }
    });

    // Get monthly revenue
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);
    
    const monthlyRevenue = await Booking.sum('totalPrice', {
      where: {
        bookingStatus: 'confirmed',
        paymentStatus: 'completed',
        bookingDate: { [Op.gte]: currentMonth }
      }
    }) || 0;

    res.json({
      success: true,
      data: {
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        pendingBookings,
        totalRevenue: parseFloat(totalRevenue).toFixed(2),
        totalRefunds: parseFloat(totalRefunds).toFixed(2),
        netRevenue: parseFloat(totalRevenue - totalRefunds).toFixed(2),
        avgBookingValue: parseFloat(avgBookingValue).toFixed(2),
        confirmationRate: parseFloat(confirmationRate).toFixed(2),
        recentBookings,
        monthlyRevenue: parseFloat(monthlyRevenue).toFixed(2),
      },
    });
  } catch (error) {
    console.error('Get Booking Stats Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching booking statistics', 
      error: error.message 
    });
  }
};

// ADMIN: GET REVENUE REPORT
exports.getRevenueReport = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    let whereClause = {
      bookingStatus: 'confirmed',
      paymentStatus: 'completed',
    };

    if (startDate && endDate) {
      whereClause.bookingDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // Get revenue data
    const revenueData = await Booking.findAll({
      where: whereClause,
      attributes: [
        'bookingDate',
        'totalPrice',
        'numberOfPassengers',
      ],
      include: [
        {
          model: Flight,
          attributes: ['airline', 'departureCity', 'arrivalCity'],
        }
      ],
      order: [['bookingDate', 'DESC']],
    });

    // Group revenue by date
    const groupedRevenue = {};
    revenueData.forEach(booking => {
      const date = booking.bookingDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      if (!groupedRevenue[date]) {
        groupedRevenue[date] = {
          date,
          revenue: 0,
          bookings: 0,
          passengers: 0,
        };
      }
      
      groupedRevenue[date].revenue += parseFloat(booking.totalPrice);
      groupedRevenue[date].bookings += 1;
      groupedRevenue[date].passengers += booking.numberOfPassengers;
    });

    const reportData = Object.values(groupedRevenue).sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      success: true,
      data: {
        reportData,
        summary: {
          totalRevenue: revenueData.reduce((sum, booking) => sum + parseFloat(booking.totalPrice), 0),
          totalBookings: revenueData.length,
          totalPassengers: revenueData.reduce((sum, booking) => sum + booking.numberOfPassengers, 0),
          dateRange: {
            from: startDate || 'All time',
            to: endDate || 'All time',
          }
        }
      },
    });
  } catch (error) {
    console.error('Get Revenue Report Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error generating revenue report', 
      error: error.message 
    });
  }
};

module.exports = exports;

