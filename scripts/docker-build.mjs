import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { parseEnv } from "node:util";

// BuildKit mounts .env only for this step. Parse it as data and pass only the
// server values needed while Next.js prerenders; never copy it into the image.
const values = parseEnv(readFileSync("/run/secrets/app_env", "utf8"));
for (const key of [
  "PRIVATE_ALLOWED_EMAILS",
]) {
  if (!values[key]) throw new Error(`Set ${key} in the Docker Compose .env file.`);
  process.env[key] = values[key];
}
for (const key of [
  "NEXT_PUBLIC_CONVEX_URL",
  "NEXT_PUBLIC_SITE_URL",
]) {
  if (!process.env[key]) throw new Error(`Set ${key} in the Docker Compose .env file.`);
}

const result = spawnSync(
  process.execPath,
  ["node_modules/next/dist/bin/next", "build"],
  { stdio: "inherit", env: process.env }
);
if (result.error) throw result.error;
process.exit(result.status ?? 1);
