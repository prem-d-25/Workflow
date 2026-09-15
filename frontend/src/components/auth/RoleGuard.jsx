import React from 'react'
import { ShieldAlert } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

/**
 * Role-Based Access Control Guard component.
 * Restricts child components or views to specific user roles (OWNER, HR, EMPLOYEE).
 */
export function RoleGuard({
  allowedRoles = [],
  children,
  fallback = null,
  showDeniedBanner = false,
}) {
  const user = useAuthStore((state) => state.user)

  if (!user || !allowedRoles.includes(user.role)) {
    if (fallback) return fallback

    if (showDeniedBanner) {
      return (
        <div className="p-6 rounded-xl bg-slate-800/80 border border-slate-700 text-center max-w-lg mx-auto my-8">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto mb-3">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">Access Restricted</h3>
          <p className="text-xs text-slate-400">
            This section requires one of the following permissions: [{allowedRoles.join(', ')}]. Your current role is{' '}
            <span className="text-orange-400 font-semibold">{user?.role || 'NONE'}</span>.
          </p>
        </div>
      )
    }

    return null
  }

  return children
}
