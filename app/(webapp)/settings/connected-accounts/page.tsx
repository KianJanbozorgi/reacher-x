"use client";

import { useConvexAuth } from "convex/react";
import { useAuth as useWorkosAuth } from "@workos-inc/authkit-nextjs/components";
import { api } from "@/convex/_generated/api";
import {
  PageHeader,
  PageLayout,
  PageContent,
} from "@/features/webapp/ui/components";
import {
  ConnectedAccountsList,
  ConnectedAccountsListWithErrorHint,
} from "@/features/linked-accounts/ui/components";
import { useXAccountConnection } from "@/features/linked-accounts/hooks/useXAccountConnection";
import { useQueryWithStatus } from "@/shared/hooks";
import { TextShimmer } from "@/shared/ui/components/TextShimmer";

export default function ConnectedAccountsPage() {
  const { isAuthenticated, isLoading: convexLoading } = useConvexAuth();
  const { user, loading: workosLoading } = useWorkosAuth();

  const callbackUrl =
    typeof window === "undefined"
      ? ""
      : `${window.location.origin}/settings/connected-accounts`;

  const currentUserQuery = useQueryWithStatus(
    api.users.getCurrentUser,
    isAuthenticated ? {} : "skip"
  );
  const accountsEnabled = isAuthenticated && !!currentUserQuery.data;

  const {
    xStatus,
    statusLoading: xStatusLoading,
    statusError: xStatusError,
    isMutating: xIsMutating,
    handleConnectX,
    handleDisconnectX,
  } = useXAccountConnection({
    callbackUrl,
    enabled: accountsEnabled,
    showStyleSyncIssueToast: true,
  });

  const userUnavailable =
    isAuthenticated &&
    (currentUserQuery.isError ||
      (currentUserQuery.isSuccess && !currentUserQuery.data));
  const userError = currentUserQuery.isError
    ? "Could not load your account. Refresh the page to try again."
    : userUnavailable
      ? "Your account is not ready yet. Refresh the page to try again."
      : null;
  const statusError = [userError, xStatusError]
    .filter(Boolean)
    .join(" · ");

  const pageLoading =
    convexLoading ||
    workosLoading ||
    (isAuthenticated && currentUserQuery.isPending) ||
    xStatusLoading;
  const isUpdatingAccount = xIsMutating;

  const googleEmail = user?.email || "";
  const googleConnectedAt = currentUserQuery.data?._creationTime
    ? new Date(currentUserQuery.data._creationTime)
    : undefined;
  const isGoogleConnected = Boolean(user?.email);

  return (
    <PageLayout className="flex max-w-none flex-col overflow-hidden border-none">
      <PageHeader title="Connected accounts" />
      <div className="scroll-fade min-h-0 min-w-0 flex-1 overflow-y-auto">
        <PageContent className="mx-4 mt-4 max-w-lg min-w-0 pb-4">
          <ConnectedAccountsListWithErrorHint statusError={statusError}>
            {!userUnavailable && (
              <ConnectedAccountsList
                loading={pageLoading}
                googleEmail={googleEmail}
                googleConnectedAt={googleConnectedAt}
                isGoogleConnected={isGoogleConnected}
                xStatus={xStatus}
                onConnectX={handleConnectX}
                onDisconnectX={handleDisconnectX}
              />
            )}
          </ConnectedAccountsListWithErrorHint>
          {isUpdatingAccount && !userUnavailable ? (
            <p className="text-muted-foreground text-xs" role="status">
              <TextShimmer>Updating account status…</TextShimmer>
            </p>
          ) : null}
        </PageContent>
      </div>
    </PageLayout>
  );
}
