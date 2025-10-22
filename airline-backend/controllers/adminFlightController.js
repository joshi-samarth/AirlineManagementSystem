const Flight = require('../models/Flight');
const Booking = require('../models/Booking');
const { Op } = require('sequelize');

// ADMIN: ADD NEW FLIGHT
exports.addFlight = async (req, res) => {
  try {
    const { flightNumber, airline, departureCity, arrivalCity, departureTime, arrivalTime, departureDate, price, totalSeats, duration, flightType } = req.body;

    // Validate required fields
    if (!flightNumber || !airline || !departureCity || !arrivalCity || !departureTime || !arrivalTime || !departureDate || !price || !duration) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required' 
      });
    }

    // Check if flight already exists
    const existingFlight = await Flight.findOne({ where: { flightNumber } });
    if (existingFlight) {
      return res.status(400).json({ 
        success: false,
        message: 'Flight number already exists' 
      });
    }

    const flight = await Flight.create({
      flightNumber,
      airline,
      departureCity,
      arrivalCity,
      departureTime,
      arrivalTime,
      departureDate,
      price,
      totalSeats: totalSeats || 180,
      availableSeats: totalSeats || 180,
      duration,
      flightType: flightType || 'domestic',
    });

    res.status(201).json({
      success: true,
      message: 'Flight added successfully',
      data: flight,
    });
  } catch (error) {
    console.error('Add Flight Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error adding flight', 
      error: error.message 
    });
  }
};

// ADMIN: UPDATE FLIGHT
exports.updateFlight = async (req, res) => {
  try {
    const { flightId } = req.params;
    const { departureTime, arrivalTime, price, availableSeats, status } = req.body;

    const flight = await Flight.findByPk(flightId);
    if (!flight) {
      return res.status(404).json({ 
        success: false,
        message: 'Flight not found' 
      });
    }

    await flight.update({
      departureTime: departureTime || flight.departureTime,
      arrivalTime: arrivalTime || flight.arrivalTime,
      price: price || flight.price,
      availableSeats: availableSeats !== undefined ? availableSeats : flight.availableSeats,
      status: status || flight.status,
    });

    res.json({
      success: true,
      message: 'Flight updated successfully',
      data: flight,
    });
  } catch (error) {
    console.error('Update Flight Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating flight', 
      error: error.message 
    });
  }
};

// ADMIN: DELETE FLIGHT
exports.deleteFlight = async (req, res) => {
  try {
    const { flightId } = req.params;

    const flight = await Flight.findByPk(flightId);
    if (!flight) {
      return res.status(404).json({ 
        success: false,
        message: 'Flight not found' 
      });
    }

    // Check if flight has any bookings
    const bookingCount = await Booking.count({ where: { flightId } });
    if (bookingCount > 0) {
      return res.status(400).json({ 
        success: false,
        message: `Cannot delete flight with ${bookingCount} existing bookings` 
      });
    }

    await flight.destroy();

    res.json({
      success: true,
      message: 'Flight deleted successfully',
    });
  } catch (error) {
    console.error('Delete Flight Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting flight', 
      error: error.message 
    });
  }
};

// ADMIN: GET ALL FLIGHTS
exports.getAllFlights = async (req, res) => {
  try {
    const flights = await Flight.findAll({
      order: [['departureDate', 'ASC'], ['departureTime', 'ASC']],
    });

    res.json({
      success: true,
      count: flights.length,
      data: flights,
    });
  } catch (error) {
    console.error('Get All Flights Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching flights', 
      error: error.message 
    });
  }
};

// ADMIN: GET FLIGHT STATISTICS
exports.getFlightStats = async (req, res) => {
  try {
    const totalFlights = await Flight.count();
    const totalBookings = await Booking.count();
    const totalRevenue = await Booking.sum('totalPrice', { where: { bookingStatus: 'confirmed' } });
    const confirmedBookings = await Booking.count({ where: { bookingStatus: 'confirmed' } });
    const cancelledBookings = await Booking.count({ where: { bookingStatus: 'cancelled' } });

    res.json({
      success: true,
      data: {
        totalFlights,
        totalBookings,
        confirmedBookings,
        cancelledBookings,
        totalRevenue: totalRevenue || 0,
      },
    });
  } catch (error) {
    console.error('Get Flight Stats Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching statistics', 
      error: error.message 
    });
  }
};

module.exports = exports;