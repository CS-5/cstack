# cstack

> [!NOTE]
> `cstack` is a work in progress and not final. Standards, configs, and skills here are actively evolving and subject to change.

## Approach

Rather than maintaining boilerplate templates that quickly rot, `cstack` documents what I build with and why, paired with canonical configs and agent skills so AI tools can spin up or audit projects cleanly. I prefer native binaries (`mise`, `hk`, `oxlint`, `oxfmt`, `tsrs`, `bun`, `golangci-lint`), strict type safety, and a 7-day dependency age gate so feedback stays fast and rules are enforced mechanically. Most web projects are React SPAs (Vite, TanStack, Tailwind, Hono) or static Astro sites deployed on Cloudflare using its native primitives, with Go or Bun for CLIs and hosted services. Code should stay well organized without needless abstraction, comments should explain why instead of restating code, and tests should earn their place by guarding tricky logic or security boundaries rather than chasing coverage.

## Architecture (3 Layers)

1. **Specs & Decisions (`docs/`):** Modular documents recording *what* is chosen, *why*, *how it is enforced*, and *when to break the rule*. Agents load only the standards and archetype that apply.
2. **Canonical Config Primitives (`configs/`):** Ready-to-copy executable truth (`oxlint.config.ts`, `tsconfig.base.json`, `.golangci.yml`, `mise.base.toml`, `hk.base.pkl`, agent hook templates, and vendored `anti-slop` gap rules).
3. **Cross-Agent Skills (`skills/`):** Standard `SKILL.md` workflows usable across Antigravity, Claude Code, and Codex with no custom CLI or npm package.

## Quick Index

### Core & Standards
- [docs/principles.md](docs/principles.md): Core philosophy, code style, comment discipline, git workflow, and dependency policy.
- [docs/standards/tooling.md](docs/standards/tooling.md): `mise`, `hk`, Bun (default) vs. pnpm, Vite, `tsrs`, `knip`, and the 7-day release age gate.
- [docs/standards/linting.md](docs/standards/linting.md): Strict TypeScript, Oxlint hybrid stack, Oxfmt, and `golangci-lint` v2.
- [docs/standards/cloudflare.md](docs/standards/cloudflare.md): `cf` CLI, `cloudflare.config.ts`, first-party bindings, Workers Static Assets, and free-tier discipline.
- [docs/standards/testing.md](docs/standards/testing.md): The Testing Charter: high-signal tests only, mechanical anti-bloat rules, and *Break It to Prove It*.
- [docs/standards/agents.md](docs/standards/agents.md): Single-source `AGENTS.md`, `@AGENTS.md` `CLAUDE.md` shim, `hk` stop hooks, safety deny lists, and skill installation.

### Archetypes
- [docs/archetypes/web-spa.md](docs/archetypes/web-spa.md): Vite + React 19 (Compiler) + Tailwind v4 + shadcn/Base UI + TanStack + Hono + Cloudflare Workers + Valibot + Drizzle.
- [docs/archetypes/web-static.md](docs/archetypes/web-static.md): Static Astro + Tailwind v4 on Cloudflare (with TS 6 + ESLint/Prettier carve-out).
- [docs/archetypes/ts-service.md](docs/archetypes/ts-service.md): Bun CLI or Docker/self-hosted Hono + Drizzle (SQLite/PostgreSQL).
- [docs/archetypes/go-app.md](docs/archetypes/go-app.md): Go stdlib-first CLIs and services with Zap, Goose, `go-sqlbuilder`, and `golangci-lint` v2.

### Skills
- [skills/cstack-init/SKILL.md](skills/cstack-init/SKILL.md): Interview and scaffold a new project from `cstack`.
- [skills/cstack-audit/SKILL.md](skills/cstack-audit/SKILL.md): Audit an existing repo for drift and low-signal tests.
- [skills/cstack-refresh/SKILL.md](skills/cstack-refresh/SKILL.md): Check upstream tooling/rules and propose updates to `cstack`.
- [skills/cstack-retro/SKILL.md](skills/cstack-retro/SKILL.md): Harvest real-world lessons from a project back into `cstack`.

## Installing Skills Locally

Link all `cstack` skills into your global agent skill directories (Antigravity, Claude Code, Codex):

```bash
mise run install:skills
```

To use `cstack` in a new empty folder, invoke `cstack-init` from any agent. To check an existing repo against current standards, invoke `cstack-audit`.
