export type SetupPanelStepId =
  | "use_case"
  | "input"
  | "connections"
  | "plan"
  | "preference";

export const SETUP_PANEL_STEP_TITLES: Record<SetupPanelStepId, string> = {
  use_case: "دنبال چه کسانی هستید؟",
  input: "مخاطبان شما",
  connections: "اتصال حساب‌ها",
  plan: "پلن‌ها",
  preference: "ترجیحات",
};

export function getSetupPanelStepTitle(stepId: string | undefined): string {
  if (!stepId) return "راه‌اندازی فضای کاری";
  return (
    SETUP_PANEL_STEP_TITLES[stepId as SetupPanelStepId] ?? "راه‌اندازی فضای کاری"
  );
}
