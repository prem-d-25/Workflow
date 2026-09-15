import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  Bot,
  Building2,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Layers,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Settings,
  Shield,
  User,
  Users,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/store/toastStore'
import { cn } from '@/lib/utils'

export function Sidebar({
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  onOpenProfile,
}) {
  const navigate = useNavigate()
  const { user, company, logout } = useAuthStore()
  const userRole = user?.role || 'EMPLOYEE'

  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['OWNER', 'HR', 'EMPLOYEE'],
    },
    {
      label: 'Leave Management',
      path: '/leaves',
      icon: CalendarCheck,
      roles: ['OWNER', 'HR', 'EMPLOYEE'],
    },
    {
      label: 'Team & Employees',
      path: '/employees',
      icon: Users,
      roles: ['OWNER', 'HR'],
    },
    {
      label: 'Announcements',
      path: '/announcements',
      icon: Megaphone,
      roles: ['OWNER', 'HR', 'EMPLOYEE'],
    },
    {
      label: 'Policy AI & Docs',
      path: '/policies',
      icon: Bot,
      roles: ['OWNER', 'HR', 'EMPLOYEE'],
    },
    {
      label: 'Company Settings',
      path: '/settings',
      icon: Settings,
      roles: ['OWNER'],
    },
    {
      label: 'UI Components',
      path: '/ui-catalog',
      icon: Layers,
      roles: ['OWNER', 'HR', 'EMPLOYEE'],
      badge: '7.3',
    },
  ]

  // Filter items matching user role
  const visibleNavItems = navItems.filter((item) => item.roles.includes(userRole))

  const handleLogout = async () => {
    await logout()
    toast.info('You have been signed out.')
    navigate('/login')
  }

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between bg-slate-900 border-r border-slate-800 selection:bg-orange-500 selection:text-white">
      {/* Top Brand Section */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-md shadow-orange-600/30 flex-shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>

            {(!isCollapsed || isMobileOpen) && (
              <div className="min-w-0 flex-1">
                <span className="font-bold text-sm text-white truncate block tracking-tight">
                  {company?.name || 'Workflow'}
                </span>
                <span className="text-[10px] text-teal-400 font-semibold tracking-wider uppercase block">
                  {userRole} Workspace
                </span>
              </div>
            )}
          </div>

          {/* Mobile close button */}
          {isMobileOpen && (
            <button
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              aria-label="Close navigation"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5">
          {visibleNavItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (isMobileOpen) setIsMobileOpen(false)
                }}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group relative',
                    isActive
                      ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/20 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  )
                }
                title={isCollapsed && !isMobileOpen ? item.label : undefined}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />

                {(!isCollapsed || isMobileOpen) && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}

                {(!isCollapsed || isMobileOpen) && item.badge && (
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            )
          })}
        </nav>
      </div>

      {/* Bottom User Profile Section */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/80">
        <div
          className={cn(
            'flex items-center gap-2.5 p-2 rounded-xl bg-slate-800/60 border border-slate-700/60',
            isCollapsed && !isMobileOpen ? 'justify-center' : 'justify-between'
          )}
        >
          <button
            type="button"
            onClick={onOpenProfile}
            className="flex items-center gap-2.5 min-w-0 text-left hover:opacity-80 transition-opacity"
            title="Open profile & security"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shadow flex-shrink-0">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>

            {(!isCollapsed || isMobileOpen) && (
              <div className="min-w-0">
                <span className="block text-xs font-bold text-white truncate">
                  {user?.full_name || user?.email?.split('@')[0]}
                </span>
                <span className="block text-[10px] text-slate-400 truncate">
                  {user?.role}
                </span>
              </div>
            )}
          </button>

          {(!isCollapsed || isMobileOpen) && (
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700/50 rounded-lg transition-colors flex-shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden animate-in fade-in"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar Drawer */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 lg:hidden transform transition-transform duration-200 ease-in-out',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop Persistent Sidebar */}
      <aside
        className={cn(
          'hidden lg:block flex-shrink-0 transition-all duration-200 ease-in-out',
          isCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
