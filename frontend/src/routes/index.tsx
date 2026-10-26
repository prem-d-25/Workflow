import { createBrowserRouter, Navigate } from "react-router-dom"
import { ProtectedRoute } from "./ProtectedRoute"
import { PublicOnlyRoute } from "./PublicOnlyRoute"
import { RoleRoute } from "./RoleRoute"
import { AppShell } from "@/components/layout/AppShell"
import { LoginPage } from "@/pages/LoginPage"
import { RegisterPage } from "@/pages/RegisterPage"
import { DashboardPage } from "@/pages/DashboardPage"
import { ComingSoonPage } from "@/pages/ComingSoonPage"
import { USER_ROLES } from "@/features/auth/types"

export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          {
            path: "/",
            element: <DashboardPage />,
          },
          {
            path: "/leave",
            element: <ComingSoonPage title="Leave" />,
          },
          {
            path: "/announcements",
            element: <ComingSoonPage title="Announcements" />,
          },
          {
            path: "/profile",
            element: <ComingSoonPage title="Profile" />,
          },
          // HR and Owner only
          {
            element: <RoleRoute allowedRoles={[USER_ROLES.OWNER, USER_ROLES.HR]} />,
            children: [
              {
                path: "/employees",
                element: <ComingSoonPage title="Employees" />,
              },
            ],
          },
          // Owner only
          {
            element: <RoleRoute allowedRoles={[USER_ROLES.OWNER]} />,
            children: [
              {
                path: "/policy",
                element: <ComingSoonPage title="Policy" />,
              },
              {
                path: "/company",
                element: <ComingSoonPage title="Company" />,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
])
