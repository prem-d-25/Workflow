import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "react-router-dom"
import { router } from "./routes"
import { AuthInitializer } from "./features/auth/components/AuthInitializer"
import { Toaster } from "./components/ui/sonner"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>
        <RouterProvider router={router} />
        <Toaster />
      </AuthInitializer>
    </QueryClientProvider>
  )
}
