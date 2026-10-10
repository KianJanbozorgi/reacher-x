import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { createHmac } from "node:crypto";

const path = process.argv[2] || ".env";
const email = process.argv[3]?.trim().toLowerCase();
const values = parseEnv(readFileSync(path, "utf8"));
const allowed = (values.PRIVATE_ALLOWED_EMAILS || "").split(",").map(value => value.trim().toLowerCase());
const master = values.AUTH_INVITE_CODE;
if (!email || !allowed.includes(email)) throw new Error("Email must appear in PRIVATE_ALLOWED_EMAILS.");
if (!master || master.length < 32) throw new Error("AUTH_INVITE_CODE must contain at least 32 characters.");
process.stdout.write(createHmac("sha256", master).update(email).digest("hex") + "\n");
