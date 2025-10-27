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

// Validate passenger data
const validatePassenger = (passenger, index) => {
  const errors = [];
  
  if (!passenger.fullName || passenger.fullName.trim().length < 2) {
    errors.push(`Passenger ${index + 1}: Full name is required (minimum 2 characters)`);
  }
  
  if (!passenger.age || isNaN(passenger.age) || passenger.age < 1 || passenger.age > 120) {
    errors.push(`Passenger ${index + 1}: Valid age is required (1-120)`);
  }
  
  if (!passenger.gender || !['male', 'female', 'other'].includes(passenger.gender)) {
    errors.push(`Passenger ${index + 1}: Gender selection is required`);
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!passenger.email || !emailRegex.test(passenger.email)) {
    errors.push(`Passenger ${index + 1}: Valid email is required`);
  }
  
  if (!passenger.phoneNumber || passenger.phoneNumber.trim().length < 10) {
    errors.push(`Passenger ${index + 1}: Valid phone number is required (minimum 10 digits)`);
  }
  
  return errors;
};

// CREATE BOOKING
exports.createBooking = async (req, res) => {
  try {
    const { flightId, numberOfPassengers, passengers, specialRequests } = req.body;
    const userId = req.user.id;

    console.log('=== CREATE BOOKING ===');
    console.log('User ID:', userId);
    console.log('Flight ID:', flightId);
    console.log('Number of Passengers:', numberOfPassengers);

    // Validate required fields
    if (!flightId || !numberOfPassengers) {
      return res.status(400).json({ 
        success: false,
        message: 'Flight ID and number of passengers are required' 
      });
    }

    // Validate passengers array
    if (!passengers || !Array.isArray(passengers) || passengers.length !== parseInt(numberOfPassengers)) {
      return res.status(400).json({ 
        success: false,
        message: `Passenger details required for ${numberOfPassengers} passenger(s)` 
      });
    }

    // Validate all passenger details
    const validationErrors = [];
    passengers.forEach((passenger, index) => {
      const errors = validatePassenger(passenger, index);
      validationErrors.push(...errors);
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Validation errors',
        errors: validationErrors 
      });
    }

    // Validate flight exists
    const flight = await Flight.findByPk(flightId);
    if (!flight) {
      return res.status(404).json({ 
        success: false,
        message: 'Flight not found' 
      });
    }

    console.log('Flight found:', flight.flightNumber);

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
      bookingDate: new Date(),
    });

    console.log('Booking created:', booking.id, booking.bookingReference);

    // Create passenger records
    for (let passenger of passengers) {
      await Passenger.create({
        bookingId: booking.id,
        fullName: passenger.fullName.trim(),
        age: parseInt(passenger.age),
        gender: passenger.gender,
        email: passenger.email.trim().toLowerCase(),
        phoneNumber: passenger.phoneNumber.trim(),
        mealPreference: passenger.mealPreference || 'none',
        seatAssignment: generateSeatNumber(),
      });
    }

    console.log('Passengers created for booking:', booking.id);

    // Update available seats
    await flight.update({
      availableSeats: flight.availableSeats - numberOfPassengers,
    });

    console.log('Flight seats updated. Remaining seats:', flight.availableSeats - numberOfPassengers);

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

// GET USER BOOKINGS - FIXED VERSION WITH RAW QUERY FALLBACK
exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('\n=== FETCHING BOOKINGS ===');
    console.log('User ID from token:', userId);
    console.log('User email:', req.user.email);
    
    // First, check if user exists
    const user = await User.findByPk(userId);
    console.log('User found:', user ? user.email : 'NOT FOUND');

    // First, let's check all bookings for this user (including those without proper Flight relation)
    const allBookingsForUser = await Booking.findAll({
      where: { userId },
      raw: true
    });
    
    console.log(`Found ${allBookingsForUser.length} bookings for userId ${userId} in database`);
    console.log('Booking IDs:', allBookingsForUser.map(b => b.id).join(', '));
    
    // Try with Sequelize ORM first
    let bookings = await Booking.findAll({
      where: { userId },
      include: [
        {
          model: Flight,
          as: 'Flight', // ✅ Explicitly specify the alias
          required: false,
          attributes: [
            'id', 
            'flightNumber', 
            'airline', 
            'departureCity', 
            'arrivalCity', 
            'departureTime', 
            'arrivalTime', 
            'departureDate', 
            'price', 
            'duration'
          ],
        },
        {
          model: Passenger,
          as: 'Passengers', // ✅ Explicitly specify the alias
          required: false,
          attributes: [
            'id', 
            'fullName', 
            'age', 
            'gender', 
            'seatAssignment', 
            'mealPreference'
          ],
        },
      ],
      order: [['bookingDate', 'DESC']],
    });

    console.log(`Sequelize found ${bookings.length} bookings with relations`);
    
    // If no flight data is populated, manually fetch it
    if (bookings.length > 0) {
      const bookingsWithFlights = await Promise.all(
        bookings.map(async (booking) => {
          const bookingJSON = booking.toJSON();
          
          // If Flight is null or undefined, manually fetch it
          if (!bookingJSON.Flight && bookingJSON.flightId) {
            console.log(`Manually fetching flight ${bookingJSON.flightId} for booking ${bookingJSON.id}`);
            const flight = await Flight.findByPk(bookingJSON.flightId);
            if (flight) {
              bookingJSON.Flight = flight.toJSON();
            }
          }
          
          // If Passengers array is empty, manually fetch them
          if (!bookingJSON.Passengers || bookingJSON.Passengers.length === 0) {
            console.log(`Manually fetching passengers for booking ${bookingJSON.id}`);
            const passengers = await Passenger.findAll({
              where: { bookingId: bookingJSON.id }
            });
            bookingJSON.Passengers = passengers.map(p => p.toJSON());
          }
          
          return bookingJSON;
        })
      );
      
      bookings = bookingsWithFlights;
      console.log('Sample booking with flight:', JSON.stringify(bookings[0], null, 2));
    }

    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error('=== GET USER BOOKINGS ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
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

    console.log('=== CANCEL BOOKING ===');
    console.log('Booking ID:', bookingId);
    console.log('User ID:', userId);

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

    console.log('Booking cancelled:', booking.bookingReference);

    // Restore available seats in flight
    const flight = await Flight.findByPk(booking.flightId);
    if (flight) {
      await flight.update({
        availableSeats: flight.availableSeats + booking.numberOfPassengers,
      });
      console.log('Seats restored. New available seats:', flight.availableSeats);
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
          as: 'Flight',
          attributes: [
            'flightNumber', 
            'airline', 
            'departureCity', 
            'arrivalCity', 
            'departureTime', 
            'arrivalTime', 
            'departureDate', 
            'price'
          ],
        },
        {
          model: Passenger,
          as: 'Passengers',
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

module.exports = exports;