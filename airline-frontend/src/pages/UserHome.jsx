import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function UserHome() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Welcome, {user?.fullName}! ✈️</h1>
            <p className="text-gray-600 mt-2">You are logged in as a User</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            Logout
          </button>
        </div>

        {/* User Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
            <h3 className="font-bold text-lg text-blue-700 mb-2">Email</h3>
            <p className="text-gray-600 break-all">{user?.email}</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
            <h3 className="font-bold text-lg text-green-700 mb-2">Age</h3>
            <p className="text-gray-600">{user?.age}</p>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500">
            <h3 className="font-bold text-lg text-purple-700 mb-2">Account Type</h3>
            <p className="text-gray-600 capitalize font-semibold text-green-600">{user?.role}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200 hover:shadow-lg transition cursor-pointer">
              <p className="text-2xl mb-2">✈️</p>
              <h3 className="font-bold text-gray-900">Book Flights</h3>
              <p className="text-gray-600 text-sm mt-2">Browse and book available flights</p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg border border-green-200 hover:shadow-lg transition cursor-pointer">
              <p className="text-2xl mb-2">📋</p>
              <h3 className="font-bold text-gray-900">My Bookings</h3>
              <p className="text-gray-600 text-sm mt-2">View and manage your flight bookings</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg border border-purple-200 hover:shadow-lg transition cursor-pointer">
              <p className="text-2xl mb-2">💳</p>
              <h3 className="font-bold text-gray-900">Payment History</h3>
              <p className="text-gray-600 text-sm mt-2">Track your payment transactions</p>
            </div>
            <div className="bg-orange-50 p-6 rounded-lg border border-orange-200 hover:shadow-lg transition cursor-pointer">
              <p className="text-2xl mb-2">⚙️</p>
              <h3 className="font-bold text-gray-900">Account Settings</h3>
              <p className="text-gray-600 text-sm mt-2">Update your profile information</p>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
          <p className="text-blue-900">
            <strong>Note:</strong> As a regular user, you have access to booking and viewing your flights. 
            For administrative features, contact your administrator.
          </p>
        </div>
      </div>
    </div>
  );
}