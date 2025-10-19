import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requireSuperAdmin = false }) => {
  const token = sessionStorage.getItem('sg_admin_token');
  const userRole = sessionStorage.getItem('sg_admin_role');

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If superadmin is required and user is not superadmin, redirect to dashboard
  if (requireSuperAdmin && userRole !== 'superadmin') {
    return <Navigate to="/dashboard" replace />;
  }

  // Otherwise, render the protected component
  return children;
};

export default ProtectedRoute;

