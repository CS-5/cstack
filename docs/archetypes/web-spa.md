# Archetype: Web SPA (`web-spa`)

Use this archetype for interactive web applications—dashboards, tools, household/team apps, and CRUD workflows. Almost all interactive web projects are client-rendered SPAs backed by a Cloudflare Worker API (no SSR).

## Stack

| Concern | Default Choice | Notes |
| --- | --- | --- |
| Build & Dev | Vite + `@cloudflare/vite-plugin` | Local dev runs on `workerd` with local D1/DO/KV state |
| UI Framework | React 19 + React Compiler (`oxc-transform-react`) | Manual `useMemo`/`useCallback`/`memo` banned via `oxlint` |
| Routing | TanStack Router (file-based) | Commit generated `routeTree.gen.ts`; never hand-edit |
| Client Data | TanStack Query (`queryOptions`) + TanStack DB (when offline/optimistic collections earn it) | Prefer TanStack libraries over alternatives |
| Styling & UI | Tailwind CSS v4 + shadcn/ui + Base UI | Token-driven styling; keep visual rules in `DESIGN.md`; enforce with `@shadcn/lint` |
| Backend API | Hono on Cloudflare Workers | Single Worker serving SPA static assets + `/api/*` (+ `/mcp` when needed) |
| Validation | Valibot (default) or Zod (when an integration requires it) | Shared schemas in `src/shared/`; parse at every I/O boundary |
| Database | Cloudflare D1 + Drizzle ORM | Generated SQL migrations in `migrations/`; Durable Objects (SQLite) for real-time fan-out |
| Deploy / Infra | Cloudflare `cf` CLI + `cloudflare.config.ts` | Workers Static Assets (`single-page-application`); `runWorkerFirst: true` when Worker enforces auth/headers |
| Tooling | `mise`, `hk`, Bun (or `pnpm` for Workers Builds), `tsrs -b`, `oxlint`, `oxfmt`, Vitest | `knip` for dead-code checks in multi-module apps |

## Directory Structure

```text
├── cloudflare.config.ts        # Worker bindings, domains, assets, DO exports
├── drizzle.config.ts           # Drizzle Kit pointing at src/worker/db/schema.ts
├── mise.toml + mise.lock
├── hk.pkl
├── bunfig.toml                 # (or pnpm-workspace.yaml) 7-day release-age gate
├── oxlint.config.ts
├── .oxfmtrc.json
├── tsconfig.base.json          # + tsconfig.client.json, tsconfig.worker.json, tsconfig.tools.json
├── AGENTS.md + CLAUDE.md       # CLAUDE.md contains only @AGENTS.md
├── CODING_STANDARDS.md
├── DESIGN.md                   # Visual design tokens, layout, copy rules
├── docs/design.md              # Product & architectural decisions
├── migrations/                 # Generated Drizzle SQL migrations
├── tools/oxlint/anti-slop/     # Vendored 4 gap rules + UPSTREAM.md
└── src/
    ├── shared/                 # Schemas, domain types, pure helpers shared by client & worker
    ├── worker/
    │   ├── index.ts            # Worker entrypoint + Durable Object exports
    │   ├── app.ts              # Host gate, auth middleware, route mounting, single onError
    │   ├── http.ts             # Shared AppEnv, parseBody, respond helpers
    │   ├── result.ts           # Typed Result / Refusal helpers
    │   ├── auth/               # Credential verification & Actor construction
    │   ├── db/                 # Drizzle schema, client, audit/commit helpers
    │   └── <module>/           # service.ts, routes.ts (Hono sub-app), tools.ts (optional MCP)
    └── client/
        ├── routes/             # TanStack Router file-based routes
        ├── data/               # Query options, mutations, collections
        ├── ui/                 # Design tokens & reusable UI primitives (Base UI / shadcn)
        └── <module>/           # Feature screens & components
```

## Architectural Rules

- **Thin routes, rich services** *(enforced by `oxlint` `no-restricted-imports`)*: Routes (`src/worker/*/routes.ts`) and MCP tools (`tools.ts`) parse inputs, call `service.ts`, and format the response. They never import `drizzle-orm` or `db/schema`, and never implement permission checks that belong in the service.
- **Strict client/worker boundary** *(enforced by `oxlint` `no-restricted-imports`)*: `src/client/` never imports `src/worker/`, `drizzle-orm`, `hono`, or `cloudflare:*`. Shared schemas and pure helpers live in `src/shared/`.
- **React Compiler & effect discipline** *(enforced by `oxlint` + `eslint-plugin-react-you-might-not-need-an-effect`)*: No `useMemo`, `useCallback`, or `memo` imports. Derive state during render; respond to events in handlers; use `useEffect` only to synchronize with external systems.
- **Data fetching belongs in TanStack Query/DB** *(enforced by `@tanstack/eslint-plugin-query` + review)*: Define reusable `queryOptions` factories in `src/client/data/`; never fetch inside components.
- **Token-only styling** *(enforced by `@shadcn/lint`)*: No raw hex colors or unmapped classes; define new tokens in `DESIGN.md` and CSS before using them.

## Verification & UI Checks

- `mise run check` runs `cf workers types`, `tsrs -b`, `oxlint --deny-warnings --report-unused-disable-directives`, `oxfmt --check`, and pure-logic tests.
- Visually inspect UI changes in the running app at desktop and mobile (390px) widths, in both light and dark modes, using harness-native browser tools first or `agent-browser` when harness tooling does not apply. Do not add jsdom or component-interaction tests.

## Recommended Community Skills

Offer to install these project-scoped skills during `cstack-init` (see [docs/standards/skills.md](../standards/skills.md) and [configs/agents/apm.web.yml](../../configs/agents/apm.web.yml)):

- `cloudflare/skills`: first-party Workers, D1, Durable Objects, R2, Queues, and Agents SDK guidance.
- `pbakaus/impeccable`: design language (`DESIGN.md`), critique, polish, and accessibility audits.
- `vercel-labs/agent-skills`: React best practices and web design guidelines (ignoring Next.js/SSR rules and manual memoization).
- `vercel-labs/agent-browser`: native Rust CDP browser CLI when harness-native browser tooling is unavailable.
- `GoogleChrome/modern-web-guidance`: modern HTML/CSS/browser APIs and Baseline guidance.
- Package-bundled TanStack skills under `node_modules/@tanstack/*/skills` (documented in `AGENTS.md`).
