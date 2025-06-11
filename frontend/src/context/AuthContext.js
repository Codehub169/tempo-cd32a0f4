import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken') || null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentToken = localStorage.getItem('authToken');
    if (currentToken) {
      // Set token for apiClient immediately if found
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;
      if (!user) { // Only fetch user if not already set (e.g. from login)
        apiClient.get('/auth/me')
          .then(response => {
            setUser(response.data.user);
          })
          .catch(err => {
            console.error('Failed to fetch user or token invalid:', err.response ? err.response.data : err.message);
            localStorage.removeItem('authToken');
            setToken(null);
            setUser(null);
            delete apiClient.defaults.headers.common['Authorization'];
          })
          .finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    } else {
      delete apiClient.defaults.headers.common['Authorization'];
      setUser(null); // Ensure user is null if no token
      setIsLoading(false);
    }
  }, [token, user]); // Rerun if token changes, or user is set by login

  const login = async (credentials) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post('/auth/login', credentials);
      const { token: receivedToken, user: userData } = response.data;
      
      localStorage.setItem('authToken', receivedToken);
      setToken(receivedToken); // This will trigger the useEffect
      setUser(userData); // Set user immediately
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`; // Ensure header is set for subsequent requests in this session
      
      navigate('/create-post'); 
      return true;
    } catch (err) {
      console.error('Login failed:', err.response ? err.response.data : err.message);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      localStorage.removeItem('authToken');
      setToken(null);
      setUser(null);
      delete apiClient.defaults.headers.common['Authorization'];
      return false;
    }
    finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    setError(null);
    try {
        // Best effort to call backend logout
        await apiClient.post('/auth/logout'); 
    } catch (err) {
        console.error('Logout API call failed, proceeding with client-side logout:', err.response ? err.response.data : err.message);
    }
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    delete apiClient.defaults.headers.common['Authorization'];
    navigate('/admin-login');
    setIsLoading(false);
  };
  
  const value = {
    user,
    token,
    isAuthenticated: !!user && !!token, // isAuthenticated is true if both user and token exist
    isLoading,
    error,
    login,
    logout,
    clearError: () => setError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
