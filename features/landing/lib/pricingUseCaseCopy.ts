import type { WorkspaceUseCaseKey } from "@/shared/lib/workspaceUseCases";
import {
  getWorkspaceUseCase,
  resolveWorkspaceEntityPluralLabel,
} from "@/shared/lib/workspaceUseCases";

const PEOPLE_FEATURE_TEXT = /qualified prospects|people who match/;

/** Swap “qualified prospects” for use-case entity wording (pricing + plans). */
export function resolvePlanFeatureEntityCopy(
  feature: string,
  entityPlural: string = getWorkspaceUseCase(undefined).entityPlural
): string {
  const label = resolveWorkspaceEntityPluralLabel(entityPlural).trim();
  const singular = label === "افراد" ? "فرد" : label.endsWith("ها") ? label.slice(0, -2) : label;
  return feature
    .replace(
      "24/7 sourcing, qualification, enrichment & outreach",
      "یافتن افراد، بررسی تناسب، تکمیل اطلاعات و برقراری ارتباط به‌صورت شبانه‌روزی"
    )
    .replace(
      PEOPLE_FEATURE_TEXT,
      `${singular} مناسب`
    )
    .replace("per workspace / month", "برای هر فضای کاری در ماه")
    .replace("Unlimited workspaces", "فضاهای کاری نامحدود");
}

export function resolvePricingFeatureCopy(
  feature: string,
  useCaseKey: WorkspaceUseCaseKey
): string {
  return resolvePlanFeatureEntityCopy(
    feature,
    getWorkspaceUseCase(useCaseKey).entityPlural
  );
}
