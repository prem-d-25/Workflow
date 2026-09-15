import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

/**
 * Route Guard ensuring user is authenticated and not pending a mandatory password reset.
 */
export function ProtectedRoute({ children, requireActive = true }) {
  const { isAuthenticated, forcePasswordReset, isLoading, isInitialized, user } = useAuthStore()
  const location = useLocation()

  if (!isInitialized || isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Soft-deleted / deactivated user check
  if (requireActive && user && user.is_active === false) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-xl p-6 text-center shadow-xl">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-4">
            !
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Account Deactivated</h2>
          <p className="text-sm text-slate-400 mb-6">
            Your corporate account has been deactivated by management. Please contact your company administrator or HR.
          </p>
          <button
            onClick={() => useAuthStore.getState().logout()}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    )
  }

  // Mandatory first-login password reset check
  if (forcePasswordReset && location.pathname !== '/reset-password') {
    return <Navigate to="/reset-password" replace />
  }

  return children ? children : <Outlet />
}
