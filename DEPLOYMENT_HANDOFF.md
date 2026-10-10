# Deployment handoff — private Twitter discovery

Code: `KianJanbozorgi/reacher-x`, branch `codex/twitter-private-hiknow`, commit `79c95d52` or newer. Review this branch before merging. No credential file is committed.

## What the owner provides privately

- A domain/hostname under their control and DNS access to point it to the Docker server.
- WorkOS application access (or its client ID and API key), plus permission to register `https://HOSTNAME/callback` as a redirect URI.
- A Convex **production** deployment and its deploy key, delivered through a secret manager or secure server environment. The cloud-workspace Convex deployment used during development is a development deployment; it is not the production database.
- Hiknow, SocialAPI.tech and X credentials through a secret manager, not in Git or email. Set the provider credentials on the Convex deployment.
- Authorized email allowlist, initially `kian84.c16@gmail.com`.

## Supervisor: provision and deploy

1. Install Docker with Compose on the server. Point `HOSTNAME` at the server and allow inbound TCP 80/443. Docker installs pnpm dependencies and builds Next.js inside the image; the frontend needs no host-side Node.js or build artifacts.
2. Clone the repository and switch to `codex/twitter-private-hiknow`.
3. Create git-ignored `.env` from `.env.example` on the server. Set `APP_DOMAIN=HOSTNAME`, `APP_BIND_IP=127.0.0.1`, `NEXT_PUBLIC_SITE_URL=https://HOSTNAME`, `NEXT_PUBLIC_WORKOS_REDIRECT_URI=https://HOSTNAME/callback`, `NEXT_PUBLIC_CONVEX_URL` to the **production** Convex URL, the WorkOS client ID/API key/cookie password, and `PRIVATE_ALLOWED_EMAILS=kian84.c16@gmail.com`. Keep `.env` private. Register the identical callback URI in WorkOS.
4. Configure the Convex production deployment with `WORKOS_CLIENT_ID`, `PRIVATE_ALLOWED_EMAILS`, `HIKNOW_API_KEY`, `SOCIALAPI_API_KEY`, `X_API_CLIENT_ID`, `X_API_CLIENT_SECRET`, `X_API_BEARER_TOKEN`, `X_CONSUMER_SECRET`, `X_TOKEN_ENCRYPTION_KEY`, and `PROSPECTING_AUTO_RESCHEDULE=0`. See `README.md` for what each one does. `HIKNOW_BASE_URL` is optional. Do not expose backend keys as `NEXT_PUBLIC_*` variables.
5. Set `CONVEX_DEPLOY_KEY` in a secure shell/CI environment for the production deployment and run `pnpm exec convex deploy` there (Node.js 24 and pnpm 11 are needed only on that backend deployment machine). Verify the resulting Convex URL matches `.env`.
6. On the Docker server run `docker compose -f compose.yaml -f compose.production.yaml up --build -d`. Check `docker compose -f compose.yaml -f compose.production.yaml ps` and open `https://HOSTNAME`. Caddy obtains the TLS certificate automatically.

The frontend is a Docker container; Convex is a managed external backend. `APP_BIND_IP=127.0.0.1` keeps the app's port on server loopback while Caddy exposes HTTPS on 443. For a direct server-port deployment, omit the Caddy overlay, set `APP_PORT` and `APP_BIND_IP=0.0.0.0` in `.env`, then run `docker compose up --build -d`. WorkOS must allow the resulting public callback URL; HTTPS is recommended. Keep DNS, firewall, Docker and WorkOS callback aligned on the same address.

## Acceptance check after first sign-in

Sign in as an allowlisted user. The first account bootstrap should grant a complimentary base tester plan. Complete onboarding, connect X if the workflow asks for it, run a small Twitter discovery query, and verify that a returned post appears in the workspace with its author, timestamp and X link. Check usage limits, refresh the page to confirm persistence, and capture desktop/mobile screenshots of the dashboard, onboarding, discovery results, post detail, connected accounts, plans/usage, and settings. Browser authentication and workspace storage have not been verified in the cloud workspace because there is no signed-in workspace there.

## Evidence already gathered

- Production frontend build, TypeScript check, focused SocialAPI/plan tests (19), and Docker Compose configuration check passed.
- Live SocialAPI.tech search through Convex returned 20 normalized posts; user-post search returned 5; profile lookup succeeded. Sampled search posts had post IDs, text, author IDs/handles and timestamps.
- A thread lookup for one standalone post returned an empty successful result; thread rendering is not claimed as verified.
- No screenshots or videos were captured in the cloud workspace: its Chromium process could not render a screenshot, and app pages require WorkOS sign-in.
