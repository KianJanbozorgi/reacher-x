"use client";

import { type ReactNode, useCallback } from "react";
import { ConvexProviderWithAuth } from "convex/react";
import { LocalAuthProvider, useAuth as useLocalAuth, type LocalUser } from "@/shared/lib/localAuth/client";
import { convex } from "@/shared/lib/convex";

export function ConvexClientProviderClient({
  children,
  initialAuth,
}: {
  children: ReactNode;
  initialAuth: LocalUser | null;
}) {
  return (
    <LocalAuthProvider user={initialAuth}>
      <ConvexProviderWithAuth client={convex} useAuth={useAuthFromLocalSession}>
        {children}
      </ConvexProviderWithAuth>
    </LocalAuthProvider>
  );
}

function useAuthFromLocalSession() {
  const { user, loading: isLoading } = useLocalAuth();

  // Keep Convex's auth provider state tied to the stable local session only.
  // Token fetch/refresh loading is handled inside fetchAccessToken; exposing it
  // here makes Convex reset auth on every token refresh, which causes UI flicker.
  const loading = isLoading ?? false;
  const authenticated = !!user;

  const fetchAccessToken = useCallback(
    async (_options: { forceRefreshToken: boolean }) => {
      try {
        const response = await fetch("/api/auth/token", { cache: "no-store" });
        if (!response.ok) return null;
        const data = await response.json();
        return typeof data.token === "string" ? data.token : null;
      } catch {
        return null;
      }
    },
    []
  );

  return {
    isLoading: loading,
    isAuthenticated: authenticated,
    fetchAccessToken,
  };
}
