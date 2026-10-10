import { spawnSync } from "node:child_process";
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
