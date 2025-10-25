# ✈️ AIRLINE MANAGEMENT SYSTEM

A complete, full-stack airline booking and management system built with **React.js**, **Node.js**, **Express.js**, and **MySQL**.

## 🌟 Features Overview

### 👤 **User Features**
- ✅ **Authentication** - Email/Password + Google OAuth
- ✅ **Flight Search** - Search by cities, dates, passengers
- ✅ **Multi-Passenger Booking** - Book for multiple travelers
- ✅ **Booking Management** - View, modify, cancel bookings
- ✅ **Profile Management** - Update personal information
- ✅ **Payment Integration** - Secure booking payments
- ✅ **Refund System** - 80% refund on cancellations

### 👨‍💼 **Admin Features**  
- ✅ **Real-time Dashboard** - Live statistics & analytics
- ✅ **Flight Management** - Add, edit, delete flights
- ✅ **Booking Oversight** - Manage all user bookings
- ✅ **User Management** - View, edit, delete users
- ✅ **Revenue Reports** - Financial analytics & insights
- ✅ **System Monitoring** - Real-time system health

### 🛡️ **Security & Performance**
- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **Role-based Access Control** - Admin vs User permissions  
- ✅ **Input Validation** - Comprehensive data validation
- ✅ **Error Handling** - Graceful error management
- ✅ **Responsive Design** - Mobile-friendly interface

---

## 🏗️ System Architecture

```
📦 AirlineManagementSystem/
├── 🔧 airline-backend/          # Node.js + Express API
│   ├── 📂 controllers/          # Business logic
│   ├── 📂 models/              # Database models
│   ├── 📂 routes/              # API routes
│   ├── 📂 middleware/          # Auth & validation
│   └── 📂 config/              # Database config
├── 🎨 airline-frontend/         # React.js UI
│   ├── 📂 src/pages/           # Page components
│   ├── 📂 src/context/         # State management
│   └── 📂 src/components/      # Reusable components
├── 🗄️ database-setup.sql       # MySQL schema
├── 📋 SETUP_INSTRUCTIONS.md    # Detailed setup guide
└── 📖 README.md               # This file
```

---

## 🚀 Quick Start

### 1️⃣ **Prerequisites**
- Node.js (v16+)
- MySQL (v8.0+) 
- Git

### 2️⃣ **Database Setup**
```bash
# Start MySQL and run the setup script
mysql -u root -p
source airline-backend/database-setup.sql
```

### 3️⃣ **Backend Setup**
```bash
cd airline-backend
npm install
# Create .env file (see airline-backend/env-config.txt)
npm start
```

### 4️⃣ **Frontend Setup**
```bash
cd airline-frontend
npm install  
# Create .env file (see airline-frontend/env-config.txt)
npm run dev
```

### 5️⃣ **Access the Application**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

---

## 🧪 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@airline.com` | `Admin@123` |
| **User** | `john@example.com` | `John@123` |

---

## 🛠️ Tech Stack

### **Backend**
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL + Sequelize ORM
- **Authentication**: JWT + bcrypt
- **Validation**: express-validator
- **External**: Firebase Admin (Google OAuth)

### **Frontend**
- **Framework**: React.js + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Authentication**: Firebase Auth
- **Icons**: Lucide React

### **Database Schema**
- **Users** - User accounts & roles
- **Flights** - Flight information & availability
- **Bookings** - Booking records & status
- **Passengers** - Passenger details & preferences

---

## 📡 API Endpoints

### **Authentication**
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login  
- `POST /api/auth/google-signin` - Google OAuth
- `GET /api/auth/user-info` - Get user profile

### **User Operations**
- `GET /api/flights/search` - Search available flights
- `POST /api/flights/book` - Create new booking
- `GET /api/flights/my-bookings` - User's bookings
- `DELETE /api/flights/cancel/:id` - Cancel booking

