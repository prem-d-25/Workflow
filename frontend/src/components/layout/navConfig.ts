import type { LucideIcon } from "lucide-react"
import {
  LayoutDashboard,
  Users,
  Calendar,
  Megaphone,
  FileText,
  Building2,
  User as UserIcon,
} from "lucide-react"
import { USER_ROLES, type UserRole } from "@/features/auth/types"

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
  roles: UserRole[]
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
    roles: [USER_ROLES.OWNER, USER_ROLES.HR, USER_ROLES.EMPLOYEE],
  },
  {
    label: "Employees",
    path: "/employees",
    icon: Users,
    roles: [USER_ROLES.OWNER, USER_ROLES.HR],
  },
  {
    label: "Leave",
    path: "/leave",
    icon: Calendar,
    roles: [USER_ROLES.OWNER, USER_ROLES.HR, USER_ROLES.EMPLOYEE],
  },
  {
    label: "Announcements",
    path: "/announcements",
    icon: Megaphone,
    roles: [USER_ROLES.OWNER, USER_ROLES.HR, USER_ROLES.EMPLOYEE],
  },
  {
    label: "Policy",
    path: "/policy",
    icon: FileText,
    roles: [USER_ROLES.OWNER],
  },
  {
    label: "Company",
    path: "/company",
    icon: Building2,
    roles: [USER_ROLES.OWNER],
  },
  {
    label: "Profile",
    path: "/profile",
    icon: UserIcon,
    roles: [USER_ROLES.OWNER, USER_ROLES.HR, USER_ROLES.EMPLOYEE],
  },
]
