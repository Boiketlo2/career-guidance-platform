import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../api/authAPI';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (err) {
        console.error('Error parsing user data:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setError('');
      setLoading(true);
      
      // For now, using simple login - in production, use Firebase Auth
      const response = await authAPI.login({ email, password });
      
      if (response.success) {
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
        return { success: true, user: response.user };
      } else {
        setError(response.error || 'Login failed');
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setError('');
      setLoading(true);
      
      const response = await authAPI.register(userData);
      
      if (response.success) {
        // Auto-login after registration
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
        return { success: true, user: response.user };
      } else {
        setError(response.error || 'Registration failed');
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Registration failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setError('');
    authAPI.logout();
  };

  const updateProfile = async (uid, profileData) => {
    try {
      setError('');
      const response = await authAPI.updateProfile(uid, profileData);
      
      if (response.success) {
        // Update user in state and localStorage
        const updatedUser = { ...user, ...profileData };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return { success: true, user: updatedUser };
      } else {
        setError(response.error || 'Profile update failed');
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Profile update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const clearError = () => setError('');

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    clearError,
    isAuthenticated: !!user,
    userRole: user?.role
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;