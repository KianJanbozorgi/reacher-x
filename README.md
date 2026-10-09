# ReacherX private Twitter discovery

This instance finds opportunities from public X/Twitter posts for authorized testers. Authentication uses WorkOS; data, jobs, and usage limits live in Convex. There is no LinkedIn, billing checkout, or demo app.

## Start locally with Docker

Use Node.js 24 and pnpm 11 for local tools. Create a Convex deployment and a WorkOS application, then copy `.env.example` to `.env.local` and fill the Next.js values. The WorkOS callback must match `NEXT_PUBLIC_WORKOS_REDIRECT_URI`, and `NEXT_PUBLIC_SITE_URL` must be the public URL serving this application. Keep `.env.local` private.

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

Run `pnpm install --frozen-lockfile`, then `pnpm exec convex dev --once` with deployment access configured. The Convex deployment requires the backend variables above; `.env.local` does not configure it. Build with `pnpm build` before creating the runtime Docker image. The production frontend runs in Docker while Convex remains a managed external service:

```sh
docker compose --env-file .env.local up --build -d
```

In this cloud workspace, set `DOCKER_CONFIG=/workspace/.docker` for Docker commands because the default home directory is read-only.

Visit `http://localhost:3000`; WorkOS redirects unauthenticated users to sign in. The email in `PRIVATE_ALLOWED_EMAILS` receives a base complimentary tester grant when its account is first created. For an existing user, grant access from an authorized Convex CLI session with `pnpm exec convex run testerPlans:grantTesterPlanByEmail '{"email":"user@example.com","tier":"base","durationDays":30}'`. This retains the plan's workspace and prospect usage limits. No Polar variables or checkout are needed.

## Provider contract

[SocialAPI.tech documentation](https://socialapi.tech/docs) specifies `https://socialapi.tech/v1`, `X-API-Key`, and `{status, data, meta}`. Search uses `/search/advanced?query=...&product=Latest&limit=20`. Profile, timeline, thread, and relationship reads use the documented `/user/*` and `/tweet/thread` paths. Search has no documented cursor, so each query fetches one page. The old SocialAPI.me similar-profile lookup, webhook monitors, extended bio, and retweet/comment verification have no documented direct equivalents and are disabled. The app does not use SocialAPI.tech's WebSocket stream.

The backend key is read only from Convex's `SOCIALAPI_API_KEY`. If Twitter search is empty, check that binding and the provider's remaining credits on its account page before changing discovery settings.

## Checks

Run `pnpm exec tsc --noEmit`, `pnpm lint`, and `pnpm test:convex`. A live discovery check needs a valid SocialAPI.tech key on Convex and an authorized WorkOS session. Confirm that a returned post appears in the workspace feed after onboarding, with its X URL and author intact.

This repository is licensed under AGPL-3.0-only; see `LICENSE`.
