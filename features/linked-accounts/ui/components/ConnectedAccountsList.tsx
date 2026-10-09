"use client";

import React from "react";
import { Button } from "@/shared/ui/components/Button";
import { formatConnectedRelativeLabel } from "@/features/linked-accounts/lib/connectedRelativeLabel";
import { getStyleSyncIssueInlineMessage } from "@/features/linked-accounts/lib/styleSyncIssueCopy";
import {
  LinkedAccountRow,
  LinkedAccountsListSkeleton,
} from "./LinkedAccountRow";
import type { TwitterConnectionStatus } from "@/features/linked-accounts/hooks/useXAccountConnection";
import type { LinkedInConnectionStatus } from "@/features/linked-accounts/hooks/useLinkedInAccountConnection";

export interface ConnectedAccountsListProps {
  loading: boolean;
  googleEmail: string;
  googleConnectedAt?: Date;
  isGoogleConnected: boolean;
  xStatus: TwitterConnectionStatus | null;
  onConnectX: () => void;
  onDisconnectX: () => void;
  linkedinStatus?: LinkedInConnectionStatus | null;
  onConnectLinkedIn?: () => void;
  onDisconnectLinkedIn?: () => void;
  onRetryLinkedIn?: () => void;
  /** When true, omit Disconnect (e.g. onboarding). */
  hideXDisconnect?: boolean;
  hideLinkedInDisconnect?: boolean;
}

export function ConnectedAccountsList({
  loading,
  googleEmail,
  googleConnectedAt,
  isGoogleConnected,
  xStatus,
  onConnectX,
  onDisconnectX,
  hideXDisconnect,
}: ConnectedAccountsListProps) {
  if (loading) {
    return <LinkedAccountsListSkeleton rows={2} />;
  }

  const xHandle = xStatus?.isConnected
    ? `@${xStatus.screenName || "connected"}`
    : "@Connect";

  const xIsFullyConnected = Boolean(xStatus?.isConnected);
  const xNeedsReconnect =
    Boolean(xStatus) &&
    !xIsFullyConnected &&
    (xStatus!.status === "expired" ||
      xStatus!.status === "reconnect_required" ||
      (xStatus!.missingScopes?.length ?? 0) > 0);

  const xStyleIssueMessage =
    xIsFullyConnected && xStatus?.styleSyncIssue?.key
      ? getStyleSyncIssueInlineMessage("twitter")
      : null;

  return (
    <ul className="flex w-full min-w-0 flex-col p-0" role="list">
      <li className="list-none">
        <LinkedAccountRow
          provider="google"
          accountHandle={googleEmail}
          renderRight={() =>
            isGoogleConnected ? (
              <span className="text-muted-foreground shrink-0 text-xs whitespace-nowrap">
                {formatConnectedRelativeLabel(googleConnectedAt)}
              </span>
            ) : (
              <span className="text-muted-foreground shrink-0 text-xs">
                Not connected
              </span>
            )
          }
        />
      </li>
      <li className="list-none">
        <LinkedAccountRow
          provider="twitter"
          accountHandle={xHandle}
          accountMeta={
            xStyleIssueMessage ? (
              <p className="text-xs leading-4 break-words text-amber-600">
                {xStyleIssueMessage}
              </p>
            ) : null
          }
          renderRight={() => {
            if (xIsFullyConnected) {
              const xConnectedAt =
                xStatus?.connectedAt != null
                  ? new Date(xStatus.connectedAt)
                  : undefined;
              return (
                <>
                  <span className="text-muted-foreground shrink-0 text-xs whitespace-nowrap">
                    {formatConnectedRelativeLabel(xConnectedAt)}
                  </span>
                  {!hideXDisconnect ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      className="shrink-0"
                      onClick={onDisconnectX}
                    >
                      Disconnect
                    </Button>
                  ) : null}
                </>
              );
            }
            if (xNeedsReconnect) {
              return (
                <>
                  {xStatus?.missingScopes &&
                  xStatus.missingScopes.length > 0 ? (
                    <span className="text-muted-foreground hidden max-w-40 truncate text-xs sm:inline">
                      Reconnect required
                    </span>
                  ) : null}
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    className="shrink-0"
                    onClick={onConnectX}
                  >
                    Reconnect
                  </Button>
                </>
              );
            }
            return (
              <Button
                type="button"
                variant="outline"
                size="xs"
                className="shrink-0"
                onClick={onConnectX}
              >
                Connect
              </Button>
            );
          }}
        />
      </li>

    </ul>
  );
}

export function ConnectedAccountsListWithErrorHint({
  statusError,
  children,
}: {
  statusError: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 space-y-2">
      {children}
      {statusError ? (
        <p className="text-muted-foreground text-xs break-words" role="status">
          {statusError}
        </p>
      ) : null}
    </div>
  );
}
