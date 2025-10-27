const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validateSignup } = require('../utils/validators');
const admin = require('firebase-admin');

// Initialize Firebase Admin (only if credentials are provided)
let firebaseInitialized = false;
const firebaseProjectId = process.env.FIREBASE_PROJECT_ID;
const firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY;
const firebaseClientEmail = process.env.FIREBASE_CLIENT_EMAIL;

// Only initialize Firebase if valid credentials are provided (not placeholder values)
if (firebaseProjectId && firebasePrivateKey && firebaseClientEmail && 
    firebaseProjectId !== 'your-firebase-project-id' && 
    firebasePrivateKey !== '"-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY_HERE\\n-----END PRIVATE KEY-----\\n"' &&
    firebaseClientEmail !== 'your-service-account-email@your-project-id.iam.gserviceaccount.com') {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: firebaseProjectId,
        privateKey: firebasePrivateKey.replace(/\\n/g, '\n'),
        clientEmail: firebaseClientEmail,
      }),
    });
    firebaseInitialized = true;
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.warn('⚠️  Firebase Admin initialization failed, Google Sign-In will be disabled:', error.message);
    firebaseInitialized = false;
  }
} else {
  console.log('ℹ️  Firebase credentials not configured, Google Sign-In will be disabled');
}

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// SIGNUP CONTROLLER
exports.signup = async (req, res) => {
  try {
    console.log('Signup request received:', req.body);
    const { fullName, email, age, password, confirmPassword } = req.body;

    // Check if all required fields are present
    if (!fullName || !email || !password || !confirmPassword) {
      return res.status(400).json({ 
        message: 'All fields are required',
        errors: {
          fullName: !fullName ? 'Full name is required' : '',
          email: !email ? 'Email is required' : '',
          password: !password ? 'Password is required' : '',
          confirmPassword: !confirmPassword ? 'Confirm password is required' : ''
        }
      });
    }

    // Validate all inputs
    const { isValid, errors } = validateSignup(fullName, email, age, password, confirmPassword);
    if (!isValid) {
      console.log('Validation errors:', errors);
      return res.status(400).json({ message: 'Validation errors', errors });
    }

    // Check if email already exists (for ANY user - admin or regular user)
    const existingUser = await User.findOne({ where: { email: email.trim().toLowerCase() } });
    if (existingUser) {
      console.log('Email already exists:', email);
      return res.status(400).json({ 
        message: 'Email already registered',
        errors: { 
          email: 'This email is already in use. Please login or use a different email.' 
        }
      });
    }

    // Hash password with bcrypt (10 salt rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in database with detailed logging
    console.log('Creating user with data:', {
      fullName,
      email: email.trim().toLowerCase(),
      age: parseInt(age),
      role: 'user'
    });

    const user = await User.create({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(), // Store email in lowercase for consistency
      age: age ? parseInt(age) : null,
      password: hashedPassword,
      role: 'user', // Default role is 'user'
    });

    console.log('User created successfully:', user.id);

    // Generate JWT token
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Signup successful',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        age: user.age,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Signup Error Details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Handle specific database errors
    if (error.name === 'SequelizeValidationError') {
      const validationErrors = {};
      error.errors.forEach(err => {
        validationErrors[err.path] = err.message;
      });
      return res.status(400).json({ 
        success: false,
        message: 'Validation error', 
        errors: validationErrors 
      });
    }
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        success: false,
        message: 'Email already registered',
        errors: { email: 'This email is already in use' }
      });
    }
    
    if (error.name === 'SequelizeConnectionError') {
      return res.status(500).json({ 
        success: false,
        message: 'Database connection error. Please check your database configuration.' 
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Server error during signup', 
      error: error.message 
    });
  }
};

// LOGIN CONTROLLER
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password required',
        errors: {
          email: !email ? 'Email is required' : '',
          password: !password ? 'Password is required' : ''
        }
      });
    }

    // Find user by email (case-insensitive)
    const user = await User.findOne({ 
      where: { email: email.trim().toLowerCase() } 
    });

    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid email or password',
        errors: {
          email: 'No account found with this email'
        }
      });
    }

    // Check if user has a password (not a Google-only account)
    if (!user.password) {
      return res.status(401).json({ 
        message: 'This account was created with Google Sign-In',
        errors: {
          email: 'Please use "Continue with Google" to login'
        }
      });
    }

    // Compare provided password with hashed password in database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Invalid email or password',
        errors: {
          password: 'Incorrect password'
        }
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GOOGLE SIGN-IN CONTROLLER - UPDATED
exports.googleSignIn = async (req, res) => {
  try {
    // Check if Firebase is initialized
    if (!firebaseInitialized) {
      return res.status(503).json({ 
        message: 'Google Sign-In is not configured',
        error: 'Firebase credentials are missing or invalid. Please configure Firebase in .env file to use Google Sign-In.'
      });
    }

    const { idToken, age } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'ID token required' });
    }

    // Verify token from Firebase
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name } = decodedToken;

    // Normalize email
    const normalizedEmail = email.toLowerCase();

    // Validate age if provided
    if (age) {
      if (isNaN(age) || age < 18 || age > 120) {
        return res.status(400).json({ 
          message: 'Invalid age',
          errors: { age: 'Age must be between 18 and 120' }
        });
      }
    }

    // Check if user exists in database (by email OR googleId)
    let user = await User.findOne({
      where: { 
        [require('sequelize').Op.or]: [
          { email: normalizedEmail }, 
          { googleId: uid }
        ] 
      },
    });

    // If user exists but doesn't have googleId, update it
    if (user && !user.googleId) {
      user.googleId = uid;
      await user.save();
    }

    // Create new user if first-time Google login
    if (!user) {
      user = await User.create({
        fullName: name || 'Google User',
        email: normalizedEmail,
        googleId: uid,
        age: age ? parseInt(age) : null,
        role: 'user',
        password: null, // No password for Google sign-in users
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    res.json({
      message: 'Google sign-in successful',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        age: user.age,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Google Sign-in Error:', error);
    res.status(500).json({ message: 'Google sign-in failed', error: error.message });
  }
};

// GET USER INFO CONTROLLER
exports.getUserInfo = async (req, res) => {
  try {
    // req.user contains data from JWT token (added by authMiddleware)
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        age: user.age,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Get User Info Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// UPDATE USER PROFILE CONTROLLER
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, email, age } = req.body;
    const userId = req.user.id;

    // Find the current user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ 
        where: { 
          email: email.toLowerCase(),
          id: { [require('sequelize').Op.ne]: userId }
        } 
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          success: false,
          message: 'Email already taken by another user',
          errors: { email: 'This email is already registered to another account' }
        });
      }
    }

    // Prepare update data
    const updateData = {};
    if (fullName && fullName.trim()) updateData.fullName = fullName.trim();
    if (email && email.trim()) updateData.email = email.toLowerCase().trim();
    if (age !== undefined && age !== null) updateData.age = parseInt(age);

    // Update user
    await user.update(updateData);

    // Return updated user data
    const updatedUser = await User.findByPk(userId);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        age: updatedUser.age,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error while updating profile', 
      error: error.message 
    });
  }
};