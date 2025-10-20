// ============================================================================
// routes/auth.js - CLEAN CODE ONLY
// ============================================================================

const express = require('express');
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/google-signin', authController.googleSignIn);
router.get('/user-info', authMiddleware, authController.getUserInfo);

module.exports = router;