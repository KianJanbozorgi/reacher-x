"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAction } from "convex/react";
import { useQueryWithStatus } from "@/shared/hooks/useQueryWithStatus";
import { parseAsString, useQueryStates } from "nuqs";
import { api } from "@/convex/_generated/api";
import { showStyleSyncIssueToast } from "@/features/linked-accounts/lib/styleSyncIssueToast";
import { logger } from "@/shared/lib/logger";
import { toast } from "sonner";
import { finishLinkedInConnection } from "@/features/linked-accounts/lib/linkedinConnectionHelpers";

export type LinkedInConnectionStatus = {
  isConnected: boolean;
  status?:
    | "connected"
    | "connecting"
    | "reconnect_required"
    | "action_required"
    | "restricted"
    | "disconnected";
  accountId?: string;
  providerId?: string;
  entityUrn?: string;
  username?: string;
  publicIdentifier?: string;
  displayName?: string;
  headline?: string;
  profileImageUrl?: string;
  publicProfileUrl?: string;
  premiumFeatures?: string[];
  connectedAt?: number;
  styleSyncIssue?: {
    key: string;
    lastError?: string;
  };
};

export interface UseLinkedInAccountConnectionOptions {
  callbackUrl?: string;
  enabled?: boolean;
  showStyleSyncIssueToast?: boolean;
}

export function useLinkedInAccountConnection(_options: UseLinkedInAccountConnectionOptions) {
  const disabled = async () => { throw new Error("LinkedIn is disabled."); };
  return {
    linkedinStatus: null as LinkedInConnectionStatus | null,
    statusLoading: false, statusError: null, isFinalizing: false, isMutating: false,
    retryConnection: disabled, handleConnectLinkedIn: disabled, handleDisconnectLinkedIn: disabled,
    refreshStatus: async () => null,
  };
}
