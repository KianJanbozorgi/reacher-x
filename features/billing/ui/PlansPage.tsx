"use client";
import { api } from "@/convex/_generated/api";
import { useQueryWithStatus } from "@/shared/hooks";
import { PageContent, PageHeader, PageLayout } from "@/features/webapp/ui/components";
export function PlansPage() {
  const { data: plan } = useQueryWithStatus(api.plans.getCurrentPlan);
  return <PageLayout><PageHeader title="Access and usage" /><PageContent>
    <div className="max-w-xl space-y-3 p-4">
      <h2 className="font-medium">Private tester access</h2>
      <p>Access is managed by the administrator.</p>
      {plan ? <><p>Plan: {plan.tier}</p><p>Workspace limit: {plan.workspaces.limit}</p></> : <p>Loading access…</p>}
    </div>
  </PageContent></PageLayout>;
}
