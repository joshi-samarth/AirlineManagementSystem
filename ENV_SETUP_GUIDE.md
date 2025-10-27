# 🔧 Environment Setup Guide

## ✅ What I Just Fixed

I've created the missing `.env` files in both your backend and frontend directories.

### Files Created:
- ✅ `airline-backend/.env` - Backend environment configuration
- ✅ `airline-frontend/.env` - Frontend environment configuration

---

## ⚙️ IMPORTANT: Update Your Database Password

Before running your application, you **MUST** update the database password in `airline-backend/.env`:

### Step 1: Open the file
```
airline-backend\.env
```

### Step 2: Update the password
Find this line:
```env
DB_PASSWORD=your_mysql_password_here
```

Replace `your_mysql_password_here` with your actual MySQL password.

**Example:**
```env
DB_PASSWORD=MySecurePassword123
```

---

## 📋 Current Configuration

### Backend (.env)
```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here  ← UPDATE THIS!
DB_NAME=airline_management

# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# JWT Configuration
JWT_SECRET=airline_super_secret_jwt_key_change_in_production_2024
JWT_EXPIRE=7d

# Firebase (Optional - for Google Sign-In)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account-email@your-project-id.iam.gserviceaccount.com
```

### Frontend (.env)
```env
# API Configuration
VITE_API_URL=http://localhost:5000

# Firebase Configuration (Optional - for Google Sign-In)
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-firebase-app-id
```

---

## 🚀 Next Steps

### 1. Update Database Password
```powershell
# Open airline-backend/.env in your editor
# Change DB_PASSWORD to your MySQL password
```

### 2. Start Backend Server
```powershell
cd airline-backend
npm install  # Only if you haven't already
npm start
```

Expected output:
```
✅ Server running on http://localhost:5000
📊 Database: airline_management
```

### 3. Start Frontend Server (in a new terminal)
```powershell
cd airline-frontend
npm install  # Only if you haven't already
npm run dev
```

Expected output:
```
  VITE ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

---

## 🔍 Troubleshooting

### Issue: "Cannot connect to database"
**Solution:** 
- Make sure MySQL is running
- Update `DB_PASSWORD` in `airline-backend/.env` with your correct MySQL password
- Verify database exists: `mysql -u root -p` then `SHOW DATABASES;`

### Issue: "Access denied for user"
**Solution:**
- Check MySQL password is correct in `.env`
- Make sure MySQL user has permissions:
```sql
GRANT ALL PRIVILEGES ON airline_management.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

### Issue: "Database 'airline_management' doesn't exist"
**Solution:**
```powershell
# Run the database setup script
cd airline-backend
mysql -u root -p < database-setup.sql
```

---

## 🧪 Test Your Setup

### 1. Test Database Connection
```powershell
# In airline-backend folder
node seedFlights.js
```

Expected output:
```
Database connected successfully
Flight table synced
✅ Sample flights seeded successfully!
```

### 2. Test API
Open browser to: `http://localhost:5000`

Expected response:
```json
{
  "message": "Airline Management Backend API"
}
```

### 3. Test Frontend
Open browser to: `http://localhost:5173`

You should see the login page.

---

## 📝 Firebase Configuration (Optional)

The `.env` files include Firebase configuration for Google Sign-In. This is **optional**. If you don't want to use Google Sign-In, you can leave these values as is.

If you want to enable Google Sign-In:

1. Create a Firebase project at https://console.firebase.google.com
2. Get your Firebase configuration
3. Update the Firebase variables in both `.env` files

---

## ✅ Setup Complete!

Once you've:
1. ✅ Updated `DB_PASSWORD` in `airline-backend/.env`
2. ✅ Started backend server (port 5000)
3. ✅ Started frontend server (port 5173)

Your application should be ready to use!

### Test Accounts
- **Admin**: `admin@airline.com` / `Admin@123`
- **User**: `john@example.com` / `John@123`

---

## 📞 Still Having Issues?

Check these files:
- `BUG_FIX_INSTRUCTIONS.md` - Has troubleshooting guide
- `SETUP_INSTRUCTIONS.md` - Has complete setup guide
- `QUICK_START_GUIDE.md` - Has quick start commands

Run these commands for debugging:
```powershell
# Check if backend is running
curl http://localhost:5000

# Check database connection
cd airline-backend
node -e "require('./config/database.js').authenticate().then(() => console.log('✅ Connected')).catch(e => console.log('❌ Error:', e))"
```

