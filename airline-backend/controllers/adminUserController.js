const User = require('../models/User');
const Booking = require('../models/Booking');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

// ADMIN: GET ALL USERS
exports.getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = {};
    
    // Filter by role
    if (role && role !== 'all') {
      whereClause.role = role;
    }
    
    // Search by name or email
    if (search) {
      whereClause[Op.or] = [
        { fullName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const users = await User.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'fullName', 'email', 'age', 'role', 'createdAt', 'updatedAt'],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Get booking stats for each user
    const usersWithStats = await Promise.all(
      users.rows.map(async (user) => {
        const bookingStats = await Booking.findOne({
          where: { userId: user.id },
          attributes: [
            [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'totalBookings'],
            [require('sequelize').fn('SUM', require('sequelize').col('totalPrice')), 'totalSpent'],
          ],
          raw: true,
        });

        return {
          ...user.toJSON(),
          bookingStats: {
            totalBookings: parseInt(bookingStats?.totalBookings || 0),
            totalSpent: parseFloat(bookingStats?.totalSpent || 0),
          },
        };
      })
    );

    res.json({
      success: true,
      data: {
        users: usersWithStats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(users.count / limit),
          totalUsers: users.count,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error('Get All Users Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching users', 
      error: error.message 
    });
  }
};

// ADMIN: GET SINGLE USER DETAILS
exports.getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId, {
      attributes: ['id', 'fullName', 'email', 'age', 'role', 'googleId', 'createdAt', 'updatedAt'],
    });

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Get user's bookings
    const bookings = await Booking.findAll({
      where: { userId },
      include: [
        {
          model: require('../models/Flight'),
          attributes: ['flightNumber', 'airline', 'departureCity', 'arrivalCity', 'departureDate'],
        }
      ],
      order: [['bookingDate', 'DESC']],
      limit: 5, // Recent 5 bookings
    });

    // Get user statistics
    const userStats = await Booking.findOne({
      where: { userId },
      attributes: [
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'totalBookings'],
        [require('sequelize').fn('SUM', require('sequelize').col('totalPrice')), 'totalSpent'],
        [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN bookingStatus = 'confirmed' THEN 1 END")), 'confirmedBookings'],
        [require('sequelize').fn('COUNT', require('sequelize').literal("CASE WHEN bookingStatus = 'cancelled' THEN 1 END")), 'cancelledBookings'],
      ],
      raw: true,
    });

    res.json({
      success: true,
      data: {
        user: user.toJSON(),
        recentBookings: bookings,
        statistics: {
          totalBookings: parseInt(userStats?.totalBookings || 0),
          totalSpent: parseFloat(userStats?.totalSpent || 0),
          confirmedBookings: parseInt(userStats?.confirmedBookings || 0),
          cancelledBookings: parseInt(userStats?.cancelledBookings || 0),
        },
      },
    });
  } catch (error) {
    console.error('Get User Details Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching user details', 
      error: error.message 
    });
  }
};

// ADMIN: UPDATE USER ROLE
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid role. Must be "user" or "admin"' 
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Prevent admin from demoting themselves
    if (user.id === req.user.id && role === 'user') {
      return res.status(400).json({ 
        success: false,
        message: 'You cannot change your own role' 
      });
    }

    await user.update({ role });

    res.json({
      success: true,
      message: `User role updated to ${role} successfully`,
      data: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Update User Role Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating user role', 
      error: error.message 
    });
  }
};

