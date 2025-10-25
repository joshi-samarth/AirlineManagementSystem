# 🚀 QUICK START GUIDE - AIRLINE MANAGEMENT SYSTEM

## ⚡ **IMMEDIATE SETUP (5 MINUTES)**

### **📋 Prerequisites Check**
- ✅ Node.js installed
- ✅ MySQL running
- ✅ All dependencies installed (confirmed ✓)

### **🗄️ Step 1: Database Setup (2 minutes)**
```powershell
# Open MySQL Command Line or MySQL Workbench
mysql -u root -p

# Copy and paste the ENTIRE content from:
# airline-backend/database-setup.sql
```

### **⚙️ Step 2: Environment Setup (1 minute)**

**Backend .env file** (create in `airline-backend/.env`):
```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=airline_management
PORT=5000
JWT_SECRET=airline_super_secret_jwt_key_change_in_production_2024
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
VITE_API_URL=http://localhost:5000
```

**Frontend .env file** (create in `airline-frontend/.env`):
```bash
VITE_API_URL=http://localhost:5000
```

### **🚀 Step 3: Start Servers (1 minute)**

**Terminal 1 - Backend:**
```powershell
cd airline-backend
npm start
```
*Should show: ✅ Server running on http://localhost:5000*

**Terminal 2 - Frontend:**
```powershell
cd airline-frontend
npm run dev
```
*Should show: ➜ Local: http://localhost:5173/*

### **🧪 Step 4: Test Login (1 minute)**
Open browser: http://localhost:5173

**Test Accounts:**
- **Admin**: `admin@airline.com` / `Admin@123`
- **User**: `john@example.com` / `John@123`

---

## ✅ **INSTANT TESTING CHECKLIST**

### **👤 User Flow (5 minutes)**
1. **Login** as john@example.com / John@123
2. **Search Flights** Mumbai → Delhi, today's date, 2 passengers
3. **Book Flight** Fill passenger details, confirm booking
4. **View Bookings** Check "My Bookings" tab
5. **Cancel Booking** Test 80% refund feature
6. **Edit Profile** Update user information

### **👨‍💼 Admin Flow (5 minutes)**
1. **Login** as admin@airline.com / Admin@123
2. **Dashboard** View live statistics
3. **Add Flight** Create new flight route
4. **Manage Bookings** View all bookings, update status
5. **User Management** View users, check booking stats
6. **Delete Flight** Remove a test flight

---

## 📊 **VERIFICATION POINTS**

### **✅ Backend API Tests**
```powershell
# Test API health
curl http://localhost:5000

# Test flight search
curl "http://localhost:5000/api/flights/search?departureCity=Mumbai&arrivalCity=Delhi"
```

### **✅ Database Verification**
```sql
USE airline_management;
SELECT COUNT(*) FROM Users;      -- Should be 2
SELECT COUNT(*) FROM Flights;    -- Should be 10
```

### **✅ Frontend Features**
- [ ] Beautiful responsive UI loads
- [ ] Login/Signup forms work
- [ ] Flight search returns results
- [ ] Booking process completes
- [ ] Admin panel accessible
- [ ] All CRUD operations work

---

## 🎯 **DEMO SCENARIOS**

### **🎪 **Scenario 1: Complete Booking Flow**
1. User searches Mumbai → Delhi
2. Selects morning flight (AI101)
3. Books for 2 passengers
4. Enters passenger details
5. Confirms booking (gets reference number)
6. Views booking in dashboard

### **🎪 Scenario 2: Admin Management**
1. Admin logs in, sees live dashboard
2. Adds new flight route (Chennai → Kolkata)
3. Views all bookings, updates status
4. Checks user statistics
5. Manages flight inventory

### **🎪 Scenario 3: Error Handling**
1. Try invalid login credentials
2. Search for unavailable route
3. Book more passengers than available
4. Cancel already cancelled booking
5. Admin tries to delete flight with bookings

---

## 🔧 **TROUBLESHOOTING (IF NEEDED)**

### **❌ Backend Issues**
```powershell
# Check if MySQL is running
Get-Service MySQL*

# Check port availability
netstat -an | findstr :5000

# Restart backend
cd airline-backend
npm start
```

### **❌ Frontend Issues**
```powershell
# Clear cache and restart
cd airline-frontend
npm run dev -- --force

# Check API connection
curl http://localhost:5000
```

### **❌ Database Issues**
```sql
-- Check database exists
SHOW DATABASES;

-- Check tables exist
USE airline_management;
SHOW TABLES;

-- Check sample data
SELECT * FROM Users LIMIT 5;
```

---

## 🎉 **SUCCESS INDICATORS**

### **✅ System is Working When:**
- Backend shows "✅ Server running on http://localhost:5000"
- Frontend shows React app at http://localhost:5173
- You can login with test accounts
- Dashboard shows real data
- Flight search returns results
- Bookings can be created and managed
- Admin panel shows statistics

---

## 🚀 **READY FOR PRODUCTION?**

### **✅ Complete Features:**
- 28 API endpoints implemented
- User authentication with JWT
- Role-based access control
- Complete booking system
- Admin management panel
- Real-time dashboard
- Responsive UI design
- Error handling throughout

### **📈 Performance Optimized:**
- Database indexed queries
- Efficient React components
- Proper state management
- Input validation
- Security best practices

---

## 📞 **IMMEDIATE SUPPORT**

**If something doesn't work:**
1. Check MySQL is running
2. Verify .env files created correctly
3. Ensure both servers are running
4. Check browser console for errors
5. Verify database setup completed

**Expected Results:**
- Login should work immediately
- Flight search shows 10 flights
- Booking creates confirmation
- Admin sees live statistics
- All CRUD operations functional

---

**🎯 TOTAL SETUP TIME: 5 MINUTES**
**🧪 TOTAL TESTING TIME: 10 MINUTES**
**🚀 SYSTEM STATUS: READY FOR DEMO!**

*Everything is configured and ready to run! ✈️*

