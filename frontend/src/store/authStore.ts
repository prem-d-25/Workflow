import { create } from "zustand"

export interface User {
  id: string
  companyId: string
  email: string
  fullName: string
  role: "owner" | "hr" | "employee"
  isActive: boolean
}

interface AuthState {
  user: User | null
  accessToken: string | null
  mustChangePassword: boolean
  setAuth: (user: User, accessToken: string, mustChangePassword?: boolean) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  mustChangePassword: false,
  setAuth: (user, accessToken, mustChangePassword = false) =>
    set({ user, accessToken, mustChangePassword }),
  clearAuth: () => set({ user: null, accessToken: null, mustChangePassword: false }),
}))
