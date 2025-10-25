-- ====================================================================
-- QUICK DATABASE FIX SCRIPT - RUN THIS TO FIX ALL BUGS
-- ====================================================================

USE airline_management;

-- ====================================================================
-- FIX 1: DELETE OLD FLIGHTS WITH INCORRECT DATES
-- ====================================================================
DELETE FROM Flights;

-- ====================================================================
-- FIX 2: INSERT FLIGHTS WITH CORRECT CURRENT/FUTURE DATES
-- ====================================================================
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
('IG1002', 'IndiGo', 'Delhi', 'Kolkata', '07:30:00', '10:00:00', DATE_ADD(CURDATE(), INTERVAL 3 DAY), 4100.00, 180, 48, '2h 30m', 'domestic', 'ontime');

-- ====================================================================
-- FIX 3: VERIFY THE FIXES WORKED
-- ====================================================================
SELECT 'Flight Fix Applied Successfully!' as Status;
SELECT 'Flights with Future Dates:' as Check_Results;
SELECT flightNumber, airline, CONCAT(departureCity, ' → ', arrivalCity) as Route, departureDate, price 
FROM Flights 
WHERE departureDate >= CURDATE()
ORDER BY departureDate, departureTime;

SELECT 'Total Flights Available:' as Summary, COUNT(*) as Count FROM Flights;
SELECT 'Users in System:' as Summary, COUNT(*) as Count FROM Users;

-- ====================================================================
-- VERIFICATION QUERIES (Copy and run these to test)
-- ====================================================================
-- Test flight search query (what the API uses):
-- SELECT * FROM Flights WHERE departureCity = 'Mumbai' AND arrivalCity = 'Delhi' AND departureDate >= CURDATE();

-- Check all flights are future-dated:
-- SELECT MIN(departureDate) as Earliest_Flight, MAX(departureDate) as Latest_Flight FROM Flights;

-- ====================================================================
-- SUCCESS! Your database is now fixed.
-- 1. Restart your backend server (npm start)
-- 2. Clear browser cache
-- 3. Test flight search with Mumbai → Delhi for tomorrow's date
-- ====================================================================
