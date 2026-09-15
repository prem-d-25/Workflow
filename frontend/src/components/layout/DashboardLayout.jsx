import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'
import { ProfileModal } from './ProfileModal'

export function DashboardLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex font-sans selection:bg-orange-500 selection:text-white">
      {/* Collapsible / Responsive Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900">
        <Navbar
          onToggleMobile={() => setIsMobileOpen(!isMobileOpen)}
          onOpenProfile={() => setIsProfileOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {children ? children : <Outlet />}
        </main>
      </div>

      {/* Profile & Security Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  )
}
