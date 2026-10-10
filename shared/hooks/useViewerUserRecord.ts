import { useEffect, useMemo, useRef } from "react";
import { useConvexAuth, useMutation } from "convex/react";
import { useAuth as useLocalAuth } from "@/shared/lib/localAuth/client";
import { api } from "@/convex/_generated/api";
import { logger } from "@/shared/lib/logger";
import { useQueryWithStatus } from "./useQueryWithStatus";

export function useViewerUserRecord() {
  const { isAuthenticated: convexAuthenticated, isLoading: convexLoading } =
    useConvexAuth();
  const { user: localUser, loading: localAuthLoading } = useLocalAuth();
  const storeUser = useMutation(api.users.createOrUpdateUser);
  const hasStoredUserRef = useRef(false);

  const currentUserQuery = useQueryWithStatus(
    api.users.getCurrentUser,
    convexAuthenticated ? {} : "skip"
  );
  const currentUser = currentUserQuery.data ?? null;

  useEffect(() => {
    if (!convexAuthenticated || !localUser) {
      hasStoredUserRef.current = false;
      return;
    }
    if (hasStoredUserRef.current) return;
    if (currentUserQuery.isPending || currentUserQuery.isError) return;
    if (currentUser) {
      hasStoredUserRef.current = true;
      return;
    }

    void (async () => {
      try {
        await storeUser({
          workosUserId: localUser.id,
          email: localUser.email,
          firstName: localUser.firstName || undefined,
          lastName: localUser.lastName || undefined,
          profileImageUrl: localUser.profilePictureUrl || undefined,
        });
        hasStoredUserRef.current = true;
      } catch (error) {
        logger.error("Failed to store viewer user record:", error);
        hasStoredUserRef.current = false;
      }
    })();
  }, [
    convexAuthenticated,
    currentUser,
    currentUserQuery.isError,
    currentUserQuery.isPending,
    storeUser,
    localUser,
  ]);

  const isProvisioning = useMemo(() => {
    if (!convexAuthenticated || !localUser) {
      return false;
    }
    return (
      currentUserQuery.isPending || (!currentUser && !currentUserQuery.isError)
    );
  }, [
    convexAuthenticated,
    currentUser,
    currentUserQuery.isError,
    currentUserQuery.isPending,
    localUser,
  ]);

  return {
    currentUser,
    currentUserQuery,
    isLoading: convexLoading || localAuthLoading || isProvisioning,
    isProvisioning,
  };
}
