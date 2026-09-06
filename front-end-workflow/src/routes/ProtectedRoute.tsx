import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { BrandLoader } from '../components/common/BrandLoader';

export function ProtectedRoute() {
  const { accessToken, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <BrandLoader />;
  }

  if (!accessToken) {
    // Redirect to login but save the attempted url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
