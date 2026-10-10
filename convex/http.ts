import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import {
  createConvexHttpWideEventLogger,
  getWideEventLogger,
} from "./lib/wideEventLogger";
import {
  buildXWebhookCrcResponse,
  verifyXWebhookSignature,
} from "./lib/xActivity";
import {
  X_POST_WEIGHTED_MAX,
  getXPostWeightedLength,
} from "../shared/lib/twitter/xPostTextLimit";

const http = httpRouter();

http.route({
  path: "/auth/jwks",
  method: "GET",
  handler: httpAction(async () => {
    const raw = process.env.AUTH_JWT_PUBLIC_JWK;
    if (!raw) return new Response("Authentication key unavailable", { status: 503 });
    const key = JSON.parse(raw) as Record<string, unknown>;
    if (key.kty !== "RSA" || key.alg !== "RS256" || typeof key.n !== "string" || typeof key.e !== "string")
      return new Response("Invalid authentication key", { status: 503 });
    return new Response(JSON.stringify({ keys: [key] }), {
      headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=300" },
    });
  }),
});

function withLoggedHttpAction(
  operation: string,
  handler: (ctx: any, request: Request) => Promise<Response>
) {
  return httpAction(async (ctx, request) => {
    const logEvent = createConvexHttpWideEventLogger({
      operation,
      request,
    });

    try {
      const response = await handler(
        {
          ...(ctx as unknown as Record<string, unknown>),
          logEvent,
        },
        request
      );
      logEvent.emitSuccess(undefined, {
        status_code: response.status,
      });
      return response;
    } catch (error) {
      logEvent.emitError(error);
      throw error;
    }
  });
}

http.route({
  path: "/x-webhook",
  method: "GET",
  handler: withLoggedHttpAction("x_webhook_crc", async (_ctx, request) => {
    const crcToken = new URL(request.url).searchParams.get("crc_token");
    if (!crcToken) {
      return new Response(
        JSON.stringify({
          status: "error",
          message: "Missing crc_token",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        response_token: await buildXWebhookCrcResponse(crcToken),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }),
});



http.route({
  path: "/x-webhook",
  method: "POST",
  handler: withLoggedHttpAction("x_webhook_event", async (ctx, request) => {
    const logEvent = getWideEventLogger(ctx);
    const rawBody = await request.text();
    const signature = request.headers.get("x-twitter-webhooks-signature");

    logEvent?.set({
      webhook: {
        has_signature: Boolean(signature),
        provider: "x",
      },
    });

    if (!(await verifyXWebhookSignature(rawBody, signature))) {
      return new Response(
        JSON.stringify({
          status: "error",
          message: "Invalid webhook signature",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    try {
      const payload = rawBody ? JSON.parse(rawBody) : {};
      const result = await ctx.runAction(
        internal.xActivity.handleWebhookPayloadInternal,
        {
          payload,
        }
      );

      return new Response(
        JSON.stringify({
          status: "success",
          processed: result.processed,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      logEvent?.error(error, {
        status_code: 500,
      });
      return new Response(
        JSON.stringify({
          status: "error",
          message: error instanceof Error ? error.message : "Unknown error",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }),
});

export default http;
