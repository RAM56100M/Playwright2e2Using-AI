/**
 * Test Data
 * Centralized test data for consistent usage across test suites
 */

export const testUsers = {
  validUser: {
    email: process.env.TEST_USER_EMAIL || 'user@example.com',
    password: process.env.TEST_USER_PASSWORD || 'SecurePass123!',
    name: 'Test User',
  },
  validAdmin: {
    email: process.env.TEST_ADMIN_EMAIL || process.env.TEST_USER_EMAIL || 'admin@example.com',
    password: process.env.TEST_ADMIN_PASSWORD || process.env.TEST_USER_PASSWORD || 'SecurePass123!',
    name: 'Admin User',
  },
  invalidUser: {
    email: 'invalid@example.com',
    password: 'WrongPassword123!',
  },
  emptyCredentials: {
    email: '',
    password: '',
  },
};

export const errorMessages = {
  invalidCredentials: 'Incorrect email or password.',
  emptyEmail: 'Email is required',
  emptyPassword: 'Password is required',
  invalidEmail: 'Please enter a valid email',
  passwordTooShort: 'Password must be at least 8 characters',
  userNotFound: 'User not found',
  accountLocked: 'Your account has been locked',
};

export const successMessages = {
  loginSuccess: 'Login successful',
  logoutSuccess: 'You have been logged out',
  signupSuccess: 'Account created successfully',
};

export const testUrls = {
  login: '/client/#/auth/login',
  dashboard: '/client/#/dashboard',
  signup: '/client/#/auth/signup',
  forgotPassword: '/client/#/auth/forgot-password',
  home: '/client',
};
