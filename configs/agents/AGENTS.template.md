# <Project Name>

<One-paragraph summary of what this project is, its runtime, and its deployment target.>

Read before making changes:

- [docs/design.md](docs/design.md) — product and architectural decisions. Update it when a decision changes.
- [CODING_STANDARDS.md](CODING_STANDARDS.md) — code conventions and architectural boundaries.
- [DESIGN.md](DESIGN.md) — visual design language and tokens (for UI projects).

## Setup

```bash
mise trust && mise install
mise run hooks:install
```

Under `mise` paranoid trust mode, editing `mise.toml` revokes trust; re-run `mise trust` before running tasks.

## Commands

| Command | What it does |
| --- | --- |
| `mise run check` | Full gate: typecheck, lint, format check, and tests |
| `mise run fix` | Auto-format and auto-fix lint across the repo (`hk fix --all`) |
| `mise run typecheck` | Typecheck all project references |
| `mise run lint` | Type-aware lint (warnings fail) |
| `mise run fmt` / `fmt:check` | Format or verify formatting |
| `mise run test` | Run high-signal tests |
| `mise run dev` | Start local development server |
| `mise run build` | Production build |

## Done Means

1. `mise run check` passes. Agent turn-end hooks run `hk agent stop-hook` on changed files; on hosts without repo hooks, run `mise run fix` and `mise run check` before handing back work. Fix root causes; never loosen a rule or skip a hook.
2. UI changes have been inspected in the running app at desktop and mobile (390px) widths, in light and dark modes.
3. Relevant docs (`docs/design.md`, `DESIGN.md`, `CODING_STANDARDS.md`) still match the code.

## Never

- Push, deploy, run remote DB migrations, set secrets, or run commands against live Cloudflare or production infrastructure.
- Hand-edit generated files (migrations, generated route trees, `.cloudflare/types/`, lockfiles).
- Add a dependency without asking, or bypass the 7-day release-age gate without explicit approval.
- Write bloated DOM/UI tests, snapshot tests, or mock-mirroring tests (see `CODING_STANDARDS.md`).

## Git

- Rebase feature branches onto the target branch before merging; merge with `--no-ff`.

## `CLAUDE.md`

`CLAUDE.md` contains only `@AGENTS.md` to reference this file. Always edit `AGENTS.md`.
