import { create } from "zustand"
import type { User, AuthStatus } from "@/features/auth/types"

interface AuthState {
  user: User | null
  accessToken: string | null
  status: AuthStatus
  setSession: (user: User, token: string) => void
  setAccessToken: (token: string) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  status: "loading",
  setSession: (user, token) =>
    set({
      user,
      accessToken: token,
      status: "authenticated",
    }),
  setAccessToken: (token) =>
    set({
      accessToken: token,
    }),
  clearSession: () =>
    set({
      user: null,
      accessToken: null,
      status: "unauthenticated",
    }),
}))

export const useMustChangePassword = () =>
  useAuthStore((state) => state.user?.must_change_password ?? false)
