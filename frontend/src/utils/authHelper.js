// utils/authHelper.js

/**
 * Frontend Authentication Helper Utilities
 * Enhanced with Firebase token support while maintaining existing functionality
 */

// ========================
// EXISTING FUNCTIONALITY (KEPT INTACT)
// ========================

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

export const setAuthToken = (token) => {
  localStorage.setItem('token', token);
};

export const removeAuthToken = () => {
  localStorage.removeItem('token');
};

export const getUserRole = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user).role : null;
};

export const isAuthenticated = () => {
  return !!getAuthToken();
};

// ========================
// NEW ENHANCEMENTS (BACKWARD COMPATIBLE)
// ========================

// Firebase token management
export const getFirebaseToken = () => {
  // First try Firebase token, then fall back to regular token
  return localStorage.getItem('firebaseToken') || getAuthToken();
};

export const setFirebaseToken = (token) => {
  localStorage.setItem('firebaseToken', token);
  // Also set as regular token for backward compatibility
  setAuthToken(token);
};

// Enhanced user data management
export const setUserData = (userData) => {
  localStorage.setItem('user', JSON.stringify(userData));
};

export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

export const getCurrentUserId = () => {
  const user = getCurrentUser();
  return user ? user.uid : null;
};

// Role-specific helpers
export const isInstitution = () => {
  return getUserRole() === 'institution';
};

export const isStudent = () => {
  return getUserRole() === 'student';
};

export const isCompany = () => {
  return getUserRole() === 'company';
};

export const isAdmin = () => {
  return getUserRole() === 'admin';
};

// Comprehensive logout
export const logout = () => {
  removeAuthToken();
  localStorage.removeItem('firebaseToken');
  localStorage.removeItem('user');
  console.log('✅ User logged out and all tokens cleared');
};

// Token validation helper
export const validateToken = async () => {
  const token = getFirebaseToken();
  if (!token) {
    return { valid: false, reason: 'No token found' };
  }
  
  // You can add token expiration check here if needed
  // For now, we'll assume token is valid if it exists
  return { valid: true };
};