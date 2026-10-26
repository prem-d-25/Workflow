import { RouterProvider } from "react-router-dom"
import { router } from "./routes"
import { AuthInitializer } from "./features/auth/components/AuthInitializer"
import { Toaster } from "./components/ui/sonner"

export default function App() {
  return (
    <AuthInitializer>
      <RouterProvider router={router} />
      <Toaster />
    </AuthInitializer>
  )
}
