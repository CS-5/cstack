---
name: cstack-refresh
description: Routine workflow to check upstream tooling, linter presets, Cloudflare CLI, tsrs, and vendored anti-slop rules for changes, then propose targeted updates to cstack.
---

# cstack-refresh

Keep `cstack` current as native tooling, Cloudflare primitives, and lint presets evolve. Designed to run periodically on demand or on a schedule.

## Scope to Check

Read the current state of `cstack` first (`docs/standards/`, `configs/`, and `configs/typescript/anti-slop/UPSTREAM.md`), then check upstream releases and commits using web search or `gh api` (without cloning external repos):

1. **Vendored `anti-slop` & Oxlint Presets**
   - Compare `configs/typescript/anti-slop/UPSTREAM.md`'s recorded commit SHA against `dmmulroy/anti-slop`'s latest default branch.
   - Check `@cloudflare/oxlint-config`, `@nkzw/oxlint-config`, and `@interfere/landmines` for:
     - New rules worth adopting.
     - Any of our 4 vendored `anti-slop` gap rules that upstream has absorbed (if absorbed, propose deleting the vendored duplicate).
     - Breaking config/API changes in `oxlint` or `oxfmt`.

2. **Native Compilers & Astro Carve-Out**
   - Check `tsrs` (Cloudflare's Rust TypeScript compiler) and TypeScript 7 (`tsgo`) progress, flags, and stability.
   - Check whether `@astrojs/check` (Volar) supports TypeScript 7 and whether `oxlint` supports `.astro` templates—if either lands, propose retiring the carve-out in `docs/archetypes/web-static.md`.

3. **Cloudflare Platform (`cf` CLI & Vite Plugin)**
   - Check `cf` CLI and `@cloudflare/vite-plugin` releases (e.g., whether `cf` gained secret management, log tailing, or new `cloudflare.config.ts` primitives so Wrangler fallback notes can shrink).

4. **Mise, `hk`, Bun, & Go Tooling**
   - Check `mise`, `hk` (new builtins, `hk agent stop-hook` flags, `Config.pkl` release URL in `configs/mise/hk.base.pkl`), and `bun` (`bunfig.toml` release-age syntax).
   - Check `golangci-lint` v2 releases for newly added or deprecated linters in `configs/go/.golangci.yml`.

## Proposal Rules

- **Respect the 7-day release-age philosophy:** Note release dates; call out anything newer than 7 days or pre-v1 clearly.
- **Keep docs and configs in lockstep:** Every proposed change must list both the `docs/` section and the `configs/` file(s) to update.
- **Summarize before editing (or open a focused PR/diff):** Present a concise table of `(Tool/Preset | Current in cstack | Upstream Change | Recommended Action)` so changes are trivial to review and approve.
- Update `configs/typescript/anti-slop/UPSTREAM.md` whenever vendored rules are synced or pruned.
