---
name: cstack-audit
description: Audit an existing repository against cstack standards—checking tooling, strict linting, release-age gates, agent hooks, architectural boundaries, and pruning low-signal tests using Break It to Prove It.
---

# cstack-audit

Compare an existing repository against current `cstack` standards and produce a concrete, prioritized drift report (and optionally apply approved fixes).

## Locating `cstack`

Resolve the real directory containing this `SKILL.md` file: `../../docs/` and `../../configs/` hold the canonical standards and templates. If running without a local checkout, read from the `cstack` GitHub repo via `gh api` without cloning.

## Audit Checklist

Identify the repo's archetype (`web-spa`, `web-static`, `ts-service`, `go-app`, or hybrid monorepo), load only the relevant `cstack` docs/configs, and inspect these areas:

1. **Tooling & Supply Chain (`docs/standards/tooling.md`)**
   - `mise.toml` + committed `mise.lock`, `minimum_release_age = "7d"`, `idiomatic_version_file_enable_tools = []`.
   - Standard task contract (`check`, `fix`, `fmt`, `lint`, `typecheck`, `test`, `dev`, `build`, `hooks:install`).
   - Package manager 7-day age gate (`bunfig.toml` or `pnpm-workspace.yaml`) with no unapproved exemptions.
   - `hk.pkl` exists with `fail_fast = false` and explicit `effect` fields on custom steps.

2. **Linting, Formatting & Type Safety (`docs/standards/linting.md`)**
   - TypeScript: strict `tsconfig.base.json` flags intact; `tsrs` (or documented Astro TS 6 carve-out); hybrid Oxlint (`@cloudflare/oxlint-config` + `@interfere/landmines` + vendored `anti-slop` gap rules with `UPSTREAM.md`); `--deny-warnings --report-unused-disable-directives`; `@oxlint/plugins` version matches `oxlint`.
   - Go: `golangci-lint` v2 owning `gofumpt` + `goimports`, `max-same-issues: 0`, `max-issues-per-linter: 0`, strict `nolintlint`, `depguard` modern stdlib rules.
   - Check for unjustified lint disables, bare type assertions without `// SAFETY:`, or dead code (`knip`).

3. **Cloudflare & Architecture (`docs/standards/cloudflare.md`, `docs/principles.md`)**
   - `cf` CLI + `cloudflare.config.ts` (flag legacy Wrangler configs if migration makes sense).
   - Clear module boundaries (routes/tools thin, logic in services, client isolated from server/DB).
   - Comment discipline: flag narration comments, stale censuses, and meta-commentary.

4. **Testing Charter & "Break It to Prove It" (`docs/standards/testing.md`)**
   - Audit existing test files for banned patterns: DOM/UI interaction tests, snapshots, mock-mirroring tests, type/routing tautologies, or glue tests.
   - Apply **Break It to Prove It**: *"If I invert the core condition or delete the security check, does this test fail?"*
   - Actively recommend **deleting** low-signal or redundant tests, and flag genuine untested high-value zones (auth, permissions, tricky pure logic).

5. **Agent Ergonomics (`docs/standards/agents.md`)**
   - Single-source `AGENTS.md` with `CLAUDE.md` containing only `@AGENTS.md` (no duplicate instructions).
   - `.claude/settings.json` (`Stop` hook + safety `deny` rules for deploy/push/remote migrations) and `.codex/hooks.json`.

## Output Format

Report findings grouped by severity:
- **High-value fixes** (missing gates, broken boundaries, security/supply-chain gaps, bloated low-signal tests to delete)
- **Moderate drift** (config/task contract mismatches, outdated vendored `anti-slop` rules)
- **Acceptable intentional deviations** (note why they should stay)

Ask before making sweeping refactors or deleting tests unless the user explicitly asked you to apply fixes immediately.
