import { useConvexAuth } from "convex/react";
import { useAuth as useLocalAuth } from "@/shared/lib/localAuth/client";
import { api } from "../../convex/_generated/api";
import { useMemo } from "react";
import { getWorkspaceUseCase } from "../lib/workspaceUseCases";
import { useQueryWithStatus } from "./useQueryWithStatus";
import { useViewerUserRecord } from "./useViewerUserRecord";

/**
 * Simplified authentication hook that handles user storage and workspace loading
 *
 * This hook follows React best practices by:
 * 1. Calculating derived state during rendering
 * 2. Using a single Effect for side effects
 * 3. Providing a clean, minimal API
 *
 * Usage:
 * ```tsx
 * const { isAuthenticated, isLoading, user, workspace } = useAuth();
 * ```
 */
export function useAuth() {
  const { isLoading: convexLoading, isAuthenticated: convexAuthenticated } =
    useConvexAuth();
  const { user: localUser, loading: localAuthLoading } = useLocalAuth();
  const { currentUser, currentUserQuery, isProvisioning } =
    useViewerUserRecord();

  // Get workspace data (only if authenticated)
  const workspaceQuery = useQueryWithStatus(
    api.workspaces.getDefaultWorkspace,
    convexAuthenticated && currentUser ? {} : "skip"
  );
  const workspace = workspaceQuery.data;

  // Calculate authentication state during rendering
  const isAuthenticated = useMemo(() => {
    return (
      convexAuthenticated &&
      !!localUser &&
      currentUserQuery.isSuccess &&
      !!currentUser
    );
  }, [
    convexAuthenticated,
    currentUser,
    currentUserQuery.isSuccess,
    localUser,
  ]);

  const isLoading = useMemo(() => {
    return (
      convexLoading ||
      localAuthLoading ||
      isProvisioning ||
      (!!currentUser && workspaceQuery.isPending)
    );
  }, [
    convexLoading,
    currentUser,
    isProvisioning,
    localAuthLoading,
    workspaceQuery.isPending,
  ]);

  const error = currentUserQuery.error ?? workspaceQuery.error ?? null;

  const workspaceUseCase = useMemo(() => {
    return workspace ? getWorkspaceUseCase(workspace.useCaseKey) : null;
  }, [workspace]);

  return {
    isAuthenticated,
    isLoading,
    error,
    user: localUser,
    userId: currentUser?._id || null,
    workspace,
    workspaceUseCase,
  };
}
