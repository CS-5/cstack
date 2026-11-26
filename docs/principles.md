# Principles

The baseline values behind every decision in `cstack`. Standards in `docs/standards/` and recipes in `docs/archetypes/` operationalize these principles.

## Core Philosophy

- **Native binaries over JS/interpreted tooling.** Use Rust, Go, or Zig tools (`oxlint`, `oxfmt`, `tsrs`, `mise`, `hk`, `bun`, `golangci-lint`) unless the ecosystem strictly requires an alternative (for example, Astro's Volar compiler). Fast feedback loops make strict checks effortless to run on every save and agent turn.
- **Trust the platform.** When deploying to Cloudflare, follow Cloudflare's native primitives, SDKs, and conventions (`cf` CLI, `cloudflare.config.ts`, Workers Static Assets, first-party bindings). Do not build custom abstraction layers over platform features you already chose.
- **Do what is normal and proven.** Reach for idiomatic, well-supported patterns first. Novelty earns its place only when it removes real complexity or solves a concrete problem.
- **Executable truth over prose.** A rule enforced by the compiler, linter, or a shape test holds every time code is written; a rule kept only in markdown drifts. Every standard names its enforcer: static check, behavioral test, or review.
- **Uniform over special cases.** One rule that always applies beats a conditional that only trims noise or cost. A special case earns its place only when it changes what a user or operator must do.

## Code Style & Structure

- **Proper structure and clear module ownership.** Organize code by domain or module (`<module>/service.ts`, `routes.ts`, `tools.ts` in TypeScript; focused packages under `internal/` in Go). Avoid dumping unrelated logic into giant files or a single catch-all package.
- **One home by reach.** Shared code lives at the narrowest scope that covers its callers: cross-package in `shared/`, cross-domain in `platform/` or `util/`, single-domain inside that domain. Avoid barrel re-export files (`no-reexports`).
- **Business logic is independent of transport.** Services and domain packages take plain types and return plain results or typed refusals (`Result` / `Refusal`). HTTP handlers, MCP tools, and UI components stay thin wrappers that call services—never duplicate business logic or permission checks across layers.
- **Avoid implicit state machines and duplicated logic.** Represent modes and transitions explicitly with discriminated unions or clear state types rather than combinations of loose booleans. Extract shared rules into a single canonical function.
- **Small abstractions.** Introduce an interface only at a meaningful boundary or when interchangeable implementations genuinely exist. Use concrete types directly everywhere else.
- **Parse, don't assert.** Validate untrusted data (HTTP bodies, query params, env vars, stored JSON, third-party APIs) at the I/O boundary using a schema library. Internal code operates on named domain types.
- **Name upstreams to inform, never to credit.** Mention a third-party service in UI copy or comments when it clarifies source or behavior; cut purely promotional attribution.

## Comment Discipline

*Enforced by review; lint suppressions and type assertions enforced statically.*

- **Write for humans; say *why*, never *what*.** Limit comments to non-obvious business rules, cross-concept invariants, external constraints, or deliberate breaks from convention. Never narrate what the code already says or describe the edit you are making.
- **Apply preferences silently.** Describe what the design *is*, leaving what you steered around unsaid. Avoid meta-commentary and trailing qualifiers explaining rejected choices.
- **Write comments that stay true.** State durable invariants ("SQLite permits one writer at a time") rather than a point-in-time census ("today the only writer is sync", "unpopulated for now") or volatile symbol/file lists.
- **Justify every escape hatch.**
  - Type assertions require a `// SAFETY: <why>` comment immediately above (`anti-slop/require-safety-comment-for-type-assertion`).
  - Lint disables must target one rule and state the reason: `// oxlint-disable-next-line <rule> -- <why>` or `//nolint:<rule> // <why>`. Unused disables fail lint.

## Git & Versioning

- **Rebase before merging.** Update feature branches by rebasing onto the target branch unless there is a clear, rare reason to preserve merge history.
- **Never fast-forward merges.** Merge with `--no-ff` after rebasing so each branch or feature lands as a clear, grouped merge commit.
- **Versioning:**
  - **SemVer** (`MAJOR.MINOR.PATCH`) for libraries, packages, and tools consumed by others.
  - **CalVer** (e.g., `YYYY.MM.DD` or `YYYY.0M.PATCH`) for deployed applications and internal services.
- **Commit messages:** No rigid prefix format required—just keep them clear, concise, and easy to understand in `git log`.

## Dependency Policy

- **7-day release-age gate by default.** Every project configures a 7-day minimum release age across `mise.toml` (`minimum_release_age = "7d"`) and the package manager (`bunfig.toml` or `pnpm-workspace.yaml`), plus matching cooldowns in Dependabot/Renovate when enabled.
- **Pre-v1 and new tooling is welcome** when it looks complete, actively supported, and materially better (for example, Cloudflare's `cf` CLI or `tsrs`).
- **Exceptions are explicit, never default.** Agents never casually add a package to the age-gate exclusion list to bypass a blocked install; choose an older version that satisfies the gate first. Explicit exceptions are acceptable when approved for first-party/owned packages or trusted vendors (e.g., Cloudflare `cf`, Microsoft packages).
- **Never add a dependency without asking** (in active project work) unless scaffolding a new project from an approved archetype.
