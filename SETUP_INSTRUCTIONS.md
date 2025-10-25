# 🚀 AIRLINE MANAGEMENT SYSTEM - COMPLETE SETUP GUIDE

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Testing the System](#testing-the-system)
6. [Available Features](#available-features)
7. [API Endpoints](#api-endpoints)
8. [Troubleshooting](#troubleshooting)

---

## 📦 Prerequisites

Before starting, ensure you have:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MySQL** (v8.0 or higher) - [Download](https://dev.mysql.com/downloads/)
- **Git** - [Download](https://git-scm.com/)
- A code editor like **VS Code**

---

## 🗄️ Database Setup

### Step 1: Start MySQL Server
```bash
# Windows (if MySQL is in PATH)
mysql -u root -p

# macOS (using Homebrew)
brew services start mysql
mysql -u root -p

# Linux
sudo systemctl start mysql
mysql -u root -p
```

### Step 2: Run Database Script
```sql
-- Copy and paste the entire content from airline-backend/database-setup.sql
-- OR run the file directly:
source /path/to/airline-backend/database-setup.sql;
```

### Step 3: Verify Database Setup
```sql
USE airline_management;
SHOW TABLES;
SELECT COUNT(*) FROM Users;
SELECT COUNT(*) FROM Flights;
```

**Expected Output:**
- 4 tables: Users, Flights, Bookings, Passengers
- 2 users (1 admin, 1 regular user)
- 10 sample flights

---

## 🔧 Backend Setup

### Step 1: Navigate to Backend Directory
```bash
cd airline-backend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Create Environment File
Create a `.env` file in the `airline-backend` folder:
```bash
# Copy content from airline-backend/env-config.txt
# Update the following values:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=airline_management
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
JWT_SECRET=airline_super_secret_jwt_key_change_in_production_2024
JWT_EXPIRE=7d
VITE_API_URL=http://localhost:5000

# Optional: Firebase configuration (for Google Sign-In)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
```

### Step 4: Seed Sample Data (Optional)
```bash
node seedFlights.js
```

### Step 5: Start Backend Server
```bash
npm start
# OR for development with auto-reload
npm run dev
```

**Expected Output:**
```
✅ Server running on http://localhost:5000
📊 Database: airline_management
🔌 CORS enabled for: http://localhost:5173
```

---

## 🎨 Frontend Setup

### Step 1: Navigate to Frontend Directory
```bash
cd airline-frontend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Create Environment File
Create a `.env` file in the `airline-frontend` folder:
```bash
# Copy content from airline-frontend/env-config.txt

VITE_API_URL=http://localhost:5000

# Optional: Firebase configuration (for Google Sign-In)
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-firebase-app-id
```

### Step 4: Start Frontend Server
```bash
npm run dev
```

**Expected Output:**
```
➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

---

## 🧪 Testing the System

### Test Accounts
| Account Type | Email | Password |
|--------------|-------|----------|
| **Admin** | `admin@airline.com` | `Admin@123` |
| **User** | `john@example.com` | `John@123` |

### Step-by-Step Testing

1. **Open Browser**: Navigate to `http://localhost:5173/`

2. **Test Admin Access**:
   - Login with admin credentials
   - View dashboard with real statistics
   - Add new flights
   - Manage bookings and users

3. **Test User Access**:
   - Login with user credentials
   - Search for flights
   - Make a booking
   - View booking history
   - Cancel bookings

4. **Test API Endpoints**:
   ```bash
   # Test health endpoint
   curl http://localhost:5000/
   
   # Test flight search
   curl "http://localhost:5000/api/flights/search?departureCity=Mumbai&arrivalCity=Delhi"
   ```

---

## ✨ Available Features

### 👤 User Features
- ✅ **Authentication**: Email/password + Google OAuth
- ✅ **Flight Search**: By city, date, passengers
- ✅ **Flight Booking**: Multi-passenger with details
- ✅ **Booking Management**: View, cancel with 80% refund
- ✅ **Profile Management**: Edit personal information

### 👨‍💼 Admin Features
- ✅ **Dashboard**: Real-time statistics and analytics
- ✅ **Flight Management**: Add, edit, delete flights
- ✅ **Booking Management**: View, update, cancel with full refund
- ✅ **User Management**: View, edit, delete users
- ✅ **Revenue Reports**: Detailed financial analytics

### 🔧 System Features
- ✅ **Real-time Data**: Live updates across the system
- ✅ **Role-based Access**: Admin vs User permissions
- ✅ **Responsive Design**: Works on desktop and mobile
- ✅ **Error Handling**: Comprehensive error messages
- ✅ **Data Validation**: Input validation on both ends

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/google-signin` - Google OAuth
- `GET /api/auth/user-info` - Get user info (protected)

### User Flights
- `GET /api/flights/search` - Search flights
- `GET /api/flights/:flightId` - Get flight details
- `POST /api/flights/book` - Create booking (protected)
- `GET /api/flights/my-bookings` - Get user bookings (protected)
- `DELETE /api/flights/cancel/:bookingId` - Cancel booking (protected)

### Admin Panel
- `GET /api/admin/dashboard/overview` - Dashboard stats
- `POST /api/admin/flights/add` - Add flight
- `PUT /api/admin/flights/update/:flightId` - Update flight
- `DELETE /api/admin/flights/delete/:flightId` - Delete flight
- `GET /api/admin/bookings/all` - Get all bookings
- `PUT /api/admin/bookings/status/:bookingId` - Update booking status
- `GET /api/admin/users/all` - Get all users
- `DELETE /api/admin/users/delete/:userId` - Delete user

---

## 🔧 Troubleshooting

### Backend Issues

**❌ "Connection refused"**
```bash
# Check if MySQL is running
sudo systemctl status mysql  # Linux
brew services list | grep mysql  # macOS

# Verify database credentials in .env file
```

**❌ "Database airline_management already exists"**
```sql
-- Skip CREATE DATABASE line and run the rest
USE airline_management;
-- Continue with table creation...
```

**❌ "Port 5000 already in use"**
```bash
# Change PORT in .env to 5001
PORT=5001
```

**❌ "Module not found"**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Frontend Issues

**❌ "Cannot connect to API"**
```bash
# Check VITE_API_URL in .env matches backend port
VITE_API_URL=http://localhost:5000

# Ensure backend is running
curl http://localhost:5000
```

**❌ "Tailwind styles not working"**
```bash
# Reinstall Tailwind
npm uninstall tailwindcss
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Database Issues

**❌ "Access denied for user"**
```sql
-- Create new MySQL user
CREATE USER 'airline_user'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON airline_management.* TO 'airline_user'@'localhost';
FLUSH PRIVILEGES;

-- Update .env with new credentials
DB_USER=airline_user
DB_PASSWORD=password123
```

---

## 🚀 Production Deployment

### Backend (Heroku/Railway/DigitalOcean)
1. Set environment variables
2. Use production database URL
3. Change JWT_SECRET to strong random value
4. Set NODE_ENV=production
5. Enable HTTPS

### Frontend (Vercel/Netlify)
1. Build the project: `npm run build`
2. Update VITE_API_URL to production backend
3. Deploy dist folder
4. Configure domain and SSL

---

## 📊 Database Schema

```sql
Users (id, fullName, email, age, password, role, googleId, createdAt, updatedAt)
Flights (id, flightNumber, airline, departureCity, arrivalCity, departureTime, arrivalTime, departureDate, price, totalSeats, availableSeats, duration, flightType, status)
Bookings (id, bookingReference, userId, flightId, numberOfPassengers, totalPrice, bookingStatus, paymentStatus, transactionId, bookingDate, cancellationDate, refundAmount, specialRequests)
Passengers (id, bookingId, fullName, age, gender, email, phoneNumber, seatAssignment, mealPreference, specialAssistance)
```

---

## 💡 Tips for Success

1. **Start with Database**: Always set up MySQL first
2. **Check Ports**: Ensure 5000 (backend) and 5173 (frontend) are free
3. **Environment Files**: Double-check all .env variables
4. **Sequential Setup**: Backend first, then frontend
5. **Test Incrementally**: Test each part before moving to next

---

## 🎯 Quick Start Commands

```bash
# Terminal 1: Start Backend
cd airline-backend
npm install
# Create .env file with database credentials
npm start

# Terminal 2: Start Frontend
cd airline-frontend  
npm install
# Create .env file with API URL
npm run dev

# Browser: Open http://localhost:5173
```

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify all prerequisites are installed
3. Ensure database is running and accessible
4. Check browser console for frontend errors
5. Check terminal output for backend errors

**Happy Coding! ✈️🚀**

