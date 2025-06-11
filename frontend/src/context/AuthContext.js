import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('authToken')); // Initialize from localStorage directly
  const [isLoading, setIsLoading] = useState(true); // True until initial auth check is complete
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const clearAuthData = useCallback(() => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    delete apiClient.defaults.headers.common['Authorization'];
  }, []);

  useEffect(() => {
    if (token) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // If we have a token but no user object, or if the user object might be stale (e.g. from a previous session)
      // it's often good practice to verify the token and fetch fresh user data.
      // The `if (!user)` check prevents re-fetching if login/register just populated the user.
      if (!user) {
        setIsLoading(true); 
        apiClient.get('/auth/me')
          .then(response => {
            setUser(response.data);
          })
          .catch(err => {
            console.error('Failed to fetch user or token invalid:', err.response ? err.response.data : err.message);
            clearAuthData(); // Clears token from state and localStorage, removes auth header
          })
          .finally(() => setIsLoading(false));
      } else {
        // User is already set (e.g. by login), and token is present.
        setIsLoading(false); 
      }
    } else {
      // No token, ensure everything is cleared and not loading
      clearAuthData();
      setIsLoading(false);
    }
  }, [token, user, clearAuthData]); // Include user and clearAuthData in dependencies

  const login = async (credentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/auth/login', credentials);
      const { token: receivedToken, user: userData } = response.data;
      
      localStorage.setItem('authToken', receivedToken);
      setToken(receivedToken); 
      setUser(userData); 
      // apiClient header is set by the useEffect due to token change
      
      navigate('/create-post'); 
      return { success: true };
    } catch (err) {
      console.error('Login failed:', err.response ? err.response.data : err.message);
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      clearAuthData();
      return { success: false, message: errorMessage };
    }
    finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.post('/auth/register', userData);
      return { success: true }; 
    } catch (err) {
      console.error('Registration failed:', err.response ? err.response.data : err.message);
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage); // Set context error, SignupPage can also use the returned message
      return { success: false, message: errorMessage };
    }
    finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
        await apiClient.post('/auth/logout'); 
    } catch (err) {
        console.error('Logout API call failed, proceeding with client-side logout:', err.response ? err.response.data : err.message);
        // Error state could be set here if needed, but client-side logout will proceed anyway
    }
    clearAuthData();
    navigate('/admin-login');
    setIsLoading(false);
  }, [navigate, clearAuthData]);
  
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token, 
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};