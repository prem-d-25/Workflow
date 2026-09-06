import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import NotFoundPage from '../pages/NotFoundPage';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { Button } from '../components/common/Button';
import { useAuthStore } from '../store/useAuthStore';

// Temporary Dashboard Component
function DashboardPlaceholder() {
  const { user, clearAuth } = useAuthStore();
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50">
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm text-center max-w-lg w-full">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 mb-2">Dashboard</h1>
        <p className="text-zinc-600 mb-6">Welcome back, {user?.email}!</p>
        <div className="inline-block rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700 mb-8 uppercase tracking-wider">
          Role: {user?.role}
        </div>
        <Button onClick={() => clearAuth()} variant="outline" className="w-full">
          Sign Out
        </Button>
      </div>
    </div>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Public Routes (Only accessible if NOT logged in) */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      
      {/* Protected Routes (Only accessible if LOGGED IN) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPlaceholder />} />
        {/* Future routes: /leaves, /users, etc. */}
      </Route>
      
      {/* 404 Catch All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
