import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
  const user = useAuthStore(state => state.user);
  if (!user) return <Navigate to="/cuenta" replace />;
  if (user.rol !== 'admin') return <p className="text-center text-red-500 mt-10">Acceso denegado.</p>;
  return <>{children}</>;
}
