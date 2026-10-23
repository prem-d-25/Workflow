import { createBrowserRouter, Navigate } from "react-router-dom"
import { HealthCheckPage } from "@/pages/HealthCheckPage"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HealthCheckPage />,
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
])
