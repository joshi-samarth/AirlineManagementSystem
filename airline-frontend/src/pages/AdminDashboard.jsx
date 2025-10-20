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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">Admin Dashboard 👨‍✈️</h1>
            <p className="text-gray-400 mt-2">Welcome Admin, {user?.fullName}! You have full system access.</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            Logout
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold mb-2">Total Users</h3>
            <p className="text-4xl font-bold">1,234</p>
            <p className="text-blue-200 text-sm mt-2">↑ 12% from last month</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-700 text-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold mb-2">Active Flights</h3>
            <p className="text-4xl font-bold">156</p>
            <p className="text-green-200 text-sm mt-2">All operational</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold mb-2">Total Bookings</h3>
            <p className="text-4xl font-bold">5,678</p>
            <p className="text-purple-200 text-sm mt-2">↑ 8% this week</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-700 text-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-bold mb-2">Revenue</h3>
            <p className="text-4xl font-bold">$125K</p>
            <p className="text-orange-200 text-sm mt-2">↑ 15% this month</p>
          </div>
        </div>

        {/* Admin Profile & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Profile Card */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Admin Profile</h2>
            <div className="space-y-4">
              <div>
                <p className="text-gray-600 text-sm">Name</p>
                <p className="font-semibold text-gray-900">{user?.fullName}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Email</p>
                <p className="font-semibold text-gray-900 break-all">{user?.email}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Access Level</p>
                <p className="font-semibold text-green-600 capitalize">{user?.role}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Status</p>
                <p className="font-semibold text-green-600">🟢 Active</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <button className="bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold transition">
                📊 View Reports
              </button>
              <button className="bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition">
                ➕ Add Flight
              </button>
              <button className="bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-lg font-semibold transition">
                👥 Manage Users
              </button>
              <button className="bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition">
                ⚙️ Settings
              </button>
              <button className="bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-lg font-semibold transition">
                💰 Payments
              </button>
              <button className="bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition">
                🔔 Notifications
              </button>
            </div>
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Recent Activity</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b">
                <p className="text-gray-700">New user registration</p>
                <span className="text-gray-500 text-sm">2 min ago</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <p className="text-gray-700">Flight booking completed</p>
                <span className="text-gray-500 text-sm">15 min ago</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <p className="text-gray-700">Payment processed</p>
                <span className="text-gray-500 text-sm">1 hour ago</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <p className="text-gray-700">System backup completed</p>
                <span className="text-gray-500 text-sm">3 hours ago</span>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">🔧 System Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b">
                <p className="text-gray-700">Database</p>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">🟢 Online</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <p className="text-gray-700">API Server</p>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">🟢 Online</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b">
                <p className="text-gray-700">Firebase Auth</p>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">🟢 Online</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <p className="text-gray-700">Email Service</p>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">🟢 Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}