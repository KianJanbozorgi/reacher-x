# Deployment handoff — Twitter discovery

Code: `KianJanbozorgi/reacher-x`, branch `codex/twitter-private-hiknow`. Review the latest commit before merging. No credential file is committed.

## What the owner provides privately

- A domain/hostname under their control and DNS access to point it to the Docker server.
- No email provider is required. Password recovery is disabled for now.
- A Convex **production** deployment and its deploy key, delivered through a secret manager or secure server environment. The cloud-workspace Convex deployment used during development is a development deployment; it is not the production database.
- Hiknow, SocialAPI.tech and X credentials through a secret manager, not in Git or email. Set the provider credentials on the Convex deployment.

## Supervisor: provision and deploy

1. Install Docker with Compose on the server. Point `HOSTNAME` at the server and allow inbound TCP 80/443. Docker installs pnpm dependencies and builds Next.js inside the image; the frontend needs no host-side Node.js or build artifacts.
2. Clone the repository and switch to `codex/twitter-private-hiknow`.
3. Create git-ignored `.env` from `.env.example` on the server. Set `APP_DOMAIN=HOSTNAME`, `APP_BIND_IP=127.0.0.1`, `NEXT_PUBLIC_SITE_URL=https://HOSTNAME`, `NEXT_PUBLIC_CONVEX_URL` to the **production** Convex URL, `AUTH_ISSUER_URL` to the production Convex HTTP actions URL (`*.convex.site`), and `AUTH_JWT_PRIVATE_KEY`. Generate the RSA auth key with the command in `.env.example`; keep it private and stable across upgrades. The Docker volume `auth_data` contains account and session data and must be backed up. Password recovery is currently disabled.
4. Configure the Convex production deployment with the same `AUTH_ISSUER_URL`, `AUTH_JWT_PUBLIC_JWK` from `node scripts/print-auth-jwk.mjs .env`, `HIKNOW_API_KEY`, `SOCIALAPI_API_KEY`, `X_API_CLIENT_ID`, `X_API_CLIENT_SECRET`, `X_API_BEARER_TOKEN`, `X_CONSUMER_SECRET`, `X_TOKEN_ENCRYPTION_KEY`, and `PROSPECTING_AUTO_RESCHEDULE=0`. See `README.md` for what each one does. `HIKNOW_BASE_URL` is optional. Do not expose backend keys as `NEXT_PUBLIC_*` variables.
5. Set `CONVEX_DEPLOY_KEY` in a secure shell/CI environment for the production deployment and run `pnpm exec convex deploy` there (Node.js 24 and pnpm 11 are needed only on that backend deployment machine). Verify the resulting Convex URL matches `.env` and `https://CONVEX-SITE/auth/jwks` returns the public key.
6. On the Docker server run `docker compose -f compose.yaml -f compose.production.yaml up --build -d`. Check `docker compose -f compose.yaml -f compose.production.yaml ps` and open `https://HOSTNAME`. Caddy obtains the TLS certificate automatically.

The frontend and authentication run in a Docker container; Convex is a managed external backend. `APP_BIND_IP=127.0.0.1` keeps the app's port on server loopback while Caddy exposes HTTPS on 443. For a direct server-port deployment, omit the Caddy overlay, set `APP_PORT` and `APP_BIND_IP=0.0.0.0` in `.env`, then run `docker compose up --build -d`. Use HTTPS for public login. Keep Docker `NEXT_PUBLIC_SITE_URL` aligned with the browser URL and `AUTH_ISSUER_URL` aligned with Convex's HTTP actions URL.

## Acceptance check after first sign-in

Sign up with name, email, and password, sign out, and sign back in. Verify that password-reset pages and endpoints are unavailable. The first account bootstrap should grant a complimentary base tester plan. Complete onboarding, connect X if the workflow asks for it, run a small Twitter discovery query, and verify that a returned post appears in the workspace with its author, timestamp and X link. Check usage limits, refresh the page to confirm persistence, and capture desktop/mobile screenshots of the dashboard, onboarding, discovery results, post detail, connected accounts, plans/usage, and settings. Browser authentication and workspace storage still need production verification.

## Evidence already gathered

- Production frontend build, TypeScript check, focused SocialAPI/plan tests (19), and Docker Compose configuration check passed.
- Live SocialAPI.tech search through Convex returned 20 normalized posts; user-post search returned 5; profile lookup succeeded. Sampled search posts had post IDs, text, author IDs/handles and timestamps.
- A thread lookup for one standalone post returned an empty successful result; thread rendering is not claimed as verified.
- No screenshots or videos were captured in the cloud workspace: its Chromium process could not render a screenshot.
