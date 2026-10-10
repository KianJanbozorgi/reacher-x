// @vitest-environment happy-dom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, test, vi } from "vitest";
import { PlanSelector } from "./PlanSelector";

for (const mode of ["plans", "onboarding"] as const) {
  test(`${mode} offers complimentary access without checkout`, async () => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    const container = document.createElement("div");
    const root = createRoot(container);
    const onUpgradePaid = vi.fn();
    await act(async () => root.render(<PlanSelector mode={mode} currentTier="free" onUpgradePaid={onUpgradePaid} />));
    expect(container.textContent).toContain("complimentary tester plan");
    expect(container.textContent).not.toMatch(/Checkout|Upgrade for|LinkedIn/);
    expect(container.querySelectorAll("button")).toHaveLength(0);
    expect(onUpgradePaid).not.toHaveBeenCalled();
    await act(async () => root.unmount());
  });
}
