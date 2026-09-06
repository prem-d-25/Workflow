import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { BrandLoader } from '../components/common/BrandLoader';

export function PublicRoute() {
  const { accessToken, isLoading } = useAuthStore();

  if (isLoading) {
    return <BrandLoader />;
  }

  // If already logged in, no need to see login/register pages
  if (accessToken) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