### **Admin Operations**  
- `GET /api/admin/dashboard/overview` - Dashboard stats
- `POST /api/admin/flights/add` - Add new flight
- `GET /api/admin/bookings/all` - All bookings
- `GET /api/admin/users/all` - All users
- `PUT /api/admin/bookings/status/:id` - Update booking

---

## 📊 Key Features Explained

### **Flight Search & Booking**
- Real-time flight availability checking
- Multi-passenger booking support
- Automatic seat assignment
- Comprehensive passenger details collection
- Meal preferences and special requests

### **Payment & Refunds**
- Secure booking transactions
- 80% refund policy for user cancellations
- 100% refund for admin cancellations
- Transaction tracking and history

### **Admin Dashboard**
- Live statistics (users, flights, bookings, revenue)
- Flight management (CRUD operations)
- Booking oversight and status updates
- User management and role assignments
- Revenue analytics and reporting

### **Security Features**
- Password hashing with bcrypt
- JWT token authentication
- Role-based route protection
- Input validation and sanitization
- CORS configuration for security

---

## 🎯 Business Logic

### **Booking Flow**
1. User searches for flights
2. Selects flight and passenger count
3. Enters passenger details
4. Confirms booking and payment
5. Receives booking confirmation
6. Can view/manage in dashboard

### **Admin Workflow**
1. Monitor system via dashboard
2. Add/modify flights as needed
3. Oversee all bookings
4. Handle customer service issues
5. Generate revenue reports
6. Manage user accounts

### **Cancellation Policy**
- **User Cancellation**: 80% refund
- **Admin Cancellation**: 100% refund  
- **Flight Delays**: Admin can reschedule
- **System Cancellation**: Full refund

---

## 🔧 Configuration

### **Environment Variables**

**Backend (.env):**
```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=airline_management
JWT_SECRET=your_jwt_secret
PORT=5000
```

**Frontend (.env):**
```bash
VITE_API_URL=http://localhost:5000
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
```

---

## 📈 Performance & Scalability

### **Current Optimizations**
- Database indexing on frequently queried fields
- JWT token-based stateless authentication
- Efficient SQL queries with Sequelize
- React component optimization
- Responsive design for all devices

### **Future Enhancements**
- Redis caching for flight search
- Database read replicas
- CDN integration for assets
- API rate limiting
- Microservices architecture

---

## 🧪 Testing

### **Manual Testing Checklist**
- [ ] User registration & login
- [ ] Flight search functionality  
- [ ] Booking creation process
- [ ] Payment integration
- [ ] Admin dashboard access
- [ ] Flight management operations
- [ ] Booking status updates
- [ ] User role permissions

### **Automated Testing (Future)**
- Unit tests for API endpoints
- Integration tests for booking flow
- End-to-end testing with Cypress
- Performance testing with Jest

---

## 🚀 Deployment Guide

### **Production Checklist**
- [ ] Update JWT_SECRET to strong value
- [ ] Set NODE_ENV=production
- [ ] Configure production database
- [ ] Enable HTTPS/SSL certificates
- [ ] Set up domain and DNS
- [ ] Configure error monitoring
- [ ] Set up automated backups

### **Recommended Platforms**
- **Backend**: Heroku, Railway, AWS EC2
- **Frontend**: Vercel, Netlify, AWS S3+CloudFront
- **Database**: AWS RDS, Google Cloud SQL
- **Monitoring**: Sentry, New Relic

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support & Documentation

- **Setup Guide**: [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md)
- **API Documentation**: Available via Postman collection
- **Troubleshooting**: Check setup guide for common issues
- **Contact**: Create an issue for support

---

## 🎉 Acknowledgments

- **React Team** for the amazing frontend framework
- **Express.js** for the robust backend framework  
- **MySQL** for reliable data storage
- **Tailwind CSS** for beautiful styling
- **Firebase** for authentication services

---

**Made with ❤️ for the aviation industry**

*Ready for takeoff! ✈️🚀*