import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Admin Dashboard 👨‍✈️</h1>
          <p className="text-gray-600 mb-6">Welcome Admin, {user?.fullName}! You have full access.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold">Total Users</h3>
            <p className="text-4xl font-bold mt-2">1,234</p>
            <p className="text-blue-100 text-sm mt-2">↑ 12% from last month</p>
          </div>
          <div className="bg-gradient-to-br from-green-400 to-green-600 text-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold">Active Flights</h3>
            <p className="text-4xl font-bold mt-2">156</p>
            <p className="text-green-100 text-sm mt-2">All operational</p>
          </div>
          <div className="bg-gradient-to-br from-purple-400 to-purple-600 text-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold">Total Bookings</h3>
            <p className="text-4xl font-bold mt-2">5,678</p>
            <p className="text-purple-100 text-sm mt-2">↑ 8% this week</p>
          </div>
          <div className="bg-gradient-to-br from-orange-400 to-orange-600 text-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-bold">Occupancy Rate</h3>
            <p className="text-4xl font-bold mt-2">89%</p>
            <p className="text-orange-100 text-sm mt-2">High demand</p>
          </div>
        </div>

        {/* Admin Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Admin Profile</h2>
            <div className="space-y-3">
              <p><strong className="text-gray-700">Name:</strong> <span className="text-gray-600">{user?.fullName}</span></p>
              <p><strong className="text-gray-700">Email:</strong> <span className="text-gray-600">{user?.email}</span></p>
              <p><strong className="text-gray-700">Role:</strong> <span className="text-green-600 font-semibold capitalize">{user?.role}</span></p>
              <p><strong className="text-gray-700">Access Level:</strong> <span className="text-blue-600 font-semibold">Full</span></p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition">
                📊 View Reports
              </button>
              <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded transition">
                ➕ Add New Flight
              </button>
              <button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded transition">
                👥 Manage Users
              </button>
              <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded transition">
                ⚙️ Settings
              </button>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="flex gap-4">
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}