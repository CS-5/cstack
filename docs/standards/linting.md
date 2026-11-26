# Linting, Formatting & Type Safety Standard

Strict static analysis is the primary defense against bugs and AI-generated shortcuts. Warnings are treated as errors everywhere. Fix the root cause rather than loosening a rule.

## TypeScript Compiler Strictness

Every TypeScript project extends [configs/typescript/tsconfig.base.json](../../configs/typescript/tsconfig.base.json) without weakening flags per sub-project. Key enforced flags:

- `strict: true`
- `noUncheckedIndexedAccess: true` — array and map lookups yield `T | undefined`
- `exactOptionalPropertyTypes: true` — distinguishes omitted properties from explicit `undefined`
- `noPropertyAccessFromIndexSignature: true` — forces bracket access on dynamic dictionaries
- `verbatimModuleSyntax: true` + `isolatedModules: true`
- `erasableSyntaxOnly: true` — bans `enum`, `namespace`, and parameter properties so code runs under type-stripping runtimes
- `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, `noUnusedLocals`, `noUnusedParameters`, `allowUnreachableCode: false`, `allowUnusedLabels: false`, `noUncheckedSideEffectImports: true`

Also typecheck config and tooling files (`tsconfig.tools.json`), including vendored lint plugins.

## TypeScript Linting: Oxlint Hybrid Stack

`cstack` uses a **hybrid Oxlint architecture** ([configs/typescript/oxlint.config.ts](../../configs/typescript/oxlint.config.ts)) run type-aware with `--deny-warnings --report-unused-disable-directives`:

| Layer | Source | Role |
| --- | --- | --- |
| Base preset | `@cloudflare/oxlint-config` | Builds on `@nkzw/oxlint-config` ("Error, Never Warn"), strict TS boundaries, promise safety, and 12 adopted `anti-slop` rules (`quality/*`) |
| Honest code & tests | `@interfere/landmines` | Bans test doubles (`no-test-doubles`), silent catches, fixed sleeps, flake masking, misplaced tests, and enforces readable statement spacing |
| Vendored gap rules | `tools/oxlint/anti-slop/` | Only the 4 `dmmulroy/anti-slop` rules not carried by Cloudflare or Landmines: `no-runtime-typeof`, `no-shape-in-symbol-names`, `no-unknown-parameters`, `require-safety-comment-for-type-assertion` |
| Framework plugins (as needed) | `eslint-plugin-react-you-might-not-need-an-effect`, `@tanstack/eslint-plugin-query`, `@tanstack/eslint-plugin-router`, `@shadcn/lint` | Loaded only in archetypes that use React, TanStack, or a tokenized design system |
| Architectural boundaries | `no-restricted-imports` overrides | Enforces module boundaries (e.g., client never imports worker/DB; routes and MCP tools never import Drizzle/DB directly; no manual React `useMemo`/`useCallback`/`memo`) |

### Key Rules Carrying Decisions (Not Just Style)
- `typescript/no-deprecated: "error"` — fast-moving libraries (Cloudflare `cf`, TanStack, MCP) change faster than model memory; deprecated calls catch stale idioms immediately.
- `typescript/no-unsafe-*` + `anti-slop/no-unknown-parameters` + `anti-slop/no-runtime-typeof` — mechanically enforces **parse, don't assert** at I/O boundaries.
- `anti-slop/require-safety-comment-for-type-assertion` — every non-`const` type assertion must carry a `// SAFETY: <why>` comment.
- `import/no-cycle: "error"` and `no-param-reassign: "error"` — keeps module graphs acyclic and data flow predictable.
- Keep `@oxlint/plugins` pinned to the **exact same version** as `oxlint`.

### Keeping Vendored `anti-slop` Fresh
`configs/typescript/anti-slop/UPSTREAM.md` records the exact upstream commit SHA and every local edit. When `cstack-refresh` runs, it checks upstream commits and flags any rule absorbed by `@cloudflare/oxlint-config` or `@interfere/landmines` so the vendored copy shrinks over time.

### Astro Carve-Out
Until Oxlint supports `.astro` files, static Astro projects use ESLint (`strictTypeChecked` + `stylisticTypeChecked` + `eslint-plugin-astro` with `jsx-a11y-strict` + `@shadcn/lint` + vendored anti-slop) and Prettier. See [docs/archetypes/web-static.md](../archetypes/web-static.md).

## TypeScript Formatting: `oxfmt`

- Config: `.oxfmtrc.json` copied from [configs/typescript/oxfmt.json](../../configs/typescript/oxfmt.json) (`printWidth: 120`).
- Never hand-format or argue with `oxfmt`.

## Go Linting & Formatting: `golangci-lint` v2

Go projects use `golangci-lint` v2 as the single tool for both linting and formatting ([configs/go/.golangci.yml](../../configs/go/.golangci.yml)):

- **Formatting owned by `golangci-lint`:** `formatters: { enable: [gofumpt, goimports] }`, invoked in `hk.pkl` via `Builtins.golangci_lint_fmt`.
- **Uncapped reporting:** `issues: { max-same-issues: 0, max-issues-per-linter: 0 }` so runs never silently hide findings.
- **Explicit allowlist:** `linters.default: none` with curated correctness, idiom/perf, error-handling, SQL/context safety (`noctx`, `rowserrcheck`, `sqlclosecheck`, `unqueryvet`), and test linters (`testifylint`, `thelper`, `tparallel`, `usetesting`).
- **Full `staticcheck`:** `checks: [all, -ST1000]`.
- **Modern stdlib & architecture via `depguard`:** Ban `sort` (use `slices`) and `math/rand` (use `math/rand/v2`), plus project-specific package boundary rules.
- **Strict suppressions (`nolintlint`):** `require-explanation: true`, `require-specific: true`, `allow-unused: false`.
- **Verify config in hooks:** Run `golangci-lint config verify` in `hk.pkl` whenever `.golangci.yml` changes.
