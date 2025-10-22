const Flight = require('../models/Flight');
const Booking = require('../models/Booking');
const Passenger = require('../models/Passenger');
const User = require('../models/User');
const { Op } = require('sequelize');

// Generate unique booking reference
const generateBookingReference = () => {
  return 'BK' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
};

// Generate seat number
const generateSeatNumber = () => {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
  const seatRow = rows[Math.floor(Math.random() * rows.length)];
  const seatNumber = Math.floor(Math.random() * 30) + 1;
  return seatRow + seatNumber;
};

// GET ALL FLIGHTS WITH SEARCH FILTERS
exports.searchFlights = async (req, res) => {
  try {
    const { departureCity, arrivalCity, departureDate, passengers } = req.query;

    const whereClause = {};
    if (departureCity) whereClause.departureCity = departureCity;
    if (arrivalCity) whereClause.arrivalCity = arrivalCity;
    if (departureDate) whereClause.departureDate = departureDate;
    whereClause.availableSeats = { [Op.gte]: passengers || 1 };

    const flights = await Flight.findAll({
      where: whereClause,
      order: [['departureTime', 'ASC']],
    });

    res.json({
      success: true,
      count: flights.length,
      data: flights,
    });
  } catch (error) {
    console.error('Search Flights Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error searching flights', 
      error: error.message 
    });
  }
};

// GET SINGLE FLIGHT DETAILS
exports.getFlightDetails = async (req, res) => {
  try {
    const { flightId } = req.params;
    const flight = await Flight.findByPk(flightId);

    if (!flight) {
      return res.status(404).json({ 
        success: false,
        message: 'Flight not found' 
      });
    }

    res.json({
      success: true,
      data: flight,
    });
  } catch (error) {
    console.error('Get Flight Details Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching flight details', 
      error: error.message 
    });
  }
};

// CREATE BOOKING
exports.createBooking = async (req, res) => {
  try {
    const { flightId, numberOfPassengers, passengers, specialRequests } = req.body;
    const userId = req.user.id;

    // Validate flight exists
    const flight = await Flight.findByPk(flightId);
    if (!flight) {
      return res.status(404).json({ 
        success: false,
        message: 'Flight not found' 
      });
    }

    // Check seat availability
    if (flight.availableSeats < numberOfPassengers) {
      return res.status(400).json({ 
        success: false,
        message: `Only ${flight.availableSeats} seats available` 
      });
    }

    // Calculate total price
    const totalPrice = flight.price * numberOfPassengers;

    // Create booking
    const bookingReference = generateBookingReference();
    const booking = await Booking.create({
      bookingReference,
      userId,
      flightId,
      numberOfPassengers,
      totalPrice,
      bookingStatus: 'confirmed',
      paymentStatus: 'completed',
      specialRequests,
      transactionId: 'TXN' + Date.now(),
    });

    // Create passenger records
    if (passengers && Array.isArray(passengers)) {
      for (let passenger of passengers) {
        await Passenger.create({
          bookingId: booking.id,
          fullName: passenger.fullName,
          age: passenger.age,
          gender: passenger.gender,
          email: passenger.email,
          phoneNumber: passenger.phoneNumber,
          mealPreference: passenger.mealPreference || 'none',
          seatAssignment: generateSeatNumber(),
        });
      }
    }

    // Update available seats
    await flight.update({
      availableSeats: flight.availableSeats - numberOfPassengers,
    });

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully',
      data: {
        bookingId: booking.id,
        bookingReference: booking.bookingReference,
        totalPrice: booking.totalPrice,
        numberOfPassengers: booking.numberOfPassengers,
      },
    });
  } catch (error) {
    console.error('Create Booking Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating booking', 
      error: error.message 
    });
  }
};

// GET USER BOOKINGS
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await Booking.findAll({
      where: { userId },
      include: [
        {
          model: Flight,
          attributes: ['flightNumber', 'airline', 'departureCity', 'arrivalCity', 'departureTime', 'arrivalTime', 'departureDate'],
        },
        {
          model: Passenger,
          attributes: ['fullName', 'seatAssignment', 'mealPreference'],
        },
      ],
      order: [['bookingDate', 'DESC']],
    });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error('Get User Bookings Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching bookings', 
      error: error.message 
    });
  }
};

// CANCEL BOOKING
exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    // Find booking
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found' 
      });
    }

    // Check if user owns this booking
    if (booking.userId !== userId) {
      return res.status(403).json({ 
        success: false,
        message: 'Unauthorized access' 
      });
    }

    // Check if already cancelled
    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({ 
        success: false,
        message: 'Booking already cancelled' 
      });
    }

    // Calculate refund (80% of total price)
    const refundAmount = booking.totalPrice * 0.80;

    // Update booking status
    await booking.update({
      bookingStatus: 'cancelled',
      cancellationDate: new Date(),
      refundAmount,
    });

    // Restore available seats in flight
    const flight = await Flight.findByPk(booking.flightId);
    if (flight) {
      await flight.update({
        availableSeats: flight.availableSeats + booking.numberOfPassengers,
      });
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: {
        bookingReference: booking.bookingReference,
        refundAmount,
      },
    });
  } catch (error) {
    console.error('Cancel Booking Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error cancelling booking', 
      error: error.message 
    });
  }
};

// GET BOOKING DETAILS
exports.getBookingDetails = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;

    const booking = await Booking.findByPk(bookingId, {
      include: [
        {
          model: Flight,
          attributes: ['flightNumber', 'airline', 'departureCity', 'arrivalCity', 'departureTime', 'arrivalTime', 'departureDate', 'price'],
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

    if (booking.userId !== userId) {
      return res.status(403).json({ 
        success: false,
        message: 'Unauthorized access' 
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

// UPDATE BOOKING (change meal preferences, special requests)
exports.updateBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.user.id;
    const { specialRequests } = req.body;

    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({ 
        success: false,
        message: 'Booking not found' 
      });
    }

    if (booking.userId !== userId) {
      return res.status(403).json({ 
        success: false,
        message: 'Unauthorized access' 
      });
    }

    await booking.update({ specialRequests });

    res.json({
      success: true,
      message: 'Booking updated successfully',
      data: booking,
    });
  } catch (error) {
    console.error('Update Booking Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating booking', 
      error: error.message 
    });
  }
};