# ReacherX private Twitter discovery

This instance finds opportunities from public X/Twitter posts for authorized testers. Authentication uses WorkOS; data, jobs, and usage limits live in Convex. There is no LinkedIn, billing checkout, or demo app.

The interface uses RTL layout and a locally bundled [Vazirmatn](https://github.com/rastikerdar/vazirmatn) variable font. Its SIL Open Font License is stored alongside the font in `app/assets/fonts/OFL.txt`.

## Start locally with Docker

Create a Convex deployment and a WorkOS application, then copy `.env.example` to `.env` and fill the values. Docker Compose reads `.env` automatically; it is git-ignored and must stay private. The WorkOS callback must match `NEXT_PUBLIC_WORKOS_REDIRECT_URI`, and `NEXT_PUBLIC_SITE_URL` must be the public URL serving this application. Docker builds the frontend and installs its pnpm packages inside the image; the server needs Docker Compose, not a host-side Node.js installation for the frontend.

Set these **separately on the Convex deployment** using the Convex dashboard or `pnpm exec convex env set NAME`:

| Variable | Purpose |
| --- | --- |
| `WORKOS_CLIENT_ID` | Validate WorkOS JWTs; must match Next.js |
| `PRIVATE_ALLOWED_EMAILS` | Comma-separated email allowlist; must match Next.js |
| `HIKNOW_API_KEY` | Backend AI chat and embeddings |
| `SOCIALAPI_API_KEY` | Backend public Twitter reads on SocialAPI.tech |
| `X_API_CLIENT_ID`, `X_API_CLIENT_SECRET` | X account OAuth |
| `X_API_BEARER_TOKEN`, `X_CONSUMER_SECRET`, `X_TOKEN_ENCRYPTION_KEY` | X features and token encryption, where used |
| `PROSPECTING_AUTO_RESCHEDULE` | Set to `0` until search and quotas are validated |

The Hiknow base defaults to `https://hiknow.ir/v1`; set `HIKNOW_BASE_URL` on Convex only if the provider moves. Chat uses `hiknow-flash-lite`, and embeddings use `hiknow-embedding-small` (1536 dimensions). Changing the embedding model requires rebuilding existing RAG namespaces because vector dimensions must match.

Deploy the Convex backend separately using its production deploy key (`pnpm exec convex deploy` from a machine with Node.js 24 and pnpm 11, or CI). The backend variables above must be configured on Convex; `.env` does not configure it. Once Convex is ready, build and start the frontend on any Docker server with one command:

```sh
docker compose up --build -d
```

In this cloud workspace, set `DOCKER_CONFIG=/workspace/.docker` for Docker commands because the default home directory is read-only.

The base Compose file publishes `${APP_PORT:-3000}` on `${APP_BIND_IP:-0.0.0.0}`. Set `APP_PORT` in `.env` to choose the server port, and set `NEXT_PUBLIC_SITE_URL` plus the WorkOS callback to the externally reachable URL **before** building. Visit that URL; WorkOS redirects unauthenticated users to sign in. The email in `PRIVATE_ALLOWED_EMAILS` receives a base complimentary tester grant when its account is first created. For an existing user, grant access from an authorized Convex CLI session with `pnpm exec convex run testerPlans:grantTesterPlanByEmail '{"email":"user@example.com","tier":"base","durationDays":30}'`. This retains the plan's workspace and prospect usage limits. No Polar variables or checkout are needed.

`localhost` is the machine running Docker. For a cloud Docker host, use its forwarded or public HTTPS URL in the browser, set `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_WORKOS_REDIRECT_URI` to that URL, register the redirect URI in WorkOS, then rebuild the frontend image. The container alone does not expose a cloud workspace to another computer.

For a public Docker server with automatic HTTPS, point a hostname at the server, allow ports 80 and 443, and set `APP_DOMAIN` to that hostname. Set `APP_BIND_IP=127.0.0.1`, `NEXT_PUBLIC_SITE_URL=https://HOSTNAME`, and `NEXT_PUBLIC_WORKOS_REDIRECT_URI=https://HOSTNAME/callback` in `.env`. Then run `docker compose -f compose.yaml -f compose.production.yaml up --build -d`. Caddy obtains and renews the HTTPS certificate. Register the same callback URI in WorkOS. For direct access on a server port, use only `docker compose up --build -d`; WorkOS must accept the matching public redirect URL, so HTTPS with Caddy is the recommended internet-facing setup.

## Provider contract

[SocialAPI.tech documentation](https://socialapi.tech/docs) specifies `https://socialapi.tech/v1`, `X-API-Key`, and `{status, data, meta}`. Search uses `/search/advanced?query=...&product=Latest&limit=20`. Profile, timeline, thread, and relationship reads use the documented `/user/*` and `/tweet/thread` paths. Search has no documented cursor, so each query fetches one page. The old SocialAPI.me similar-profile lookup, webhook monitors, extended bio, and retweet/comment verification have no documented direct equivalents and are disabled. The app does not use SocialAPI.tech's WebSocket stream.

The backend key is read only from Convex's `SOCIALAPI_API_KEY`. If Twitter search is empty, check that binding and the provider's remaining credits on its account page before changing discovery settings.

## Checks

Run `pnpm exec tsc --noEmit`, `pnpm lint`, and `pnpm test:convex`. A live discovery check needs a valid SocialAPI.tech key on Convex and an authorized WorkOS session. Confirm that a returned post appears in the workspace feed after onboarding, with its X URL and author intact.

This repository is licensed under AGPL-3.0-only; see `LICENSE`.
