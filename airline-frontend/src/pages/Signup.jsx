// src/pages/Signup.jsx - Professional Minimalist Redesign
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

export default function Signup() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    age: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Firebase Configuration
  const firebaseApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const isFirebaseConfigured = firebaseApiKey && firebaseApiKey !== 'your-firebase-api-key';

  let auth = null;
  if (isFirebaseConfigured) {
    try {
      const app = initializeApp({
        apiKey: firebaseApiKey,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
      });
      auth = getAuth(app);
    } catch (error) {
      auth = null;
    }
  }

  // Password requirements checker
  const getPasswordRequirements = (password) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[@$!%*?&]/.test(password),
    };
  };

  const passwordReqs = getPasswordRequirements(formData.password);

  // Validation
  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'fullName':
        if (!value.trim()) error = 'Full name is required';
        else if (value.trim().length < 2) error = 'Name too short (minimum 2 characters)';
        break;

      case 'email':
        if (!value.trim()) error = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Invalid email format';
        break;

      case 'age':
        if (!value) error = 'Age is required';
        else if (isNaN(value) || value < 18) error = 'Must be 18 or older';
        else if (value > 120) error = 'Please enter a valid age';
        break;

      case 'password':
        if (!value) error = 'Password is required';
        else {
          const missing = [];
          if (value.length < 8) missing.push('8+ characters');
          if (!/[A-Z]/.test(value)) missing.push('uppercase letter');
          if (!/\d/.test(value)) missing.push('number');
          if (!/[@$!%*?&]/.test(value)) missing.push('special character');
          if (missing.length > 0) error = `Missing: ${missing.join(', ')}`;
        }
        break;

      case 'confirmPassword':
        if (!value) error = 'Please confirm your password';
        else if (formData.password && value !== formData.password) error = 'Passwords do not match';
        break;
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }

    if (name === 'password' && touched.confirmPassword) {
      const confirmError = formData.confirmPassword && value !== formData.confirmPassword
        ? 'Passwords do not match'
        : '';
      setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
    }

    setApiError('');
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/signup`,
        {
          fullName: formData.fullName.trim(),
          email: formData.email.trim(),
          age: parseInt(formData.age),
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }
      );

      login(response.data.token, response.data.user);
      navigate(response.data.user.role === 'admin' ? '/admin/dashboard' : '/user/home');
    } catch (error) {
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else if (error.response?.data?.message) {
        setApiError(error.response.data.message);
      } else {
        setApiError('Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (!isFirebaseConfigured || !auth) {
      setApiError('Google Sign-In not configured. Please use email and password.');
      return;
    }

    if (!formData.age) {
      setApiError('Please enter your age before signing up with Google.');
      return;
    }
    
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/google-signin`,
        { idToken, age: parseInt(formData.age) }
      );

      login(response.data.token, response.data.user);
      navigate(response.data.user.role === 'admin' ? '/admin/dashboard' : '/user/home');
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        setApiError('Sign-in cancelled');
      } else {
        setApiError('Google Sign-In failed. Please use email and password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      {/* Main Container */}
      <div className="w-full max-w-md">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-lg mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Create Account</h1>
          <p className="text-sm text-slate-600">Sign up to start booking flights</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-8">
          {/* Error Alert */}
          {apiError && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-sm text-red-800">{apiError}</p>
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-2">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="John Doe"
                className={`w-full px-4 py-3 border ${
                  errors.fullName && touched.fullName ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-200'
                } rounded-lg focus:outline-none focus:ring-4 transition-all`}
              />
              {errors.fullName && touched.fullName && (
                <p className="mt-2 text-xs text-red-600">{errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="you@example.com"
                className={`w-full px-4 py-3 border ${
                  errors.email && touched.email ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-200'
                } rounded-lg focus:outline-none focus:ring-4 transition-all`}
              />
              {errors.email && touched.email && (
                <p className="mt-2 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Age */}
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-slate-700 mb-2">
                Age
              </label>
              <input
                id="age"
                type="number"
                name="age"
                min="18"
                max="120"
                value={formData.age}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="25"
                className={`w-full px-4 py-3 border ${
                  errors.age && touched.age ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-200'
                } rounded-lg focus:outline-none focus:ring-4 transition-all`}
              />
              {errors.age && touched.age && (
                <p className="mt-2 text-xs text-red-600">{errors.age}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Create a strong password"
                  className={`w-full px-4 pr-12 py-3 border ${
                    errors.password && touched.password ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-200'
                  } rounded-lg focus:outline-none focus:ring-4 transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <svg className="h-5 w-5 text-slate-400 hover:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                    )}
                  </svg>
                </button>
              </div>
              {errors.password && touched.password && (
                <p className="mt-2 text-xs text-red-600">{errors.password}</p>
              )}

              {/* Password Requirements - Inline Checklist */}
              {(formData.password || touched.password) && (
                <div className="mt-3 bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <p className="text-xs font-medium text-slate-700 mb-2">Password must contain:</p>
                  <div className="space-y-1">
                    <div className={`flex items-center text-xs ${passwordReqs.length ? 'text-green-600' : 'text-slate-500'}`}>
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        {passwordReqs.length ? (
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        ) : (
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 000 2h4a1 1 0 100-2H8z" clipRule="evenodd"/>
                        )}
                      </svg>
                      <span>At least 8 characters</span>
                    </div>
                    <div className={`flex items-center text-xs ${passwordReqs.uppercase ? 'text-green-600' : 'text-slate-500'}`}>
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        {passwordReqs.uppercase ? (
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        ) : (
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 000 2h4a1 1 0 100-2H8z" clipRule="evenodd"/>
                        )}
                      </svg>
                      <span>One uppercase letter</span>
                    </div>
                    <div className={`flex items-center text-xs ${passwordReqs.number ? 'text-green-600' : 'text-slate-500'}`}>
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        {passwordReqs.number ? (
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        ) : (
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 000 2h4a1 1 0 100-2H8z" clipRule="evenodd"/>
                        )}
                      </svg>
                      <span>One number</span>
                    </div>
                    <div className={`flex items-center text-xs ${passwordReqs.special ? 'text-green-600' : 'text-slate-500'}`}>
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        {passwordReqs.special ? (
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                        ) : (
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 000 2h4a1 1 0 100-2H8z" clipRule="evenodd"/>
                        )}
                      </svg>
                      <span>One special character (@$!%*?&)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Re-enter your password"
                  className={`w-full px-4 pr-12 py-3 border ${
                    errors.confirmPassword && touched.confirmPassword ? 'border-red-400 focus:ring-red-200' : 'border-slate-200 focus:ring-blue-200'
                  } rounded-lg focus:outline-none focus:ring-4 transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  <svg className="h-5 w-5 text-slate-400 hover:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showConfirmPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                    )}
                  </svg>
                </button>
              </div>
              {errors.confirmPassword && touched.confirmPassword && (
                <p className="mt-2 text-xs text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-4 focus:ring-blue-200"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">OR</span>
            </div>
          </div>

          {/* Google Sign-Up (requires age) */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={loading || !isFirebaseConfigured}
            className="w-full bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-300 text-slate-700 font-semibold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-4 focus:ring-slate-200 flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign up with Google
          </button>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500">
              Login
            </Link>
          </p>

          {/* Terms & Privacy */}
          <p className="mt-4 text-center text-xs text-slate-500">
            By signing up, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:text-blue-500">Terms</a>
            {' '}and{' '}
            <a href="#" className="text-blue-600 hover:text-blue-500">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}