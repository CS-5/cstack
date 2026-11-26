# Testing Charter

Tests must prove their value. Static types (`tsrs`/`go build`), strict linting (`oxlint`/`golangci-lint`), and boundary validation eliminate entire classes of routine unit tests. Keep suites tiny, fast, and high-signal so they run at the end of every agent turn.

## 1. Default to "No Tests Unless Earned"

*Enforced by `AGENTS.md` and review.*

- **Do not write tests for new code by default.** There is no coverage target.
- Before creating or adding to a test file, state *what non-obvious failure mode or security invariant* the test pins.
- If logic is hard to test without mocks, extract the pure decision logic into a pure function and test that instead.

## 2. High-Value Zones vs. Banned Tests

### Write Tests For
- **Security & access boundaries:** Auth verification, role caps, permission checks, tenant isolation, origin checks, token/join-code formats and checksums, billing, and input sanitization.
- **Non-trivial pure logic:** Parsers, state machines, ordering/ranking algorithms, scheduling/cadence math, currency/date calculations, and sync/conflict resolution.
- **Persistence & privilege invariants (when backed by a real DB):** Queries, transactions, conflict handling, and DB role permissions against a real local SQLite, D1, or PostgreSQL instance.
- **Escaped bugs:** Every real bug that escapes into usage earns a regression test written to **fail first**, then pass after the fix.
- **Structural/shape invariants (Go):** Lightweight `style_test.go` checks for repo layout or query-builder rules that static linters cannot express.

### Explicitly Banned
- **DOM / UI interaction tests** ("dialog opens and closes", "button renders label") — do not install jsdom or Testing Library by default. Verify UI visually in the running app.
- **Snapshot tests.**
- **Type, schema-shape, or routing tests** that merely restate what TypeScript, Valibot/Zod, or the router already guarantee.
- **Mock-mirroring tests** that stub a dependency only to assert it was called with expected arguments.
- **Glue tests** covering framework wiring or trivial pass-through wrappers.

*Carve-out:* Only add an automated end-to-end/browser smoke test when explicitly requested for a high-stakes critical path; manual/agent-browser verification against the running build is the default.

## 3. Mechanical Anti-Bloat Enforcement

*Enforced by `oxlint` (`@interfere/landmines`) and `golangci-lint`.*

- **TypeScript (`@interfere/landmines`):**
  - `landmines/no-test-doubles` — bans module mocking and fake test doubles.
  - `landmines/no-fixed-sleep`, `landmines/no-unsignaled-poll`, `landmines/no-flake-masking`, `landmines/no-conditional-expect`, `landmines/no-styling-class-assertion` — bans flaky and tautological test patterns.
  - `landmines/colocated-tests` + `landmines/test-file-names` — pure tests live beside the code they test (`foo.test.ts`).
- **Minimal runners:**
  - **Pure TS / Bun projects:** `bun test` (or `vitest run` in Vite/pnpm apps where Vite transforms or Workers bindings are needed).
  - **Cloudflare Worker bindings (D1/DO/KV):** `@cloudflare/vitest-pool-workers` *only* when testing real binding behavior.
  - **Go:** `go test` with `testify` (`require` for preconditions that stop the test; `assert` for value checks that report and continue; enforced by `testifylint`, `thelper`, `tparallel`, `usetesting`).

## 4. "Break It to Prove It" (Audit & Self-Review)

Every test—new or existing—must survive one question:

> *"If I invert the core condition or delete the security check, does this test fail?"*

If the answer is no, or if the test only fails because a mock expectation changed, **delete the test**. During `cstack-audit`, agents actively flag and prune low-signal tests rather than only adding checks.
