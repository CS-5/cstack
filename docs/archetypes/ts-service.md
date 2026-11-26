# Archetype: TypeScript CLI / Self-Hosted Service (`ts-service`)

Use this archetype for TypeScript CLIs (when Go is not chosen) or self-hosted / Dockerized backend services running on the Bun runtime.

## Stack

| Concern | Default Choice | Notes |
| --- | --- | --- |
| Runtime & Package Manager | Bun | Single binary runtime, fast startup, `bunfig.toml` 7-day age gate |
| HTTP Server (if service) | Hono | Same router/middleware ergonomics as Cloudflare Workers |
| Database (if stateful) | Drizzle ORM over SQLite (`bun:sqlite` or `better-sqlite3`) or PostgreSQL | Generated SQL migrations; real local DB in persistence tests |
| Validation | Valibot (default) or Zod | Parse env vars, CLI args, HTTP inputs, and external APIs at the boundary |
| Typecheck, Lint, Format | `tsrs -b`, `oxlint` (hybrid), `oxfmt` | Same strict `tsconfig.base.json` and `hk.pkl` contract |
| Testing | `bun test` | Pure logic, security boundaries, and real in-memory/local DB semantics only |
| Containerization (if service) | Multi-stage slim `oven/bun` Dockerfile | Pin base image, non-root user, explicit `SIGTERM` graceful shutdown |

## Directory Structure

```text
├── mise.toml + mise.lock
├── hk.pkl
├── bunfig.toml
├── oxlint.config.ts
├── .oxfmtrc.json
├── tsconfig.base.json + tsconfig.json
├── AGENTS.md + CLAUDE.md       # CLAUDE.md contains only @AGENTS.md
├── CODING_STANDARDS.md
├── tools/oxlint/anti-slop/     # Vendored 4 gap rules + UPSTREAM.md
├── migrations/                 # Drizzle SQL migrations (if stateful)
└── src/
    ├── index.ts                # CLI entrypoint or server bootstrap (explicit lifecycle)
    ├── config.ts               # Single validated config/env schema
    ├── platform/               # Cross-domain infra (db, http helpers, logging)
    └── <domain>/               # Focused domain modules (service.ts, routes.ts)
```

## Architectural Rules

- **Explicit lifecycle and graceful shutdown.** Bootstrap code owns every background timer, worker, and server listener. Constructors and module top-level code never start background loops; `SIGINT`/`SIGTERM` drains active work cleanly.
- **Single validated config module.** Read `process.env` only in `src/config.ts`, parse with Valibot/Zod at startup, and pass typed config downward. Fail fast on missing required configuration.
- **Isolate Bun-specific APIs.** Keep `bun:sqlite` or `Bun.*` calls confined to `src/platform/` so domain logic stays pure TypeScript and portable (including across `node:worker_threads` if used).
- **Same Oxlint & Testing Charter.** Copy [configs/typescript/oxlint.config.ts](../../configs/typescript/oxlint.config.ts), remove the React/TanStack/shadcn sections, and keep `@cloudflare/oxlint-config` (or trim Cloudflare-only env flags if unused), `@interfere/landmines`, and vendored `anti-slop`.
- **Keep CLI/service binaries focused.** If a CLI needs zero-dependency cross-platform distribution or heavy concurrency, consider [go-app.md](go-app.md) instead.