// ADMIN: DELETE USER
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { force = false } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // Prevent admin from deleting themselves
    if (user.id === req.user.id) {
      return res.status(400).json({ 
        success: false,
        message: 'You cannot delete your own account' 
      });
    }

    // Check if user has active bookings
    const activeBookings = await Booking.count({
      where: { 
        userId,
        bookingStatus: { [Op.in]: ['confirmed', 'pending'] }
      }
    });

    if (activeBookings > 0 && !force) {
      return res.status(400).json({ 
        success: false,
        message: `User has ${activeBookings} active booking(s). Use force=true to delete anyway.`,
        activeBookings 
      });
    }

    // If force delete, cancel all active bookings first
    if (force && activeBookings > 0) {
      await Booking.update(
        { 
          bookingStatus: 'cancelled',
          cancellationDate: new Date(),
          refundAmount: require('sequelize').col('totalPrice'),
        },
        {
          where: { 
            userId,
            bookingStatus: { [Op.in]: ['confirmed', 'pending'] }
          }
        }
      );
    }

    await user.destroy();

    res.json({
      success: true,
      message: 'User deleted successfully',
      data: {
        deletedUser: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
        },
        cancelledBookings: force ? activeBookings : 0,
      },
    });
  } catch (error) {
    console.error('Delete User Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error deleting user', 
      error: error.message 
    });
  }
};

// ADMIN: CREATE NEW USER
exports.createUser = async (req, res) => {
  try {
    const { fullName, email, age, password, role = 'user' } = req.body;

    // Validate required fields
    if (!fullName || !email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Full name, email, and password are required' 
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'Email already registered' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      fullName,
      email: email.toLowerCase(),
      age: age || null,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        age: user.age,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Create User Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating user', 
      error: error.message 
    });
  }
};

// ADMIN: GET USER STATISTICS
exports.getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const adminUsers = await User.count({ where: { role: 'admin' } });
    const regularUsers = await User.count({ where: { role: 'user' } });
    const googleUsers = await User.count({ where: { googleId: { [Op.ne]: null } } });
    
    // Users registered in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentUsers = await User.count({
      where: {
        createdAt: { [Op.gte]: thirtyDaysAgo }
      }
    });

    // Users with bookings
    const usersWithBookings = await User.count({
      include: [{
        model: Booking,
        required: true,
      }]
    });

    // Get age distribution
    const ageStats = await User.findAll({
      attributes: [
        [require('sequelize').fn('AVG', require('sequelize').col('age')), 'avgAge'],
        [require('sequelize').fn('MIN', require('sequelize').col('age')), 'minAge'],
        [require('sequelize').fn('MAX', require('sequelize').col('age')), 'maxAge'],
      ],
      where: { 
        age: { [Op.ne]: null } 
      },
      raw: true,
    });

    // Monthly registration trend (last 6 months)
    const registrationTrend = await Promise.all(
      Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        return User.count({
          where: {
            createdAt: {
              [Op.between]: [startOfMonth, endOfMonth]
            }
          }
        }).then(count => ({
          month: startOfMonth.toISOString().substring(0, 7), // YYYY-MM format
          registrations: count
        }));
      })
    );

    res.json({
      success: true,
      data: {
        totalUsers,
        adminUsers,
        regularUsers,
        googleUsers,
        recentUsers,
        usersWithBookings,
        usersWithoutBookings: totalUsers - usersWithBookings,
        ageStatistics: {
          averageAge: parseFloat(ageStats[0]?.avgAge || 0).toFixed(1),
          minAge: parseInt(ageStats[0]?.minAge || 0),
          maxAge: parseInt(ageStats[0]?.maxAge || 0),
        },
        registrationTrend: registrationTrend.reverse(), // Show oldest to newest
      },
    });
  } catch (error) {
    console.error('Get User Stats Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching user statistics', 
      error: error.message 
    });
  }
};

// ADMIN: UPDATE USER PROFILE
exports.updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { fullName, email, age } = req.body;

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
          id: { [Op.ne]: userId } // Exclude current user
        } 
      });
      
      if (existingUser) {
        return res.status(400).json({ 
          success: false,
          message: 'Email already taken by another user' 
        });
      }
    }

    // Update user
    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email.toLowerCase();
    if (age !== undefined) updateData.age = age;

    await user.update(updateData);

    res.json({
      success: true,
      message: 'User profile updated successfully',
      data: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        age: user.age,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Update User Profile Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error updating user profile', 
      error: error.message 
    });
  }
};

module.exports = exports;

