import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Render a loading indicator while checking authentication state
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-lg font-semibold text-gray-700 animate-pulse">Loading authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect them to the /admin-login page, saving the current location
    // so that they can be redirected back after logging in.
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
  }

  // If authenticated, render the children or an Outlet for nested routes.
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
