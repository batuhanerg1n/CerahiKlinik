import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const role = Number(user?.rol);
    if (!allowedRoles.includes(role)) {
      if (role === 4) return <Navigate to="/doktor/takvim" replace />;
      if (role === 2) return <Navigate to="/personel/randevular" replace />;
      if (role === 1) return <Navigate to="/dashboard" replace />;
      return <Navigate to="/login" replace />;
    }
  }

  return <Outlet />;
}