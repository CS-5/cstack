# Tooling Standard

Native binaries everywhere practical, one version manager (`mise`), and one check runner (`hk`) powering git hooks, CI, and AI agent hooks.

## Version Management & Tasks: `mise`

Every repository defines its pinned toolchain and task contract in `mise.toml` and commits `mise.lock` so clones, worktrees, and CI resolve identical binaries.

### Required `mise.toml` Settings

```toml
[settings]
lockfile = true
minimum_release_age = "7d"
# Prevent paranoid trust mode from revoking trust on every package.json edit.
idiomatic_version_file_enable_tools = []
```

### Standard Task Contract

Every project exposes the same core tasks in `mise.toml` (wrapping `package.json` scripts or Go commands as appropriate) so humans, CI, and agents never guess command names:

| Task | Responsibility |
| --- | --- |
| `mise run check` | Full verification gate: typecheck, lint, format check, dead-code check, and tests |
| `mise run fix` | Auto-format and auto-fix lint findings across the repo (`hk fix --all`) |
| `mise run fmt` / `fmt:check` | Write or verify formatting |
| `mise run lint` / `lint:fix` | Run linter (warnings fail) / apply safe lint autofixes |
| `mise run typecheck` | Type-check all tsconfig projects (and regenerate platform types if applicable) |
| `mise run test` | Run the project's test suite |
| `mise run dev` | Start local development server |
| `mise run build` | Production build |
| `mise run hooks:install` | Install git hooks via `hk install --mise` |

Additional standard tasks when applicable: `db:generate`, `db:migrate:local`, `db:migrate:remote`, `deploy`, `vuln` (`govulncheck` for Go).

## Check Orchestration & Hooks: `hk`

`hk.pkl` is the single definition of every format, lint, typecheck, and hygiene step. Every entry point runs a slice of it:

| Entry point | Command | Behavior |
| --- | --- | --- |
| Git `pre-commit` | `hk run pre-commit` | Runs fast checks (or fixes + restages on personal repos) |
| Git `pre-push` / CI | `mise run check` | Full verification gate including whole-program checks |
| Manual autofix | `mise run fix` | `hk fix --all` across the repo |
| Agent turn-end hook | `mise x -- hk agent stop-hook --target <harness>` | Runs `check` steps with `--safe` over changed files |

### `hk.pkl` Rules
- Set `fail_fast = false` so one run surfaces every issue.
- Every custom `CommandSpec` declares `effect = "read"` or `effect = "write"` so `hk agent stop-hook` (`--safe`) accepts it.
- Sequence steps that modify the same file with `depends` (for example, `oxlint` depends on `oxfmt`, or vice versa) so fixers never race.
- Include built-in hygiene checks (`trailing_whitespace`, `newlines`, `check_merge_conflict`) and `actionlint` when GitHub Actions workflows exist.

## Package Manager & Runtime Boundaries

Separate **package manager / local tooling** from **production runtime**:

- **Package manager (default): Bun.** Fast installs, native binary, lockfile, and built-in 7-day age gate via `bunfig.toml` (`minimumReleaseAge = 604800`).
  - **When to use `pnpm` instead:** Use `pnpm` (`pnpm-workspace.yaml` with `minimumReleaseAge: 10080`) when a deployment target (such as Cloudflare Workers Builds) or ecosystem tool integrates more cleanly with `pnpm` lockfiles and `packageManager` pins.
- **Production runtime:**
  - **Web apps & Cloudflare APIs:** Vite + `@cloudflare/vite-plugin` (`workerd`), never Bun's runtime APIs (`Bun.*`, `bun:sqlite`).
  - **TS CLIs & self-hosted/Docker TS services:** Bun runtime (when Go is not the better fit).
  - **Native CLIs, TUIs, and performance-sensitive or long-lived services:** Go.

## Build, Typecheck & Dead Code

- **Frontend bundler:** Vite (with Rolldown / Oxc toolchain).
- **TypeScript compiler (default): `tsrs`** (Cloudflare's Rust TypeScript compiler, TypeScript 7 line), invoked as `tsrs -b` across project references (client, worker, tools).
  - **Fallback carve-out:** Astro projects stay on TypeScript 6 (`astro check` + `tsc`) until `@astrojs/check` (Volar) supports TypeScript 7.
  - Note: Keep `tsgo` as a known fallback if a specific project hits an unsupported `tsrs` edge case.
- **Dead code:** Use `knip` in multi-module or long-lived TypeScript repos (`knip.jsonc` / `knip.json`) in check-only mode—never `knip --fix`, which deletes code automatically.

## Supply-Chain Defaults

- Commit `mise.lock` alongside `bun.lock` / `pnpm-lock.yaml` / `go.sum`.
- Pin GitHub Actions by full commit SHA.
- Mirror the 7-day release-age gate in `.github/dependabot.yml` (if enabled), grouping paired packages that must move together (e.g., `cf` + `@cloudflare/vite-plugin`, `@vitejs/plugin-react` + `oxc-transform-react`).

## Canonical Configs

- [configs/mise/mise.base.toml](../../configs/mise/mise.base.toml)
- [configs/mise/hk.base.pkl](../../configs/mise/hk.base.pkl)
- [configs/typescript/bunfig.toml](../../configs/typescript/bunfig.toml)
- [configs/typescript/pnpm-workspace.yaml](../../configs/typescript/pnpm-workspace.yaml)
