// convex/agents/tools/schemas.ts
// Shared Zod schemas for agent tools

import { z } from "zod";
import { hasSyntheticProfileExamples } from "../../lib/syntheticProfileCore";

// ============================================================================
// ICP Schema
// ============================================================================

/**
 * Schema for Ideal Customer Profile (ICP) segments.
 * Used by createWorkspace and updateWorkspace tools.
 */
/** Mirrors syntheticProfileExampleValidator; required only for new generation. */
export const syntheticProfileExamplesSchema = z.array(z.object({
  platform: z.literal("twitter"), displayName: z.string(), title: z.string(), bio: z.string(),
})).length(0).default([]).describe("Empty: this application does not generate fictional people.");

export const icpSchema = z.object({
  title: z.string().describe("ICP segment title"),
  description: z.string().describe("Who this segment is"),
  painPoints: z.array(z.string()).describe("Their pain points"),
  channels: z.array(z.literal("X/Twitter")).length(1),
  syntheticExamples: syntheticProfileExamplesSchema,
  // Synthetic posts: realistic tweets/posts this ICP would write (stored permanently)
  syntheticPosts: z
    .array(z.string())
    .min(5)
    .max(10)
    .describe(
      "5-10 Twitter search seed phrases describing this audience and its needs; not invented posts"
    ),
  // Keywords for qualification evidence search (derived from syntheticPosts)
  qualificationKeywords: z
    .array(z.string().max(40))
    .min(5)
    .max(10)
    .describe(
      "10 short keywords (max 40 chars) for searching prospect's own posts"
    ),
});

export type ICP = z.infer<typeof icpSchema>;
