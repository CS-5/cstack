# Agent Rules, Hooks & Skills Standard

Projects work seamlessly across **Antigravity**, **Claude Code**, and **Codex** from a single source of truth—no duplicated rules or divergent check scripts.

## Single-Source Instructions

- **`AGENTS.md` is the canonical instruction file** at the repo root (and optionally in major sub-packages of a monorepo).
- **`CLAUDE.md` contains only `@AGENTS.md`**, using Claude Code's `@` include syntax to reference `AGENTS.md` without duplicating instructions.
- Keep `AGENTS.md` dense, scannable, and operational:
  - What the project is and its key docs (`docs/design.md`, `DESIGN.md`, `CODING_STANDARDS.md`).
  - Setup and exact `mise run` commands.
  - Definition of done (including UI checks when applicable).
  - Hard "Never" boundaries (deploying, remote migrations, generated files, adding unapproved deps).
  - Short recipes for adding a module, route, schema change, or behavior.
  - Directory map.
- Put detailed judgment calls and architectural invariants in `CODING_STANDARDS.md`, and product/system decisions in `docs/design.md` (and `DESIGN.md` for visual systems).

## Universal Verification Hooks (`mise` + `hk`)

Every harness delegates checks to the same `hk.pkl` through `mise x` (because agent hooks execute in a plain shell where `mise` may not be activated):

- **Claude Code (`.claude/settings.json`):**
  - `Stop` hook runs `mise x -- hk agent stop-hook --target claude-code --timeout 570`.
  - Optional `PostToolUse` (`Edit|Write`) hook on slower stacks (like Astro/ESLint) runs `hk fix` on the edited file.
  - Explicit `permissions.allow` for read-only and local `mise run` tasks; explicit `permissions.deny` blocking `git push`, `deploy`, `db:migrate:remote`, and live `cf`/`wrangler` commands.
- **Codex (`.codex/hooks.json`):**
  - `Stop` hook runs `cd "$(git rev-parse --show-toplevel)" && mise x -- hk agent stop-hook --target codex --timeout 570`.
- **Antigravity & hosts without repo hooks:**
  - Agents run `mise run fix` and `mise run check` before handing back work.

Template files live in [configs/agents/](../../configs/agents/).

## Cross-Agent Skills (`cstack/skills/`)

`cstack` is consumed as a **local global skill pack**—no CLI binary or npm package to install or publish.

### Installing Globally

Run `mise run install:skills` from inside `cstack`. It symlinks each `skills/<name>` directory into:
- `~/.gemini/antigravity/skills/` (Antigravity)
- `~/.claude/skills/` (Claude Code)
- `~/.codex/skills/` (Codex)

Because they are symlinks, pulling `cstack` updates every harness immediately.

### Resolving `cstack` Inside a Skill

Skills locate `cstack` docs and configs in this order:
1. Resolve the skill's own real path (`SKILL.md` lives inside `<cstack-root>/skills/<name>/SKILL.md`), so `../../docs/` and `../../configs/` are always directly readable on local machines.
2. If running in a remote or cloud environment without the local checkout, fetch the needed files from the `cstack` GitHub repository via `gh api` (read-only, without cloning).

## Project-Local Library Docs

Fast-moving libraries (such as TanStack Router, TanStack DB, and MCP SDKs) ship current docs or skills inside `node_modules/`. Note their locations in `AGENTS.md` so agents read installed docs instead of relying on stale memory.
