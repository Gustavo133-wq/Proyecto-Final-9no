import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  is_admin: boolean;
  permissions: Record<string, Record<string, string>> | null;
}

interface AuthState {
  token: string | null;
  refresh: string | null;
  user: AuthUser | null;
  setAuth: (access: string, refresh: string, user: AuthUser) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refresh: null,
      user: null,
      setAuth: (token, refresh, user) => set({ token, refresh, user }),
      logout: () => set({ token: null, refresh: null, user: null }),
    }),
    { name: "emi-auth" }
  )
);