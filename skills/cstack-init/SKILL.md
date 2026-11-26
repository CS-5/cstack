---
name: cstack-init
description: Interview the user on a new project, choose the matching cstack archetype, and scaffold the project with canonical configs, mise/hk tasks, strict linting, and cross-agent rules.
---

# cstack-init

Initialize a new project following `cstack` standards rather than static boilerplate.

## Locating `cstack`

Resolve the real directory containing this `SKILL.md` file: `../../docs/` and `../../configs/` are the local `cstack` specs and config templates. If running in a remote session without the local `cstack` checkout, fetch the needed files read-only via `gh api` without cloning.

## Workflow

1. **Short Discovery Interview** (skip anything the user already specified):
   - Project name and one-sentence purpose.
   - Archetype:
     - `web-spa` — interactive SPA + Cloudflare Worker API (`docs/archetypes/web-spa.md`)
     - `web-static` — static Astro site on Cloudflare (`docs/archetypes/web-static.md`)
     - `ts-service` — Bun CLI or self-hosted/Docker Hono service (`docs/archetypes/ts-service.md`)
     - `go-app` — Go CLI, TUI, or service (`docs/archetypes/go-app.md`)
   - Data/auth needs (e.g., D1 + Drizzle, Durable Objects, PostgreSQL/SQLite, Cloudflare Access, none).
   - Package manager confirmation for TS projects: default **Bun** (`bunfig.toml`), or **pnpm** (`pnpm-workspace.yaml`) if Cloudflare Workers Builds or an ecosystem tool prefers it.
   - For `go-app` with HTTP: confirm HTTP router choice (`net/http`, Fiber, or other).

2. **Load Only Relevant Specs**
   - Always read `docs/principles.md`, `docs/standards/tooling.md`, `docs/standards/linting.md`, `docs/standards/testing.md`, and `docs/standards/agents.md`.
   - Load `docs/standards/cloudflare.md` if deploying to Cloudflare.
   - Load the single matching file under `docs/archetypes/`.

3. **Scaffold From Canonical Configs**
   - Copy and tailor `configs/mise/mise.base.toml` → `mise.toml` (pin concrete tool versions, keep `minimum_release_age = "7d"` and `idiomatic_version_file_enable_tools = []`).
   - Copy and tailor `configs/mise/hk.base.pkl` → `hk.pkl` (keep `fail_fast = false` and explicit `effect` on custom steps).
   - For TypeScript (`web-spa` / `ts-service`):
     - Copy `configs/typescript/tsconfig.base.json`, `oxfmt.json` → `.oxfmtrc.json`, `oxlint.config.ts` (trimming UI plugins if `ts-service`), `bunfig.toml` (or `pnpm-workspace.yaml`), and `configs/typescript/anti-slop/` → `tools/oxlint/anti-slop/`.
     - Pin `@oxlint/plugins` to the exact same version as `oxlint`.
     - Prefer Valibot for schema validation (or Zod if a required library expects it).
   - For Go (`go-app`):
     - Copy `configs/go/.golangci.yml` → `.golangci.yml`, configure `hk.pkl` with `Builtins.golangci_lint_fmt`, `Builtins.golangci_lint`, `Builtins.gomod_tidy`, and `golangci-lint config verify`.
   - Set up agent ergonomics:
     - Tailor `configs/agents/AGENTS.template.md` → `AGENTS.md` and copy `configs/agents/CLAUDE.md` → `CLAUDE.md` (containing only `@AGENTS.md`).
     - Create `CODING_STANDARDS.md` naming each rule's enforcer and summarizing the project's boundaries, comment discipline, and Testing Charter.
     - Copy `configs/agents/claude-settings.json` → `.claude/settings.json` and `configs/agents/codex-hooks.json` → `.codex/hooks.json`.

4. **Verify Before Finishing**
   - Install dependencies honoring the 7-day release-age gate (never add exceptions without asking the user first).
   - Run `mise trust && mise install` (if available locally) and `mise run check` so the fresh scaffold passes typecheck, lint, format, and hooks on commit 1.
   - Do not write placeholder tests—leave the test suite empty until real high-value logic exists.
