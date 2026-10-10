"use client";

import { createContext, useContext, type ReactNode } from "react";

export type LocalUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profilePictureUrl: string | null;
};

const AuthContext = createContext<{ user: LocalUser | null; loading: boolean }>({ user: null, loading: true });

export function LocalAuthProvider({ user, children }: { user: LocalUser | null; children: ReactNode }) {
  return <AuthContext.Provider value={{ user, loading: false }}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
