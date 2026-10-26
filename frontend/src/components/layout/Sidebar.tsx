import React from "react"
import { NavLink } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import { NAV_ITEMS } from "./navConfig"
import { cn } from "@/lib/utils"

interface SidebarProps {
  className?: string
  onNavigate?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({ className, onNavigate }) => {
  const user = useAuthStore((s) => s.user)

  if (!user) return null

  const items = NAV_ITEMS.filter((item) => item.roles.includes(user.role))

  return (
    <aside
      className={cn(
        "flex h-full w-[232px] flex-col border-r border-border bg-surface",
        className
      )}
    >
      <div className="flex h-14 items-center px-5 border-b border-border">
        <span className="text-base font-semibold tracking-tight text-foreground">
          Workflow
        </span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  "flex h-9 items-center gap-2.5 rounded-control px-3 text-sm transition-colors",
                  isActive
                    ? "bg-accent-soft font-medium text-accent"
                    : "text-foreground hover:bg-muted"
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
