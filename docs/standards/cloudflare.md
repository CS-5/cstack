# Cloudflare Standard

99% of web projects deploy to Cloudflare, targeting the free tier whenever practical. Follow Cloudflare's first-party toolchain and runtime primitives directly.

## Configuration & CLI: `cf` CLI + `cloudflare.config.ts`

- **Use Cloudflare's `cf` CLI** and typed `cloudflare.config.ts` (`import { bindings, defineConfig, exports } from "cf/config"`) instead of `wrangler.jsonc` / `wrangler.toml`.
- **Pin `cf` and `@cloudflare/vite-plugin` together** when on beta/RC releases so build and deploy stay compatible.
- **Workers Static Assets everywhere.** Serve SPAs and static sites from Workers Static Assets (`assets: { notFoundHandling: "single-page-application", runWorkerFirst: true }` for apps with API/auth gates) instead of legacy Cloudflare Pages unless an existing project is already deployed on Pages.
- **Generate binding types:** Run `cf workers types` as the first step of `typecheck`. Never hand-edit `.cloudflare/types/`.
- **Wrangler gap commands only via `bunx`/`pnpm dlx`:** While `cf` lacks a specific operational command (e.g., setting a single secret or tailing logs), invoke `wrangler` on demand rather than keeping it as a project dependency.

## Runtime & Bindings

- **First-party storage first:**
  - Relational data: **D1** (with Drizzle ORM + generated SQL migrations).
  - Real-time coordination / WebSocket fan-out / stateful actors: **Durable Objects** with SQLite storage (`exports.durableObject({ storage: "sqlite" })`, accessed via `exports` from `cloudflare:workers`).
  - Blobs/assets: **R2**; ephemeral key-value/cache: **KV**; async background work: **Queues**; rate limiting: **Workers Rate Limiting** bindings.
- **Workerd parity in dev:** Always develop web apps through Vite + `@cloudflare/vite-plugin` so local dev runs inside `workerd` with local D1/KV/DO/R2 state (`.cloudflare/state`). Never use Bun-specific runtime APIs in Worker code.
- **Static assets vs. Worker routing:** When the Worker enforces host allowlists, security headers, or auth on the app shell, set `runWorkerFirst: true` and disable `workersDev` and `previewUrls` on private/custom-domain apps.

## Free-Tier Discipline

- **Single Worker per app** when practical: serve the SPA assets, Hono `/api/*`, and any `/mcp` endpoint from one Worker to stay simple and within free limits.
- **Avoid unnecessary SSR or per-request compute:** Render client SPAs or static Astro HTML; let Cloudflare cache static assets at the edge.
- **Bound D1 queries and Durable Object wakes:** Keep queries indexed and batched; avoid chatty polling loops or waking Durable Objects unnecessarily (use hibernation APIs for WebSockets).
- **Rate-limit public/unauthenticated endpoints** using Workers Rate Limiting bindings and/or free-tier WAF rules so abuse fails before hitting D1.

## Auth & Security Defaults

- **Fail closed.** Unconfigured auth settings return `503` (never silently allow requests). Unknown hostnames return `404` before routing.
- **Cloudflare Access** is the default for personal/internal apps: verify `Cf-Access-Jwt-Assertion` inside the Worker (e.g., with `jose`, checking RS256 signature, issuer, audience, and expiry)—do not trust headers blindly.
- **Local dev auth:** Supply local secrets via git-ignored `.dev.vars` (committed `.dev.vars.example` documents every variable). Development-only bindings live exclusively in the `development` branch of `cloudflare.config.ts`.
- **Never log secrets, tokens, cookies, request bodies, or raw DB error messages** (ORM error messages can include bound query parameters).

## Agent Deployment Boundary

*Enforced by `.claude/settings.json` deny list and `AGENTS.md`.*

Agents **never** run commands that reach live Cloudflare infrastructure: no `cf deploy`, `db:migrate:remote`, `wrangler`, or setting secrets. Production deploys run via Cloudflare Workers Builds (Git integration on `main`) or explicitly by the owner.
