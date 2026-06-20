import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AdminRoute({ children }) {
  const { currentUser, userData } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (userData && userData.role !== 'admin') {
    return <Navigate to="/" replace />; // Kick normal users out
  }

  return children;
}
