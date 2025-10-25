-- ========================================
-- AIRLINE MANAGEMENT SYSTEM DATABASE SETUP
-- Run this script in MySQL to create the database and initial data
-- ========================================

-- Create database
CREATE DATABASE IF NOT EXISTS airline_management;
USE airline_management;

-- ========================================
-- USERS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS `Users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `fullName` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL UNIQUE,
  `age` int DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL COMMENT 'NULL for Google Sign-In users',
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `googleId` varchar(255) DEFAULT NULL UNIQUE,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Users_email_unique` (`email`),
  UNIQUE KEY `Users_googleId_unique` (`googleId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ========================================
-- FLIGHTS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS `Flights` (
  `id` int NOT NULL AUTO_INCREMENT,
  `flightNumber` varchar(255) NOT NULL UNIQUE,
  `airline` varchar(255) NOT NULL,
  `departureCity` varchar(255) NOT NULL,
  `arrivalCity` varchar(255) NOT NULL,
  `departureTime` time NOT NULL,
  `arrivalTime` time NOT NULL,
  `departureDate` date NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `totalSeats` int NOT NULL DEFAULT 180,
  `availableSeats` int NOT NULL DEFAULT 180,
  `duration` varchar(255) NOT NULL,
  `flightType` enum('domestic','international') NOT NULL DEFAULT 'domestic',
  `status` enum('scheduled','delayed','cancelled','ontime') NOT NULL DEFAULT 'ontime',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Flights_flightNumber_unique` (`flightNumber`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ========================================
-- BOOKINGS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS `Bookings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bookingReference` varchar(255) NOT NULL UNIQUE,
  `userId` int NOT NULL,
  `flightId` int NOT NULL,
  `numberOfPassengers` int NOT NULL DEFAULT 1,
  `seatNumber` varchar(255) DEFAULT NULL,
  `totalPrice` decimal(10,2) NOT NULL,
  `bookingStatus` enum('confirmed','cancelled','pending') NOT NULL DEFAULT 'pending',
  `paymentStatus` enum('pending','completed','failed') NOT NULL DEFAULT 'pending',
  `transactionId` varchar(255) DEFAULT NULL,
  `bookingDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `cancellationDate` datetime DEFAULT NULL,
  `refundAmount` decimal(10,2) DEFAULT NULL,
  `specialRequests` text,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Bookings_bookingReference_unique` (`bookingReference`),
  KEY `Bookings_userId_foreign_idx` (`userId`),
  KEY `Bookings_flightId_foreign_idx` (`flightId`),
  CONSTRAINT `Bookings_flightId_foreign` FOREIGN KEY (`flightId`) REFERENCES `Flights` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Bookings_userId_foreign` FOREIGN KEY (`userId`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ========================================
-- PASSENGERS TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS `Passengers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `bookingId` int NOT NULL,
  `fullName` varchar(255) NOT NULL,
  `age` int NOT NULL,
  `gender` enum('male','female','other') DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `phoneNumber` varchar(255) DEFAULT NULL,
  `passport` varchar(255) DEFAULT NULL,
  `seatAssignment` varchar(255) DEFAULT NULL,
  `mealPreference` enum('vegetarian','non-vegetarian','vegan','none') DEFAULT 'none',
  `specialAssistance` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `Passengers_bookingId_foreign_idx` (`bookingId`),
  CONSTRAINT `Passengers_bookingId_foreign` FOREIGN KEY (`bookingId`) REFERENCES `Bookings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ========================================
-- INSERT DEFAULT ADMIN USER
-- Password: Admin@123 (hashed with bcrypt)
-- ========================================
INSERT INTO `Users` (`fullName`, `email`, `age`, `password`, `role`, `createdAt`, `updatedAt`) 
VALUES (
  'Admin User', 
  'admin@airline.com', 
  30, 
  '$2a$10$rHZj0Hn8tgH8K7l2Qs1U3ep6RGRJ/Prm5x0oKqOEKGjO0wNwGhqSO', 
  'admin', 
  NOW(), 
  NOW()
) ON DUPLICATE KEY UPDATE 
  `fullName` = VALUES(`fullName`),
  `age` = VALUES(`age`),
  `role` = VALUES(`role`);

-- ========================================
-- INSERT DEFAULT REGULAR USER 
-- Password: John@123 (hashed with bcrypt)
-- ========================================
INSERT INTO `Users` (`fullName`, `email`, `age`, `password`, `role`, `createdAt`, `updatedAt`) 
VALUES (
  'John Doe', 
  'john@example.com', 
  25, 
  '$2a$10$t8JQ/D1xZQ1vY2wWGbGb0eKTbRGRKxRGmKdGnOKGqWNGlGgKGqWNE', 
  'user', 
  NOW(), 
  NOW()
) ON DUPLICATE KEY UPDATE 
  `fullName` = VALUES(`fullName`),
  `age` = VALUES(`age`),
  `role` = VALUES(`role`);

-- ========================================
-- INSERT SAMPLE FLIGHTS WITH DYNAMIC DATES
-- ========================================
INSERT INTO `Flights` (`flightNumber`, `airline`, `departureCity`, `arrivalCity`, `departureTime`, `arrivalTime`, `departureDate`, `price`, `totalSeats`, `availableSeats`, `duration`, `flightType`, `status`) VALUES
('AI101', 'Air India', 'Mumbai', 'Delhi', '08:00:00', '10:15:00', DATE_ADD(CURDATE(), INTERVAL 1 DAY), 4500.00, 180, 45, '2h 15m', 'domestic', 'ontime'),
('IG202', 'IndiGo', 'Mumbai', 'Delhi', '11:30:00', '13:45:00', DATE_ADD(CURDATE(), INTERVAL 1 DAY), 5200.00, 180, 32, '2h 15m', 'domestic', 'ontime'),
('SG303', 'SpiceJet', 'Mumbai', 'Delhi', '15:15:00', '17:30:00', DATE_ADD(CURDATE(), INTERVAL 2 DAY), 3800.00, 180, 28, '2h 15m', 'domestic', 'ontime'),
('AI104', 'Air India', 'Mumbai', 'Delhi', '18:45:00', '21:00:00', DATE_ADD(CURDATE(), INTERVAL 3 DAY), 6100.00, 180, 50, '2h 15m', 'domestic', 'ontime'),
('AI501', 'Air India', 'Delhi', 'Bangalore', '09:00:00', '12:30:00', DATE_ADD(CURDATE(), INTERVAL 1 DAY), 5500.00, 180, 35, '3h 30m', 'domestic', 'ontime'),
('IG602', 'IndiGo', 'Delhi', 'Bangalore', '14:00:00', '17:30:00', DATE_ADD(CURDATE(), INTERVAL 2 DAY), 4900.00, 180, 42, '3h 30m', 'domestic', 'ontime'),
('AI701', 'Air India', 'Bangalore', 'Chennai', '08:30:00', '10:00:00', DATE_ADD(CURDATE(), INTERVAL 1 DAY), 3200.00, 180, 55, '1h 30m', 'domestic', 'ontime'),
('SG804', 'SpiceJet', 'Bangalore', 'Chennai', '16:00:00', '17:30:00', DATE_ADD(CURDATE(), INTERVAL 4 DAY), 2900.00, 180, 60, '1h 30m', 'domestic', 'ontime'),
('AI901', 'Air India', 'Mumbai', 'Bangalore', '10:00:00', '13:30:00', DATE_ADD(CURDATE(), INTERVAL 2 DAY), 5800.00, 180, 40, '3h 30m', 'domestic', 'ontime'),
('IG1002', 'IndiGo', 'Delhi', 'Kolkata', '07:30:00', '10:00:00', DATE_ADD(CURDATE(), INTERVAL 3 DAY), 4100.00, 180, 48, '2h 30m', 'domestic', 'ontime')
ON DUPLICATE KEY UPDATE 
  `airline` = VALUES(`airline`),
  `departureCity` = VALUES(`departureCity`),
  `arrivalCity` = VALUES(`arrivalCity`),
  `departureDate` = VALUES(`departureDate`);

-- ========================================
-- VERIFY DATA INSERTION
-- ========================================
SELECT 'Database Setup Complete!' as Status;
SELECT COUNT(*) as 'Total Users' FROM Users;
SELECT COUNT(*) as 'Total Flights' FROM Flights;
SELECT fullName, email, role FROM Users WHERE role = 'admin';

-- ========================================
-- LOGIN CREDENTIALS FOR TESTING
-- ========================================
SELECT 
  'Login Credentials' as 'TEST ACCOUNTS',
  'admin@airline.com / Admin@123' as 'Admin Account',
  'john@example.com / John@123' as 'User Account';

-- ========================================
-- USEFUL QUERIES FOR DEVELOPMENT
-- ========================================

-- View all users with their roles
-- SELECT id, fullName, email, role, createdAt FROM Users ORDER BY createdAt DESC;

-- View all flights with availability
-- SELECT flightNumber, airline, CONCAT(departureCity, ' → ', arrivalCity) as Route, 
--        departureDate, price, availableSeats FROM Flights ORDER BY departureDate, departureTime;

-- View all bookings with user and flight details
-- SELECT b.bookingReference, u.fullName, f.flightNumber, f.airline, 
--        CONCAT(f.departureCity, ' → ', f.arrivalCity) as Route, 
--        b.totalPrice, b.bookingStatus 
-- FROM Bookings b 
-- JOIN Users u ON b.userId = u.id 
-- JOIN Flights f ON b.flightId = f.id 
-- ORDER BY b.bookingDate DESC;

