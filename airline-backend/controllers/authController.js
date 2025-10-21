const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validateSignup } = require('../utils/validators');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  }),
});

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
    const { fullName, email, age, password, confirmPassword } = req.body;

    // Validate all inputs
    const { isValid, errors } = validateSignup(fullName, email, age, password, confirmPassword);
    if (!isValid) {
      return res.status(400).json({ message: 'Validation errors', errors });
    }

    // Check if email already exists (for ANY user - admin or regular user)
    const existingUser = await User.findOne({ where: { email: email.trim().toLowerCase() } });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Email already registered',
        errors: { 
          email: 'This email is already in use. Please login or use a different email.' 
        }
      });
    }

    // Hash password with bcrypt (10 salt rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in database
    const user = await User.create({
      fullName,
      email: email.trim().toLowerCase(), // Store email in lowercase for consistency
      age: parseInt(age),
      password: hashedPassword,
      role: 'user', // Default role is 'user'
    });

    // Generate JWT token
    const token = generateToken(user);

    res.status(201).json({
      message: 'Signup successful',
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
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

// GOOGLE SIGN-IN CONTROLLER
exports.googleSignIn = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'ID token required' });
    }

    // Verify token from Firebase
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name } = decodedToken;

    // Normalize email
    const normalizedEmail = email.toLowerCase();

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