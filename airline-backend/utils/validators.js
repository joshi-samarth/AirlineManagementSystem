// Validate email format
const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Validate password strength
// Requirements: Min 8 chars, 1 uppercase, 1 number, 1 special char
const validatePassword = (password) => {
  const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return regex.test(password);
};

// Validate all signup inputs
const validateSignup = (fullName, email, age, password, confirmPassword) => {
  const errors = {};

  if (!fullName || fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters';
  }
  if (!validateEmail(email)) {
    errors.email = 'Invalid email format';
  }
  if (!age || age < 18 || age > 120) {
    errors.age = 'Age must be 18 or older to sign up';
  }
  if (!validatePassword(password)) {
    errors.password = 'Password must have: 8+ chars, 1 uppercase, 1 number, 1 special char';
  }
  if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

module.exports = { validateEmail, validatePassword, validateSignup };