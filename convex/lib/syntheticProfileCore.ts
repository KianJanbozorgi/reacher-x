import type { Infer } from "convex/values";
import type { syntheticProfileExampleValidator } from "../validators";

export type SyntheticProfileExample = Infer<
  typeof syntheticProfileExampleValidator
>;

type ProfileWithExamples = {
  title?: string;
  description?: string;
  syntheticExamples?: SyntheticProfileExample[];
};

/** Examples are embedded in their owning ICP, never in the real prospects table. */
export function hasSyntheticProfileExamples(
  profile: ProfileWithExamples
): boolean {
  return Boolean(profile.title?.trim() && profile.description?.trim());
}

export function validateSyntheticProfileExamples(
  profiles: ProfileWithExamples[]
): void {
  if (
    profiles.length === 0 ||
    profiles.some((profile) => !hasSyntheticProfileExamples(profile))
  ) {
    throw new Error(
      "Each target profile needs a title and description."
    );
  }
}

/** Names are deliberately omitted: illustrative bios guide interpretation, never evidence. */
export function formatSyntheticTargetingExamples(
  profiles: ProfileWithExamples[]
): string {
  return "";
}
