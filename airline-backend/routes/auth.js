const express = require('express');
const authController = require('../controllers/authController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Public routes (no authentication required)
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/google-signin', authController.googleSignIn);

// Protected routes (authentication required)
router.get('/user-info', authMiddleware, authController.getUserInfo);

module.exports = router;
```

---

### **File 9: `server.js`** (Root of backend)
```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/database');
const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL }));  // Allow frontend
app.use(express.json());  // Parse JSON requests

// Routes
app.use('/api/auth', authRoutes);

// Sync database and start server
sequelize.sync({ alter: true }).then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('❌ Database sync failed:', err);
});