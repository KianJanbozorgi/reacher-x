import { createOpenAI } from "@ai-sdk/openai";

export const HIKNOW_CHAT_MODEL = "hiknow-flash-lite";
export const HIKNOW_EMBEDDING_MODEL = "hiknow-embedding-small";

export function createHiknowClient() {
  const apiKey = process.env.HIKNOW_API_KEY;
  const baseURL = process.env.HIKNOW_BASE_URL ?? "https://hiknow.ir/v1";
  if (!apiKey || !baseURL) {
    throw new Error("Configure HIKNOW_API_KEY and HIKNOW_BASE_URL on the Convex deployment.");
  }
  const url = new URL(baseURL);
  if (url.protocol !== "https:" || url.username || url.password) {
    throw new Error("HIKNOW_BASE_URL must be an HTTPS API base URL.");
  }
  return createOpenAI({ apiKey, baseURL, name: "hiknow" });
}

/** All conversation and helper roles use the requested Hiknow chat model. */
export function createHiknowProvider() {
  return (_model?: string, _options?: unknown) =>
    createHiknowClient().chat(HIKNOW_CHAT_MODEL);
}
