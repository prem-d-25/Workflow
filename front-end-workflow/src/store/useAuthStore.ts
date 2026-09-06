import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  role: 'owner' | 'manager' | 'employee';
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  setLoading: (isLoading: boolean) => void;
  setAccessToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isLoading: false,
      setAuth: (user, token) => set({ user, accessToken: token, isLoading: false }),
      clearAuth: () => set({ user: null, accessToken: null, isLoading: false }),
      setLoading: (isLoading) => set({ isLoading }),
      setAccessToken: (token) => set({ accessToken: token }),
    }),
    {
      name: 'workflow-auth-storage',
      // We only want to persist the token, not isLoading state
      partialize: (state) => ({ accessToken: state.accessToken, user: state.user }),
    }
  )
);
