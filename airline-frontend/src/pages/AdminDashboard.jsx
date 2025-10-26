import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // State management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Dashboard data
  const [dashboardData, setDashboardData] = useState(null);
  
  // Flight management
  const [flights, setFlights] = useState([]);
  const [showAddFlightModal, setShowAddFlightModal] = useState(false);
  const [editingFlight, setEditingFlight] = useState(null);
  const [newFlight, setNewFlight] = useState({
    flightNumber: '',
    airline: '',
    departureCity: '',
    arrivalCity: '',
    departureTime: '',
    arrivalTime: '',
    departureDate: '',
    price: '',
    totalSeats: 180,
    duration: '',
    flightType: 'domestic',
  });
  
  // Booking management
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  
  // User management
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');

  // Fetch dashboard data
  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboardData();
    } else if (activeTab === 'flights') {
      fetchFlights();
    } else if (activeTab === 'bookings') {
      fetchBookings();
    } else if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${apiUrl}/api/admin/dashboard/overview`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success && response.data.data) {
        setDashboardData(response.data.data);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFlights = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${apiUrl}/api/admin/flights/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success && response.data.data) {
        setFlights(response.data.data || []);
      } else {
        setFlights([]);
        setError('No flights found');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch flights');
      setFlights([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${apiUrl}/api/admin/bookings/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success && response.data.data) {
        setBookings(response.data.data.bookings || []);
      } else {
        setBookings([]);
        setError('No bookings found');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch bookings');
      setBookings([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${apiUrl}/api/admin/users/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success && response.data.data) {
        setUsers(response.data.data.users || []);
      } else {
        setUsers([]);
        setError('No users found');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
      setUsers([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFlight = async () => {
    try {
      setLoading(true);
      await axios.post(`${apiUrl}/api/admin/flights/add`, newFlight, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShowAddFlightModal(false);
      setNewFlight({
        flightNumber: '',
        airline: '',
        departureCity: '',
        arrivalCity: '',
        departureTime: '',
        arrivalTime: '',
        departureDate: '',
        price: '',
        totalSeats: 180,
        duration: '',
        flightType: 'domestic',
      });
      fetchFlights();
      alert('Flight added successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add flight');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFlight = async (flightId) => {
    if (!window.confirm('Are you sure you want to delete this flight?')) return;
    
    try {
      setLoading(true);
      await axios.delete(`${apiUrl}/api/admin/flights/delete/${flightId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchFlights();
      alert('Flight deleted successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete flight');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      setLoading(true);
      await axios.put(`${apiUrl}/api/admin/bookings/status/${bookingId}`, 
        { bookingStatus: status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBookings();
      alert('Booking status updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update booking');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      setLoading(true);
      await axios.delete(`${apiUrl}/api/admin/users/delete/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { force: true }
      });
      fetchUsers();
      alert('User deleted successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h1 className="text-3xl font-bold">✈️ Admin Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm">
              <p className="text-blue-100">Welcome Admin</p>
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
            <button 
              onClick={() => setError('')} 
              className="ml-4 text-red-200 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex space-x-4 border-b border-slate-700">
          {['dashboard', 'flights', 'bookings', 'users'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-semibold transition-colors capitalize ${
                activeTab === tab
                  ? 'border-b-2 border-blue-500 text-blue-400'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'dashboard' && '📊 Dashboard'}
              {tab === 'flights' && '✈️ Flights'}
              {tab === 'bookings' && '🎫 Bookings'}
              {tab === 'users' && '👥 Users'}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {loading ? (
              <div className="text-center text-slate-400 py-12">Loading dashboard data...</div>
            ) : dashboardData ? (
              <>
        {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold mb-2">Total Users</h3>
                    <p className="text-4xl font-bold">{dashboardData.overview.totalUsers}</p>
                    <p className="text-blue-200 text-sm mt-2">
                      {dashboardData.overview.adminUsers} admins, {dashboardData.overview.regularUsers} users
                    </p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-700 text-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold mb-2">Active Flights</h3>
                    <p className="text-4xl font-bold">{dashboardData.overview.activeFlights}</p>
                    <p className="text-green-200 text-sm mt-2">of {dashboardData.overview.totalFlights} total</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold mb-2">Total Bookings</h3>
                    <p className="text-4xl font-bold">{dashboardData.overview.totalBookings}</p>
                    <p className="text-purple-200 text-sm mt-2">
                      {dashboardData.overview.confirmationRate}% confirmed
                    </p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-700 text-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold mb-2">Revenue</h3>
                    <p className="text-4xl font-bold">₹{parseFloat(dashboardData.overview.netRevenue).toLocaleString('en-IN')}</p>
                    <p className="text-orange-200 text-sm mt-2">Net revenue</p>
          </div>
        </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <h3 className="text-xl font-bold text-white mb-4">📋 Recent Bookings</h3>
                    <div className="space-y-3">
                      {dashboardData.activityDetails.recentBookings.slice(0, 5).map(booking => (
                        <div key={booking.id} className="flex items-center justify-between py-2 border-b border-slate-700">
              <div>
                            <p className="text-white font-semibold">{booking.User?.fullName}</p>
                            <p className="text-slate-400 text-sm">
                              {booking.Flight?.flightNumber} • {booking.Flight?.departureCity} → {booking.Flight?.arrivalCity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-blue-400 font-semibold">₹{parseFloat(booking.totalPrice).toLocaleString('en-IN')}</p>
                            <p className={`text-xs ${
                              booking.bookingStatus === 'confirmed' ? 'text-green-400' : 
                              booking.bookingStatus === 'cancelled' ? 'text-red-400' : 'text-yellow-400'
                            }`}>
                              {booking.bookingStatus}
                            </p>
                          </div>
                        </div>
                      ))}
              </div>
              </div>

                  <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <h3 className="text-xl font-bold text-white mb-4">🔧 System Status</h3>
                    <div className="space-y-3">
                      {Object.entries(dashboardData.systemHealth).map(([service, status]) => (
                        <div key={service} className="flex items-center justify-between py-2">
                          <p className="text-slate-300 capitalize">{service.replace(/([A-Z])/g, ' $1')}</p>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            status === 'online' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {status === 'online' ? '🟢 Online' : '🔴 Offline'}
                          </span>
              </div>
                      ))}
              </div>
            </div>
          </div>
              </>
            ) : (
              <div className="text-center text-slate-400 py-12">Failed to load dashboard data</div>
            )}
          </div>
        )}

        {/* Flights Tab */}
        {activeTab === 'flights' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Flight Management</h2>
              <button
                onClick={() => setShowAddFlightModal(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition font-semibold"
              >
                ➕ Add New Flight
              </button>
            </div>

            {loading ? (
              <div className="text-center text-slate-400 py-12">Loading flights...</div>
            ) : (
              <div className="grid gap-6">
                {flights.map(flight => (
                  <div key={flight.id} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                      <div>
                        <p className="text-slate-400 text-sm">Flight</p>
                        <p className="text-white font-bold">{flight.flightNumber}</p>
                        <p className="text-slate-300">{flight.airline}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Route</p>
                        <p className="text-white font-semibold">{flight.departureCity} → {flight.arrivalCity}</p>
                        <p className="text-slate-400 text-sm">{flight.duration}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Schedule</p>
                        <p className="text-white">{flight.departureDate}</p>
                        <p className="text-slate-400 text-sm">{flight.departureTime} - {flight.arrivalTime}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Availability</p>
                        <p className="text-white font-semibold">{flight.availableSeats}/{flight.totalSeats}</p>
                        <p className={`text-sm ${flight.status === 'ontime' ? 'text-green-400' : 'text-yellow-400'}`}>
                          {flight.status}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Price</p>
                        <p className="text-blue-400 font-bold">₹{parseFloat(flight.price).toLocaleString('en-IN')}</p>
                        <button
                          onClick={() => handleDeleteFlight(flight.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded mt-2 transition text-sm"
                        >
                          Delete
              </button>
            </div>
          </div>
        </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Booking Management</h2>

            {loading ? (
              <div className="text-center text-slate-400 py-12">Loading bookings...</div>
            ) : (
              <div className="grid gap-4">
                {bookings.map(booking => (
                  <div key={booking.id} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      <div>
                        <p className="text-slate-400 text-sm">Booking Ref</p>
                        <p className="text-white font-semibold">{booking.bookingReference}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Passenger</p>
                        <p className="text-white font-semibold">{booking.User?.fullName}</p>
                        <p className="text-slate-400 text-sm">{booking.User?.email}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Flight</p>
                        <p className="text-white">{booking.Flight?.flightNumber}</p>
                        <p className="text-slate-400 text-sm">{booking.Flight?.departureCity} → {booking.Flight?.arrivalCity}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Amount</p>
                        <p className="text-blue-400 font-semibold">₹{parseFloat(booking.totalPrice).toLocaleString('en-IN')}</p>
              </div>
                      <div>
                        <p className="text-slate-400 text-sm">Status</p>
                        <p className={`font-semibold ${
                          booking.bookingStatus === 'confirmed' ? 'text-green-400' :
                          booking.bookingStatus === 'cancelled' ? 'text-red-400' : 'text-yellow-400'
                        }`}>
                          {booking.bookingStatus}
                        </p>
              </div>
                      <div>
                        <p className="text-slate-400 text-sm">Actions</p>
                        <div className="space-x-2">
                          {booking.bookingStatus === 'pending' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition"
                            >
                              Confirm
                            </button>
                          )}
                          {booking.bookingStatus === 'confirmed' && (
                            <button
                              onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition"
                            >
                              Cancel
                            </button>
                          )}
              </div>
              </div>
            </div>
          </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">User Management</h2>

            {loading ? (
              <div className="text-center text-slate-400 py-12">Loading users...</div>
            ) : (
              <div className="grid gap-4">
                {users.map(user => (
                  <div key={user.id} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div>
                        <p className="text-slate-400 text-sm">Name</p>
                        <p className="text-white font-semibold">{user.fullName}</p>
                        <p className="text-slate-400 text-sm">{user.email}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">Role</p>
                        <p className={`font-semibold ${user.role === 'admin' ? 'text-purple-400' : 'text-blue-400'}`}>
                          {user.role}
                        </p>
              </div>
                      <div>
                        <p className="text-slate-400 text-sm">Bookings</p>
                        <p className="text-white">{user.bookingStats?.totalBookings || 0}</p>
              </div>
                      <div>
                        <p className="text-slate-400 text-sm">Total Spent</p>
                        <p className="text-blue-400 font-semibold">
                          ₹{parseFloat(user.bookingStats?.totalSpent || 0).toLocaleString('en-IN')}
                        </p>
              </div>
                      <div>
                        <p className="text-slate-400 text-sm">Actions</p>
                        {user.role !== 'admin' && user.id !== user?.id && (
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded text-sm transition"
                          >
                            Delete
                          </button>
                        )}
              </div>
            </div>
          </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Flight Modal */}
      {showAddFlightModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg max-w-2xl w-full p-8 border border-slate-700 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Add New Flight</h3>
              <button
                onClick={() => setShowAddFlightModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Flight Number"
                value={newFlight.flightNumber}
                onChange={(e) => setNewFlight({ ...newFlight, flightNumber: e.target.value })}
                className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-blue-500 outline-none"
              />
              <input
                type="text"
                placeholder="Airline"
                value={newFlight.airline}
                onChange={(e) => setNewFlight({ ...newFlight, airline: e.target.value })}
                className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-blue-500 outline-none"
              />
              <select
                value={newFlight.departureCity}
                onChange={(e) => setNewFlight({ ...newFlight, departureCity: e.target.value })}
                className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-blue-500 outline-none"
              >
                <option value="">Departure City</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Chennai">Chennai</option>
                <option value="Kolkata">Kolkata</option>
              </select>
              <select
                value={newFlight.arrivalCity}
                onChange={(e) => setNewFlight({ ...newFlight, arrivalCity: e.target.value })}
                className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-blue-500 outline-none"
              >
                <option value="">Arrival City</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Bangalore">Bangalore</option>
                <option value="Chennai">Chennai</option>
                <option value="Kolkata">Kolkata</option>
              </select>
              <input
                type="time"
                placeholder="Departure Time"
                value={newFlight.departureTime}
                onChange={(e) => setNewFlight({ ...newFlight, departureTime: e.target.value })}
                className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-blue-500 outline-none"
              />
              <input
                type="time"
                placeholder="Arrival Time"
                value={newFlight.arrivalTime}
                onChange={(e) => setNewFlight({ ...newFlight, arrivalTime: e.target.value })}
                className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-blue-500 outline-none"
              />
              <input
                type="date"
                placeholder="Departure Date"
                value={newFlight.departureDate}
                onChange={(e) => setNewFlight({ ...newFlight, departureDate: e.target.value })}
                className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-blue-500 outline-none"
              />
              <input
                type="number"
                placeholder="Price"
                value={newFlight.price}
                onChange={(e) => setNewFlight({ ...newFlight, price: e.target.value })}
                className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-blue-500 outline-none"
              />
              <input
                type="text"
                placeholder="Duration (e.g., 2h 15m)"
                value={newFlight.duration}
                onChange={(e) => setNewFlight({ ...newFlight, duration: e.target.value })}
                className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-blue-500 outline-none"
              />
              <input
                type="number"
                placeholder="Total Seats"
                value={newFlight.totalSeats}
                onChange={(e) => setNewFlight({ ...newFlight, totalSeats: parseInt(e.target.value) })}
                className="bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                onClick={handleAddFlight}
                disabled={loading}
                className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white px-6 py-3 rounded-lg transition font-semibold"
              >
                {loading ? 'Adding...' : 'Add Flight'}
              </button>
              <button
                onClick={() => setShowAddFlightModal(false)}
                className="flex-1 bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 rounded-lg transition font-semibold"
              >
                Cancel
              </button>
        </div>
      </div>
        </div>
      )}
    </div>
  );
}