import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../api/demoSiteService';

const ProtectedRoute = ({ children }) => {
  if (!authService.isAuthenticated()) {
    // Redirect to login page if there's no auth token
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
