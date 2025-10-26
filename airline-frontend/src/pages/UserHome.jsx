import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function UserHome() {
  const { user, logout, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // State management
  const [activeTab, setActiveTab] = useState('search');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Search states
  const [searchParams, setSearchParams] = useState({
    departureCity: '',
    arrivalCity: '',
    departureDate: '',
    passengers: 1,
  });
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  
  // Booking states
  const [bookings, setBookings] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [passengerDetails, setPassengerDetails] = useState([]);
  
  // Profile states
  const [editingProfile, setEditingProfile] = useState(false);
  const [updatedUser, setUpdatedUser] = useState(user);

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');

  // Fetch user bookings on mount
  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchUserBookings();
    }
  }, [activeTab]);

  const fetchUserBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(
        `${apiUrl}/api/flights/my-bookings`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (response.data.success && response.data.data) {
        setBookings(response.data.data || []);
      } else {
        setBookings([]);
        setError('No bookings found');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch bookings');
      setBookings([]);
      console.error('Fetch bookings error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(`${apiUrl}/api/flights/search`, {
        params: {
          departureCity: searchParams.departureCity,
          arrivalCity: searchParams.arrivalCity,
          departureDate: searchParams.departureDate,
          passengers: searchParams.passengers,
        }
      });
      
      setSearchResults(response.data.data || []);
      setShowResults(true);
    } catch (err) {
      setError('Failed to search flights');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookFlight = (flight) => {
    setSelectedFlight(flight);
    setPassengerDetails(Array(parseInt(searchParams.passengers)).fill({
      fullName: '',
      age: '',
      gender: '',
      email: user?.email || '',
      phoneNumber: '',
      mealPreference: 'none',
    }));
    setShowBookingModal(true);
  };

  const handlePassengerChange = (index, field, value) => {
    const updated = [...passengerDetails];
    updated[index] = { ...updated[index], [field]: value };
    setPassengerDetails(updated);
  };

  const validatePassengerDetails = () => {
    const errors = [];
    
    passengerDetails.forEach((passenger, index) => {
      if (!passenger.fullName || passenger.fullName.trim().length < 2) {
        errors.push(`Passenger ${index + 1}: Full name is required (minimum 2 characters)`);
      }
      if (!passenger.age || isNaN(passenger.age) || passenger.age < 1 || passenger.age > 120) {
        errors.push(`Passenger ${index + 1}: Valid age is required (1-120)`);
      }
      if (!passenger.gender || !['male', 'female', 'other'].includes(passenger.gender)) {
        errors.push(`Passenger ${index + 1}: Gender selection is required`);
      }
      if (!passenger.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(passenger.email)) {
        errors.push(`Passenger ${index + 1}: Valid email is required`);
      }
      if (!passenger.phoneNumber || passenger.phoneNumber.trim().length < 10) {
        errors.push(`Passenger ${index + 1}: Valid phone number is required (minimum 10 digits)`);
      }
    });
    
    return errors;
  };

  const confirmBooking = async () => {
    // Validate all passenger details before submitting
    const validationErrors = validatePassengerDetails();
    if (validationErrors.length > 0) {
      setError('Please fix the following errors:\n' + validationErrors.join('\n'));
      return;
    }

    try {
      setLoading(true);
      setError('');

      const bookingData = {
        flightId: selectedFlight.id,
        numberOfPassengers: searchParams.passengers,
        passengers: passengerDetails,
      };

      const response = await axios.post(
        `${apiUrl}/api/flights/book`,
        bookingData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('Booking confirmed! Booking Reference: ' + response.data.data.bookingReference);
      setSelectedFlight(null);
      setShowBookingModal(false);
      setShowResults(false);
      setActiveTab('bookings');
      fetchUserBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking');
      console.error('Booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? You will receive 80% refund.')) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      await axios.delete(
        `${apiUrl}/api/flights/cancel/${bookingId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('Booking cancelled successfully');
      fetchUserBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking');
      console.error('Cancel error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProfileUpdate = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Update profile API call
      const response = await axios.put(
        `${apiUrl}/api/auth/update-profile`,
        {
          fullName: updatedUser?.fullName,
          email: updatedUser?.email,
          age: updatedUser?.age,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        // Update the user in context with new data
        const updatedUserData = response.data.user;
        
        // Update context and local state
        updateUser(updatedUserData);
        setUpdatedUser(updatedUserData);
        setEditingProfile(false);
        
        alert('Profile updated successfully!');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold">SkyBook Airlines</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <p className="text-blue-100">Welcome</p>
              <p className="font-semibold">{user?.fullName}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg mb-4">
            {error}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex space-x-4 border-b border-slate-700">
          {['search', 'bookings', 'profile'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-blue-500 text-blue-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'search' && '✈️ Search Flights'}
              {tab === 'bookings' && '🎫 My Bookings'}
              {tab === 'profile' && '👤 My Profile'}
            </button>
          ))}
        </div>

        {/* Search Flights Tab */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-6">Search Flights</h2>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">From</label>
                    <select
                      name="departureCity"
                      value={searchParams.departureCity}
                      onChange={handleSearchChange}
                      className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-blue-500 outline-none"
                    >
                      <option value="">Select city</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Bangalore">Bangalore</option>
                      <option value="Chennai">Chennai</option>
                      <option value="Kolkata">Kolkata</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-300 mb-2">To</label>
                    <select
                      name="arrivalCity"
                      value={searchParams.arrivalCity}
                      onChange={handleSearchChange}
                      className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-blue-500 outline-none"
                    >
                      <option value="">Select city</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Bangalore">Bangalore</option>
                      <option value="Chennai">Chennai</option>
                      <option value="Kolkata">Kolkata</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Departure Date</label>
                    <input
                      type="date"
                      name="departureDate"
                      value={searchParams.departureDate}
                      onChange={handleSearchChange}
                      className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Passengers</label>
                    <input
                      type="number"
                      name="passengers"
                      min="1"
                      max="9"
                      value={searchParams.passengers}
                      onChange={handleSearchChange}
                      className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-blue-500 outline-none"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={handleSearch}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-lg transition"
                    >
                      {loading ? 'Searching...' : 'Search'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Results */}
            {showResults && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">
                  Available Flights: {searchParams.departureCity} to {searchParams.arrivalCity}
                </h3>
                {searchResults.length === 0 ? (
                  <div className="bg-slate-800 rounded-lg p-8 text-center border border-slate-700">
                    <p className="text-slate-400 text-lg">No flights available for selected criteria</p>
                  </div>
                ) : (
                  searchResults.map(flight => (
                    <div key={flight.id} className="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-blue-500 transition">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-slate-400 text-sm">Airline</p>
                          <p className="text-white font-semibold">{flight.airline}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-sm">Flight</p>
                          <p className="text-white font-semibold">{flight.flightNumber}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-sm">Duration</p>
                          <p className="text-white font-semibold">{flight.duration}</p>
                        </div>
                        <div>
                          <p className="text-slate-400 text-sm">Available Seats</p>
                          <p className="text-white font-semibold">{flight.availableSeats}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between bg-slate-700 p-4 rounded-lg mb-4">
                        <div className="text-center flex-1">
                          <p className="text-2xl font-bold text-white">{flight.departureTime}</p>
                          <p className="text-slate-400 text-sm">{flight.departureCity}</p>
                        </div>
                        <div className="flex-1 text-center px-4">
                          <div className="border-t-2 border-slate-600 py-2">
                            <p className="text-slate-400">✈️</p>
                          </div>
                          <p className="text-slate-500 text-xs mt-1">{flight.duration}</p>
                        </div>
                        <div className="text-center flex-1">
                          <p className="text-2xl font-bold text-white">{flight.arrivalTime}</p>
                          <p className="text-slate-400 text-sm">{flight.arrivalCity}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-sm">Price per passenger</p>
                          <p className="text-3xl font-bold text-blue-400">₹{parseFloat(flight.price).toLocaleString('en-IN')}</p>
                        </div>
                        <button
                          onClick={() => handleBookFlight(flight)}
                          disabled={loading || flight.availableSeats < searchParams.passengers}
                          className="bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg transition font-semibold"
                        >
                          {flight.availableSeats < searchParams.passengers ? 'Not Available' : 'Book Now'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* My Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">My Bookings</h2>
            {loading ? (
              <div className="text-center text-slate-400">Loading bookings...</div>
            ) : bookings.length === 0 ? (
              <div className="bg-slate-800 rounded-lg p-12 text-center border border-slate-700">
                <p className="text-slate-400 text-lg">No bookings yet</p>
              </div>
            ) : (
              bookings.map(booking => (
                <div key={booking.id} className={`bg-slate-800 rounded-lg p-6 border-l-4 ${
                  booking.bookingStatus === 'confirmed' ? 'border-l-green-500' : 'border-l-red-500'
                }`}>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
                    <div>
                      <p className="text-slate-400 text-sm">Booking Ref</p>
                      <p className="text-white font-semibold">{booking.bookingReference}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Flight</p>
                      <p className="text-white font-semibold">{booking.Flight?.flightNumber}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Status</p>
                      <p className={`font-semibold capitalize ${booking.bookingStatus === 'confirmed' ? 'text-green-400' : 'text-red-400'}`}>
                        {booking.bookingStatus}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Amount</p>
                      <p className="text-blue-400 font-semibold">₹{parseFloat(booking.totalPrice).toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  <div className="bg-slate-700 p-4 rounded-lg mb-4">
                    <div className="flex items-center justify-between">
                      <div className="text-center flex-1">
                        <p className="text-xl font-bold text-white">{booking.Flight?.departureTime}</p>
                        <p className="text-slate-400 text-sm">{booking.Flight?.departureCity}</p>
                      </div>
                      <div className="flex-1 text-center px-4">
                        <p className="text-slate-400">✈️</p>
                      </div>
                      <div className="text-center flex-1">
                        <p className="text-xl font-bold text-white">{booking.Flight?.arrivalTime}</p>
                        <p className="text-slate-400 text-sm">{booking.Flight?.arrivalCity}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                    <div>
                      <p className="text-slate-400 text-sm">Date</p>
                      <p className="text-white">{booking.Flight?.departureDate}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Passengers</p>
                      <p className="text-white">{booking.numberOfPassengers}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Payment</p>
                      <p className={`font-semibold ${booking.paymentStatus === 'completed' ? 'text-green-400' : 'text-yellow-400'}`}>
                        {booking.paymentStatus}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Booked On</p>
                      <p className="text-white">{new Date(booking.bookingDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Airline</p>
                      <p className="text-white font-semibold">{booking.Flight?.airline}</p>
                    </div>
                  </div>

                  {booking.bookingStatus === 'confirmed' && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      disabled={loading}
                      className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition font-semibold"
                    >
                      {loading ? 'Cancelling...' : 'Cancel Booking'}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* My Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">My Profile</h2>
            <div className="bg-slate-800 rounded-lg p-8 border border-slate-700">
              {!editingProfile ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-slate-400 text-sm mb-2">Full Name</p>
                      <p className="text-white text-lg font-semibold">{user?.fullName}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-2">Email</p>
                      <p className="text-white text-lg font-semibold">{user?.email}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-2">Age</p>
                      <p className="text-white text-lg font-semibold">{user?.age} years</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-2">Account Type</p>
                      <p className="text-white text-lg font-semibold capitalize">{user?.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingProfile(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition font-semibold"
                  >
                    Edit Profile
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <label className="block text-slate-300 text-sm mb-2">Full Name</label>
                    <input
                      type="text"
                      value={updatedUser?.fullName || ''}
                      onChange={(e) => setUpdatedUser({ ...updatedUser, fullName: e.target.value })}
                      className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-sm mb-2">Email</label>
                    <input
                      type="email"
                      value={updatedUser?.email || ''}
                      onChange={(e) => setUpdatedUser({ ...updatedUser, email: e.target.value })}
                      className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-sm mb-2">Age</label>
                    <input
                      type="number"
                      value={updatedUser?.age || ''}
                      onChange={(e) => setUpdatedUser({ ...updatedUser, age: parseInt(e.target.value) })}
                      className="w-full bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="flex space-x-4">
                    <button
                      onClick={handleProfileUpdate}
                      disabled={loading}
                      className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition font-semibold"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => {
                        setEditingProfile(false);
                        setUpdatedUser(user);
                      }}
                      className="flex-1 bg-slate-600 hover:bg-slate-700 text-white px-6 py-2 rounded-lg transition font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedFlight && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-800 rounded-lg max-w-2xl w-full border border-slate-700 my-8">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Passenger Details</h3>
                <button
                  onClick={() => {
                    setShowBookingModal(false);
                    setError('');
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Error Display in Modal */}
              {error && (
                <div className="mb-6 bg-red-500/20 border-l-4 border-red-500 rounded-r-lg p-4">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-semibold text-red-400 text-sm">Validation Error</p>
                      <p className="text-red-300 text-sm mt-1 whitespace-pre-line">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6 max-h-96 overflow-y-auto">
                {passengerDetails.map((passenger, index) => (
                  <div key={index} className="bg-slate-700 p-4 rounded-lg">
                    <p className="text-white font-semibold mb-4">Passenger {index + 1}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={passenger.fullName}
                        onChange={(e) => handlePassengerChange(index, 'fullName', e.target.value)}
                        className="bg-slate-600 text-white px-3 py-2 rounded border border-slate-500 focus:border-blue-500 outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Age"
                        value={passenger.age}
                        onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                        className="bg-slate-600 text-white px-3 py-2 rounded border border-slate-500 focus:border-blue-500 outline-none"
                      />
                      <select
                        value={passenger.gender}
                        onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                        className="bg-slate-600 text-white px-3 py-2 rounded border border-slate-500 focus:border-blue-500 outline-none"
                      >
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                      <input
                        type="email"
                        placeholder="Email"
                        value={passenger.email}
                        onChange={(e) => handlePassengerChange(index, 'email', e.target.value)}
                        className="bg-slate-600 text-white px-3 py-2 rounded border border-slate-500 focus:border-blue-500 outline-none"
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={passenger.phoneNumber}
                        onChange={(e) => handlePassengerChange(index, 'phoneNumber', e.target.value)}
                        className="bg-slate-600 text-white px-3 py-2 rounded border border-slate-500 focus:border-blue-500 outline-none"
                      />
                      <select
                        value={passenger.mealPreference}
                        onChange={(e) => handlePassengerChange(index, 'mealPreference', e.target.value)}
                        className="bg-slate-600 text-white px-3 py-2 rounded border border-slate-500 focus:border-blue-500 outline-none"
                      >
                        <option value="none">No Meal</option>
                        <option value="vegetarian">Vegetarian</option>
                        <option value="non-vegetarian">Non-Vegetarian</option>
                        <option value="vegan">Vegan</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-600 mt-6 pt-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-slate-400 text-sm">Flight</p>
                    <p className="text-white font-semibold">{selectedFlight.airline} {selectedFlight.flightNumber}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Route</p>
                    <p className="text-white font-semibold">{selectedFlight.departureCity} → {selectedFlight.arrivalCity}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Date</p>
                    <p className="text-white font-semibold">{selectedFlight.departureDate}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Passengers</p>
                    <p className="text-white font-semibold">{searchParams.passengers}</p>
                  </div>
                </div>

                <div className="bg-slate-700 p-4 rounded-lg mb-6">
                  <p className="text-slate-400 text-sm">Total Price</p>
                  <p className="text-blue-400 font-bold text-3xl">₹{(parseFloat(selectedFlight.price) * parseInt(searchParams.passengers)).toLocaleString('en-IN')}</p>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={confirmBooking}
                    disabled={loading}
                    className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg transition font-semibold"
                  >
                    {loading ? 'Processing...' : 'Confirm Booking'}
                  </button>
                  <button
                    onClick={() => setShowBookingModal(false)}
                    className="flex-1 bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg transition font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}