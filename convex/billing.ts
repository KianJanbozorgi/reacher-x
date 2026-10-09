import { Polar } from "@polar-sh/sdk";
import { v } from "convex/values";
import { api, components } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import type { ActionCtx } from "./_generated/server";
import { action } from "./lib/functionBuilders";

import {
  billingPeriodValidator,
  paidPlanTierValidator,
  planOfferValidator,
} from "./validators";
import { query } from "./lib/functionBuilders";
import {
  assertPlanOfferAvailable,
  getAvailablePlanOffers,
  getPlanOfferProductId,
} from "./lib/planOfferHelpers";

export const getAvailableOffers = query({
  args: {},
  returns: v.array(planOfferValidator),
  handler: () => getAvailablePlanOffers(),
});

export const startCheckoutFlow = action({
  args: {
    tier: paidPlanTierValidator,
    billingPeriod: billingPeriodValidator,
    source: v.union(
      v.literal("onboarding_plan"),
      v.literal("header_upgrade"),
      v.literal("sidebar_upgrade"),
      v.literal("plans_page_upgrade")
    ),
    origin: v.string(),
    returnTo: v.optional(v.string()),
    threadId: v.optional(v.string()),
  },
  returns: v.object({
    url: v.string(),
  }),
  handler: async (ctx, args): Promise<{ url: string }> => {
    throw new Error("Billing is disabled. Contact the administrator for access.");
  },
});

/**
 * Opens the Polar customer portal. The Convex Polar component does not accept a
 * custom return URL; redirect targets are configured in Polar when applicable.
 */
export const startCustomerPortalFlow = action({
  args: {},
  returns: v.object({
    url: v.string(),
  }),
  handler: async (ctx): Promise<{ url: string }> => {
    throw new Error("Billing is disabled. Contact the administrator for access.");
  },
});

export const listSubscriptionHistory = action({
  args: {
    page: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  returns: v.object({
    rows: v.array(
      v.object({
        id: v.string(),
        planLabel: v.string(),
        totalAmount: v.number(),
        currency: v.string(),
        billingReason: v.string(),
        status: v.string(),
        createdAt: v.number(),
      })
    ),
    page: v.number(),
    totalPages: v.number(),
    totalCount: v.number(),
  }),
  handler: async (ctx, args) => {
    return { rows: [], page: 1, totalPages: 0, totalCount: 0 };
  },
});
