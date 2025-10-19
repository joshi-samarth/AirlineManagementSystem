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
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome, {user?.fullName}! ✈️</h1>
          <p className="text-gray-600 mb-6">You are logged in as a User</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
              <h3 className="font-bold text-lg text-blue-700">Email</h3>
              <p className="text-gray-600 mt-2">{user?.email}</p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
              <h3 className="font-bold text-lg text-green-700">Age</h3>
              <p className="text-gray-600 mt-2">{user?.age || 'N/A'}</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg border-l-4 border-purple-500">
              <h3 className="font-bold text-lg text-purple-700">Role</h3>
              <p className="text-gray-600 mt-2 capitalize">{user?.role}</p>
            </div>
          </div>

          <div className="bg-blue-100 border-l-4 border-blue-500 p-4 rounded mb-8">
            <p className="text-blue-700">
              <strong>Note:</strong> You have limited access. For admin features, contact your administrator.
            </p>
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
  );
}