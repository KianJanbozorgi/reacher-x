"use client";

import type { ReactNode } from "react";
import { PageContent } from "@/features/webapp/ui/components";
import {
  ConnectedAccountsList,
  ConnectedAccountsListWithErrorHint,
} from "@/features/linked-accounts/ui/components";
import type { ConnectedAccountsListProps } from "@/features/linked-accounts/ui/components/ConnectedAccountsList";
import { Button } from "@/shared/ui/components/Button";
import { ScrollArea } from "@/shared/ui/components/ScrollArea";

interface ConnectionsStepContentProps {
  accounts: ConnectedAccountsListProps;
  statusError?: string | null;
  isMutating: boolean;
  isCompletingStep: boolean;
  continueDisabled: boolean;
  onContinue: () => void;
  onConnectLater: () => void;
  children?: ReactNode;
}

/** Shared by live setup and its UI preview. Connection behavior stays with the caller. */
export function ConnectionsStepContent({
  accounts,
  statusError = null,
  isMutating,
  isCompletingStep,
  continueDisabled,
  onContinue,
  onConnectLater,
  children,
}: ConnectionsStepContentProps) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <ScrollArea className="min-h-0 flex-1">
        <PageContent className="min-w-0 overflow-x-hidden px-4 py-4">
          <header className="space-y-1">
            <h2 className="text-xl font-semibold">
              اجازه دهید دستیار اقدام کند
            </h2>
            <p className="text-muted-foreground text-sm wrap-break-word">
              حساب خود را متصل کنید تا دستیار بتواند{" "}
              <span className="text-foreground">پیام مستقیم بفرستد</span>،{" "}
              <span className="text-foreground">به پست‌ها پاسخ دهد</span> و{" "}
              <span className="text-foreground">از طرف شما تعامل کند</span>.
              همچنین می‌توانید{" "}
              <span className="text-foreground">بعداً آن را متصل کنید</span>.
            </p>
          </header>

          <div className="mt-4">
            <ConnectedAccountsListWithErrorHint statusError={statusError}>
              <ConnectedAccountsList
                {...accounts}
                hideXDisconnect
                hideLinkedInDisconnect
              />
            </ConnectedAccountsListWithErrorHint>

            {isMutating ? (
              <p className="text-muted-foreground mt-2 text-xs">
                در حال به‌روزرسانی وضعیت حساب…
              </p>
            ) : null}
          </div>
        </PageContent>
      </ScrollArea>

      {children}

      <div className="bg-background shrink-0 border-t px-4 py-2">
        <div className="flex w-full min-w-0 items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="xs"
            disabled={isCompletingStep}
            onClick={() => void onConnectLater()}
          >
            اتصال در آینده
          </Button>
          <Button
            type="button"
            size="xs"
            disabled={continueDisabled}
            onClick={() => void onContinue()}
          >
            ادامه
          </Button>
        </div>
      </div>
    </div>
  );
}
