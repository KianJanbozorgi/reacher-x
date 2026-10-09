"use client";

import { useCallback, useState } from "react";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { api } from "@/convex/_generated/api";
import { useSetupThreadDraft } from "@/shared/hooks";
import { getWorkspaceUseCase } from "@/shared/lib/workspaceUseCases";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/components/Button";
import { Progress } from "@/shared/ui/components/Progress";
import { ScrollArea } from "@/shared/ui/components/ScrollArea";
import { AsciiSpinnerText } from "@/shared/ui/components/AsciiSpinnerText";
import {
  PageHeader,
  DESKTOP_PANEL_BORDER_CLASS_NAME,
} from "@/features/webapp/ui/components";
import { GrantedPlanStep } from "./onboarding/GrantedPlanStep";
import { SetupExampleProfiles } from "./onboarding/SetupExampleProfiles";

export function AgentOnboardingPanel({
  className,
  threadId,
  onClose,
  approvalDisabled = false,
}: {
  approvalDisabled?: boolean;
  className?: string;
  threadId?: string | null;
  onClose?: () => void;
}) {
  const { setupDraft: session, isLoading } = useSetupThreadDraft(threadId);
  const approve = useMutation(api.setupSessions.approveSetupGeneration);
  const [isApproving, setIsApproving] = useState(false);
  const [approvalFailure, setApprovalFailure] = useState<{
    revisionKey: string;
    message: string;
  } | null>(null);
  const revisionKey = `${session?.sessionId}:${session?.generationRevision}`;
  const approvalError =
    approvalFailure?.revisionKey === revisionKey
      ? approvalFailure.message
      : null;
  const labels = getWorkspaceUseCase(session?.useCaseKey);
  const step = session?.currentStepId ?? "input";
  const review = session?.status === "awaiting_icp_confirmation";
  const handleApprove = useCallback(async () => {
    if (!session || isApproving || approvalDisabled) return;
    setIsApproving(true);
    setApprovalFailure(null);
    try {
      await approve({
        sessionId: session.sessionId,
        generationRevision: session.generationRevision,
      });
    } catch (error) {
      setApprovalFailure({
        revisionKey,
        message:
          error instanceof ConvexError &&
          typeof error.data === "string" &&
          error.data.trim()
            ? error.data.trim()
            : "Could not continue. Wait for Agent to finish, then try again.",
      });
    } finally {
      setIsApproving(false);
    }
  }, [approve, isApproving, session, approvalDisabled, revisionKey]);
  const title =
    step === "plan"
      ? "Tester access"
      : `Example ${labels.entityPlural.toLowerCase()}`;
  return (
    <aside
      id="rx-onboarding-panel"
      className={cn(
        "bg-background flex h-full min-h-0 w-full max-w-lg flex-col overflow-hidden",
        DESKTOP_PANEL_BORDER_CLASS_NAME,
        className
      )}
    >
      <PageHeader
        title={title}
        onBack={onClose}
        titleSuffix={
          <span className="text-muted-foreground font-mono text-xs font-medium">
            · {session?.currentStepNumber ?? 1}/{session?.totalSteps ?? 2}
          </span>
        }
      />
      <Progress
        value={
          session ? (session.currentStepNumber / session.totalSteps) * 100 : 0
        }
        className="h-0.5 shrink-0 rounded-none"
        indicatorClassName="bg-foreground rounded-none"
      />
      {!threadId || (!isLoading && !session) ? (
        <p className="text-muted-foreground p-4 text-sm">
          Setup draft is unavailable. Reopen setup from the workspace menu.
        </p>
      ) : isLoading || !session ? (
        <div className="p-4">
          <AsciiSpinnerText text="Loading setup..." />
        </div>
      ) : (
        <>
          <ScrollArea className="min-h-0 flex-1">
            {review ? (
              <SetupExampleProfiles
                profiles={session.generatedProfiles}
                useCaseKey={session.useCaseKey}
              />
            ) : step === "plan" ? (
              <div className="px-4 py-4">
                {!session.requiresPlan ? (
                  <GrantedPlanStep threadId={threadId} />
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Tester access has not been granted for this account. Contact the administrator.
                  </p>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground p-4 text-sm">
                {session.status === "generating_profiles" ? (
                  <AsciiSpinnerText
                    text={`Creating example ${labels.entityPlural.toLowerCase()}...`}
                  />
                ) : (
                  "Tell Agent who you want to reach in the chat."
                )}
              </div>
            )}
          </ScrollArea>
          {review ? (
            <footer className="bg-background shrink-0 border-t px-4 py-2">
              {approvalError ? (
                <p role="alert" className="text-destructive mb-2 text-sm">
                  {approvalError}
                </p>
              ) : null}
              <Button
                size="xs"
                className="w-full"
                disabled={isApproving || approvalDisabled}
                onClick={() => void handleApprove()}
              >
                {isApproving ? "Continuing..." : "Continue"}
              </Button>
            </footer>
          ) : null}
        </>
      )}
    </aside>
  );
}
