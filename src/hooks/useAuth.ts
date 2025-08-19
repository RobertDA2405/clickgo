import { useAuthStore } from '../stores/authStore';

export const useAuth = () => {
  const { user, loading, register, login, logout } = useAuthStore();
  const isAdmin = user?.rol === 'admin';
  return { user, loading, isAdmin, register, login, logout };
};