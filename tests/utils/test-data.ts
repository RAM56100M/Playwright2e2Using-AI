/**
 * Test Data
 * Centralized test data for consistent usage across test suites
 */

export const testUsers = {
  validUser: {
    email: 'user@example.com',
    password: 'SecurePass123!',
    name: 'Test User',
  },
  validAdmin: {
    email: 'admin@example.com',
    password: 'AdminPass123!',
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
  invalidCredentials: 'Invalid email or password',
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
  login: '/login',
  dashboard: '/dashboard',
  signup: '/signup',
  forgotPassword: '/forgot-password',
  home: '/',
};
