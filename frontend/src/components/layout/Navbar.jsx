import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  KeyRound,
  Layers,
  LogOut,
  Menu,
  Shield,
  Sparkles,
  User as UserIcon,
} from 'lucide-react'
import { Badge, Button } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/store/toastStore'

export function Navbar({ onToggleMobile, onOpenProfile }) {
  const navigate = useNavigate()
  const { user, company, logout } = useAuthStore()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Click outside listener for profile dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setIsDropdownOpen(false)
    await logout()
    toast.info('You have been signed out.')
    navigate('/login')
  }

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      {/* Left section: Mobile menu toggle + workspace branding */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobile}
          className="lg:hidden p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <span className="text-sm font-bold text-white tracking-tight hidden sm:inline">
            {company?.name || 'Workflow Workspace'}
          </span>
          <Badge variant={user?.role || 'EMPLOYEE'} size="sm">
            {user?.role}
          </Badge>
        </div>
      </div>

      {/* Right section: UI Catalog quick link + user profile menu */}
      <div className="flex items-center gap-3">
        <Link to="/ui-catalog" className="hidden md:inline-flex">
          <Button
            variant="outline"
            size="xs"
            leftIcon={<Layers className="w-3.5 h-3.5 text-teal-400" />}
          >
            UI Catalog (7.3)
          </Button>
        </Link>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-800 transition-colors focus:outline-none"
            aria-expanded={isDropdownOpen}
            aria-label="User account menu"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-orange-600/20">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>

            <div className="hidden sm:block text-left">
              <span className="block text-xs font-semibold text-white leading-none">
                {user?.full_name || user?.email?.split('@')[0]}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                #{user?.company_id}
              </span>
            </div>

            <ChevronDown
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-slate-800 border border-slate-700 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
              {/* User header in dropdown */}
              <div className="px-4 py-2.5 border-b border-slate-700/80">
                <p className="text-xs font-bold text-white truncate">
                  {user?.full_name || user?.email?.split('@')[0]}
                </p>
                <p className="text-[11px] text-slate-400 truncate font-mono mt-0.5">
                  {user?.email}
                </p>
                <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-teal-400 font-medium">
                  <Shield className="w-3 h-3" />
                  <span>Role: {user?.role}</span>
                </div>
              </div>

              {/* Menu Actions */}
              <div className="py-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false)
                    onOpenProfile()
                  }}
                  className="w-full px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-700/60 flex items-center gap-2.5 transition-colors text-left"
                >
                  <UserIcon className="w-3.5 h-3.5 text-orange-400" />
                  <span>Profile &amp; Security</span>
                </button>

                <Link
                  to="/ui-catalog"
                  onClick={() => setIsDropdownOpen(false)}
                  className="w-full px-4 py-2 text-xs text-slate-300 hover:text-white hover:bg-slate-700/60 flex items-center gap-2.5 transition-colors text-left md:hidden"
                >
                  <Layers className="w-3.5 h-3.5 text-teal-400" />
                  <span>UI Catalog (7.3)</span>
                </Link>
              </div>

              {/* Sign Out */}
              <div className="pt-1 border-t border-slate-700/80">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-2.5 transition-colors text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
