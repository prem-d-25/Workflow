import React from "react"
import { useNavigate } from "react-router-dom"
import { ChevronDown, LogOut } from "lucide-react"
import { toast } from "sonner"

import { authApi } from "@/api/authApi"
import { useAuthStore } from "@/store/authStore"
import { UserAvatar } from "@/components/common/UserAvatar"
import { StatusBadge } from "@/components/common/StatusBadge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const roleLabels: Record<string, string> = {
  owner: "Owner",
  hr: "HR",
  employee: "Employee",
}

export const UserMenu: React.FC = () => {
  const navigate = useNavigate()
  const { user, clearSession } = useAuthStore()

  if (!user) return null

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch {
      // Ignore network errors on logout
    } finally {
      clearSession()
      toast.success("Logged out")
      navigate("/login")
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-control p-1 text-sm text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label="User menu"
        >
          <UserAvatar name={user.full_name} size="sm" />
          <span className="hidden text-sm font-medium sm:inline-block max-w-[140px] truncate">
            {user.full_name}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-1">
        <div className="px-3 py-2">
          <p className="text-sm font-semibold text-foreground truncate">{user.full_name}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          <div className="mt-2">
            <StatusBadge
              status={roleLabels[user.role] || user.role}
              variant="neutral"
            />
          </div>
        </div>
        <DropdownMenuSeparator className="my-1 bg-border" />
        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer text-danger focus:bg-danger-soft focus:text-danger"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
