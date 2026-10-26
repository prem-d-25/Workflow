import React, { useState } from "react"
import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { Topbar } from "./Topbar"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { ForceChangePasswordDialog } from "@/features/auth/components/ForceChangePasswordDialog"

export const AppShell: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-[232px] p-0">
          <Sidebar onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Desktop Fixed Sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-[232px] md:flex-col z-30">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col md:pl-[232px]">
        <Topbar onOpenMobileNav={() => setMobileOpen(true)} />
        <main className="flex-1 bg-background">
          <div className="mx-auto max-w-[1080px] p-4 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Forced change password modal if required */}
      <ForceChangePasswordDialog />
    </div>
  )
}
