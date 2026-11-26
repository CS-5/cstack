# Archetype: Go CLI, TUI, or Service (`go-app`)

Use this archetype for standalone CLIs, TUIs, long-lived backend services, and sync/worker daemons where static binaries, low memory overhead, and strong concurrency matter.

## Stack

| Concern | Default Choice | Notes |
| --- | --- | --- |
| Philosophy | Stdlib-first | Do not reinvent the wheel; avoid frameworks where stdlib is already clean |
| Logging | `go.uber.org/zap` | Structured fields; never log raw secrets or unredacted credentials |
| Database Migrations | Goose (SQL migrations) | Reviewed SQL migrations; push invariants into DB schema constraints |
| SQL Construction | `github.com/huandu/go-sqlbuilder` | `db`-tagged row structs as single source of truth; bound parameters only |
| HTTP Server | Open (decided per project) | Intentionally not locked in—choose stdlib `net/http`, Fiber, or another router based on whether stdlib middleware interoperability matters |
| Linting & Formatting | `golangci-lint` v2 (`gofumpt` + `goimports`) | Single tool owns both lint and formatting via `configs/go/.golangci.yml` |
| Vulnerability Check | `govulncheck` | Exposed via `mise run vuln` |
| Testing | `go test` + `testify` (`require` / `assert`) | Real PostgreSQL/SQLite for persistence tests; `style_test.go` for repo-shape invariants |

## Directory Structure

```text
├── mise.toml + mise.lock
├── hk.pkl
├── .golangci.yml               # Copied from configs/go/.golangci.yml
├── go.mod + go.sum
├── AGENTS.md + CLAUDE.md       # CLAUDE.md contains only @AGENTS.md
├── CODING_STANDARDS.md
├── style_test.go               # Optional AST/shape invariants enforced by go test .
├── cmd/
│   └── <app>/main.go           # Thin wiring, flag/config parsing, signal handling
└── internal/
    ├── config/                 # Single validated configuration list
    ├── logging/                # Zap logger setup and structured error field helpers
    ├── store/                  # DB connection, migrations, query helpers
    └── <domain>/               # Domain packages taking plain types (no HTTP handler types)
```

## Architectural Rules

- **Clear package ownership.** Domain packages take plain Go types and never depend on HTTP handler types so they run unchanged from a handler, worker, CLI command, or test. Enforce import boundaries with `depguard` rules in `.golangci.yml`.
- **Explicit lifecycles.** Startup owns every goroutine and background worker. Every worker accepts `context.Context` and has a shutdown path that waits for completion (`sync.WaitGroup` / `errgroup`). Constructors and `init()` never spawn goroutines.
- **Visible database behavior.**
  - Bound parameters only—never interpolate values into SQL.
  - Transactions are opened, committed, and rolled back explicitly where callers can see them.
  - Upstream HTTP/network calls never run inside an open database transaction.
  - Push data invariants into schema constraints via Goose SQL migrations rather than duplicating them in Go.
- **Structured errors.** Wrap third-party/stdlib errors at first contact with short lowercase operation context (`"syncing records"`). Classify domain conditions with clear sentinels; attach structured fields rather than encoding metadata into error strings.
- **Formatting and style invariants:**
  - `golangci-lint` owns formatting (`gofumpt` + `goimports`) and runs with uncapped issue reporting (`max-same-issues: 0`, `max-issues-per-linter: 0`).
  - Expand function bodies and standalone multi-field struct literals onto their own lines (no compressed one-line functions).
  - Pre-size slices when length/minimum is known (`make([]T, 0, n)`), use `var s []T` when unknown, `[]T{}` when non-nil JSON `[]` is required, never `make([]T, 0)`.
  - Use `slices` instead of `sort` and `math/rand/v2` instead of `math/rand` (enforced by `depguard`).
  - Every `//nolint` directive names the exact linter and explains why on the same line (enforced by `nolintlint`).
- **Testing with `testify`:**
  - `require` for preconditions that make continuing meaningless (setup errors, nil guards).
  - `assert` for value checks so multiple failures report in one run.
  - Run persistence tests against a real local database (SQLite or PostgreSQL), never a fake SQL mock.

## `hk.pkl` Wiring for Go

```pkl
local go = new Group {
  steps {
    ["golangci-lint-fmt"] = Builtins.golangci_lint_fmt
    ["golangci-lint"] = Builtins.golangci_lint
    ["go-mod-tidy"] = Builtins.gomod_tidy
    ["golangci-lint-config"] = new Step {
      glob = ".golangci.yml"
      check = new CommandSpec {
        command = "golangci-lint config verify"
        effect = "read"
      }
    }
  }
}
```

## Recommended Community Skills

Offer to install these project-scoped skills during `cstack-init` (see [docs/standards/skills.md](../standards/skills.md) and [configs/agents/apm.go.yml](../../configs/agents/apm.go.yml)):

- `samber/cc-skills-golang`: Go idioms, concurrency, context, design patterns, dependency injection, `testify`, safety, and performance. Note in `AGENTS.md` that `CODING_STANDARDS.md` takes precedence over upstream SQL (`go-sqlbuilder` + Goose migrations) and error-handling examples.
