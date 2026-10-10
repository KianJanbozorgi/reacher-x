import { readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { createHash, createPrivateKey, createPublicKey } from "node:crypto";

const path = process.argv[2] || ".env";
const encoded = parseEnv(readFileSync(path, "utf8")).AUTH_JWT_PRIVATE_KEY;
if (!encoded) throw new Error("AUTH_JWT_PRIVATE_KEY is missing from the environment file.");
const privateKey = createPrivateKey(Buffer.from(encoded, "base64").toString("utf8"));
const publicKey = createPublicKey(privateKey).export({ format: "jwk" });
const kid = createHash("sha256").update(JSON.stringify(publicKey)).digest("hex").slice(0, 16);
process.stdout.write(JSON.stringify({ ...publicKey, use: "sig", alg: "RS256", kid }) + "\n");
