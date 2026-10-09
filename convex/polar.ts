// convex/polar.ts
// Polar subscription management
// @see https://www.convex.dev/components/polar

import { api, components } from "./_generated/api";
import { action, internalMutation, query } from "./lib/functionBuilders";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { getUserFromIdentity } from "./lib/userUtils";
import { refreshUserPlanFromBilling } from "./lib/planTransitionCore";
import { assertProductOffersAvailable } from "./lib/planOfferHelpers";
import { polarCheckoutArgs } from "./validators";
import { getWideEventLogger } from "./lib/wideEventLogger";

// ============================================================================
// Polar Client Initialization
// ============================================================================

/**
 * Polar client for subscription management.
 *
 * Environment variables (set in Convex dashboard):
 * - POLAR_ORGANIZATION_TOKEN - Your Polar org token
 * - POLAR_WEBHOOK_SECRET - Webhook secret from Polar dashboard
 * - POLAR_SERVER - "sandbox" or "production"
 * - POLAR_PRODUCT_* - Product UUIDs for tier mapping
 *
 * @see https://www.convex.dev/components/polar
 */
// Compatibility for stored usage readers. This private app has no billing provider.
export const polar = {
  getCurrentSubscription: async (..._args: unknown[]): Promise<null> => null,
};

export const getConfiguredProducts = query({ args: {}, handler: async () => ({}) });
export const listAllProducts = query({ args: {}, handler: async () => [] });
const billingDisabled = () => { throw new Error("Billing is disabled. Access is managed by the administrator."); };
export const generateCustomerPortalUrl = action({ args: {}, handler: billingDisabled });
export const cancelCurrentSubscription = action({ args: {}, handler: billingDisabled });
export const generateCheckoutLink = action({ args: polarCheckoutArgs, handler: billingDisabled });
export const changeCurrentSubscription = action({ args: { productId: v.string() }, handler: billingDisabled });

// ============================================================================
// Queries
// ============================================================================

/**
 * Get current user info for Polar integration.
 * Used by the Polar client's getUserInfo callback.
 */
export const getCurrentUserInfo = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await getUserFromIdentity(ctx, identity, false);
    if (!user) throw new Error("User not found");

    return { _id: user._id, email: user.email };
  },
});

/**
 * Get current user's subscription status.
 * Returns null if no active subscription.
 *
 * @see https://www.convex.dev/components/polar#getcurrentsubscription
 */
export const getSubscription = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const user = await getUserFromIdentity(ctx, identity, false);
    if (!user) return null;

    return polar.getCurrentSubscription(ctx, { userId: user._id });
  },
});

// ============================================================================
// Internal Mutations (called from webhooks)
// ============================================================================

/**
 * Sync Polar subscription to userPlans table.
 * Called from webhook handlers when subscription changes.
 *
 * IMPORTANT: The productId parameter is the actual Polar product UUID,
 * NOT the product key name. We map UUIDs to tiers using env vars.
 */
export const syncSubscriptionToUserPlan = internalMutation({
  args: {
    userId: v.id("users"),
    productId: v.optional(v.string()), // Polar product UUID
    subscriptionId: v.optional(v.string()),
    status: v.optional(v.string()),
    currentPeriodStart: v.optional(v.string()), // ISO date string
    currentPeriodEnd: v.optional(v.string()), // ISO date string
    polarCustomerId: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // The Polar component persists each webhook before this callback and rejects
    // stale updates. Re-read it so a late event cannot roll back current billing.
    await refreshUserPlanFromBilling(ctx, args.userId);
    getWideEventLogger(ctx)?.set({
      billing: { provider: "polar" },
      subscription: { id: args.subscriptionId, status: args.status },
      user: { id: String(args.userId) },
    });
    return null;
  },
});
