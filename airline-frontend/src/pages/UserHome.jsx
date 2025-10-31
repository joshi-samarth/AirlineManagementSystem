// src/pages/UserHome.jsx - Professional Minimalist Redesign
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

  useEffect(() => {
    setError('');
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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setBookings(response.data.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch bookings');
      setBookings([]);
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
        params: searchParams
      });
      
      setSearchResults(response.data.data || []);
      setShowResults(true);
    } catch (err) {
      setError('Failed to search flights');
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

  const confirmBooking = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.post(
        `${apiUrl}/api/flights/book`,
        {
          flightId: selectedFlight.id,
          numberOfPassengers: searchParams.passengers,
          passengers: passengerDetails,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Booking confirmed! Reference: ' + response.data.data.bookingReference);
      setShowBookingModal(false);
      setShowResults(false);
      setActiveTab('bookings');
      fetchUserBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Cancel this booking? You will receive 80% refund.')) return;

    try {
      setLoading(true);
      await axios.delete(
        `${apiUrl}/api/flights/cancel/${bookingId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Booking cancelled successfully');
      fetchUserBookings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking');
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
      const response = await axios.put(
        `${apiUrl}/api/auth/update-profile`,
        {
          fullName: updatedUser?.fullName,
          email: updatedUser?.email,
          age: updatedUser?.age,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        updateUser(response.data.user);
        setUpdatedUser(response.data.user);
        setEditingProfile(false);
        alert('Profile updated successfully!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left: Logo + Brand */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-slate-900">SkyBook</span>
            </div>

            {/* Center: Navigation Links */}
            <div className="hidden md:flex space-x-1">
              {[
                { id: 'search', label: 'Search Flights', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
                { id: 'bookings', label: 'My Bookings', icon: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z' },
                { id: 'profile', label: 'My Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Right: User Menu */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 bg-slate-100 px-3 py-2 rounded-lg">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {user?.fullName?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-slate-900">{user?.fullName}</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium px-4 py-2 rounded-lg transition-colors text-sm"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden pb-3 flex space-x-2 overflow-x-auto">
            {[
              { id: 'search', label: 'Search' },
              { id: 'bookings', label: 'Bookings' },
              { id: 'profile', label: 'Profile' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Search Flights Tab */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            {/* Search Card */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Search Flights</h2>
              <form onSubmit={handleSearch}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">From</label>
                    <select
                      name="departureCity"
                      value={searchParams.departureCity}
                      onChange={handleSearchChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
                      required
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
                    <label className="block text-sm font-medium text-slate-700 mb-2">To</label>
                    <select
                      name="arrivalCity"
                      value={searchParams.arrivalCity}
                      onChange={handleSearchChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
                      required
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
                    <label className="block text-sm font-medium text-slate-700 mb-2">Date</label>
                    <input
                      type="date"
                      name="departureDate"
                      value={searchParams.departureDate}
                      onChange={handleSearchChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Passengers</label>
                    <input
                      type="number"
                      name="passengers"
                      min="1"
                      max="9"
                      value={searchParams.passengers}
                      onChange={handleSearchChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                      {loading ? 'Searching...' : 'Search'}
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Search Results */}
            {showResults && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Available Flights ({searchResults.length})
                </h3>
                {searchResults.length === 0 ? (
                  <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                    <p className="text-slate-500">No flights found</p>
                  </div>
                ) : (
                  searchResults.map(flight => (
                    <div key={flight.id} className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 hover:border-blue-300 transition-colors">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                        {/* Flight Info */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-slate-900">{flight.departureTime}</p>
                            <p className="text-sm text-slate-600">{flight.departureCity}</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center">
                              <div className="h-px bg-slate-300 flex-1"></div>
                              <svg className="w-5 h-5 text-slate-400 mx-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                              </svg>
                              <div className="h-px bg-slate-300 flex-1"></div>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">{flight.duration}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-slate-900">{flight.arrivalTime}</p>
                            <p className="text-sm text-slate-600">{flight.arrivalCity}</p>
                          </div>
                        </div>

                        {/* Price & Book */}
                        <div className="text-center lg:text-right">
                          <p className="text-sm text-slate-600 mb-1">{flight.airline}</p>
                          <p className="text-2xl font-bold text-blue-600 mb-3">₹{parseFloat(flight.price).toLocaleString('en-IN')}</p>
                          <button
                            onClick={() => handleBookFlight(flight)}
                            disabled={flight.availableSeats < searchParams.passengers}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-2 rounded-lg transition-colors text-sm"
                          >
                            {flight.availableSeats < searchParams.passengers ? 'Sold Out' : 'Book Now'}
                          </button>
                          <p className="text-xs text-slate-500 mt-2">{flight.availableSeats} seats left</p>
                        </div>
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
            <h2 className="text-xl font-bold text-slate-900">My Bookings</h2>
            {loading ? (
              <div className="text-center py-12 text-slate-500">Loading...</div>
            ) : bookings.length === 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
                <p className="text-slate-500">No bookings yet</p>
              </div>
            ) : (
              bookings.map(booking => (
                <div key={booking.id} className="bg-white rounded-lg shadow-sm border-l-4 border-l-green-500 p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Booking Ref</p>
                        <p className="font-semibold text-slate-900">{booking.bookingReference}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Flight</p>
                        <p className="font-semibold text-slate-900">{booking.Flight?.flightNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Route</p>
                        <p className="font-semibold text-slate-900">{booking.Flight?.departureCity} → {booking.Flight?.arrivalCity}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Status</p>
                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                          booking.bookingStatus === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {booking.bookingStatus}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-blue-600 mb-2">₹{parseFloat(booking.totalPrice).toLocaleString('en-IN')}</p>
                      {booking.bookingStatus === 'confirmed' && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* My Profile Tab */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold text-slate-900 mb-6">My Profile</h2>
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
              {!editingProfile ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Full Name</p>
                      <p className="text-lg font-semibold text-slate-900">{user?.fullName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Email</p>
                      <p className="text-lg font-semibold text-slate-900">{user?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Age</p>
                      <p className="text-lg font-semibold text-slate-900">{user?.age} years</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Account Type</p>
                      <p className="text-lg font-semibold text-slate-900 capitalize">{user?.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingProfile(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
                  >
                    Edit Profile
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={updatedUser?.fullName || ''}
                      onChange={(e) => setUpdatedUser({ ...updatedUser, fullName: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={updatedUser?.email || ''}
                      onChange={(e) => setUpdatedUser({ ...updatedUser, email: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Age</label>
                    <input
                      type="number"
                      value={updatedUser?.age || ''}
                      onChange={(e) => setUpdatedUser({ ...updatedUser, age: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-200"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleProfileUpdate}
                      disabled={loading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => {
                        setEditingProfile(false);
                        setUpdatedUser(user);
                      }}
                      className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-6 py-2 rounded-lg transition-colors"
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
          <div className="bg-white rounded-lg max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">Passenger Details</h3>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {passengerDetails.map((passenger, index) => (
                <div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <p className="font-semibold text-slate-900 mb-3">Passenger {index + 1}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={passenger.fullName}
                      onChange={(e) => handlePassengerChange(index, 'fullName', e.target.value)}
                      className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                    <input
                      type="number"
                      placeholder="Age"
                      value={passenger.age}
                      onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                      className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                    <select
                      value={passenger.gender}
                      onChange={(e) => handlePassengerChange(index, 'gender', e.target.value)}
                      className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                    >
                      <option value="">Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    <input
                      type="email"
                      placeholder="Email"
                      value={passenger.email}
                      onChange={(e) => handlePassengerChange(index, 'email', e.target.value)}
                      className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={passenger.phoneNumber}
                      onChange={(e) => handlePassengerChange(index, 'phoneNumber', e.target.value)}
                      className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                    <select
                      value={passenger.mealPreference}
                      onChange={(e) => handlePassengerChange(index, 'mealPreference', e.target.value)}
                      className="px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
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

            <div className="p-6 bg-slate-50 border-t border-slate-200">
              <div className="mb-4">
                <p className="text-sm text-slate-600 mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-blue-600">
                  ₹{(parseFloat(selectedFlight.price) * parseInt(searchParams.passengers)).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={confirmBooking}
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  {loading ? 'Processing...' : 'Confirm Booking'}
                </button>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}