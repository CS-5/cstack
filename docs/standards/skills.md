# Skills Standard & Catalog

`cstack` supports your own custom skills, selectively vendored skills, and unmodified community skills without locking users into a single package manager.

## Skill Categories & Where They Live

| Category | Location | Distribution |
| --- | --- | --- |
| Custom `cstack` skills | `skills/<name>/SKILL.md` | Installed directly via `bunx skills add`, `apm install -g`, or `mise run install:skills` |
| Customized / trimmed community skills | `skills/<name>/SKILL.md` + `UPSTREAM.md` | Vendored with recorded upstream URL, commit SHA, and local edits; tracked by `cstack-refresh` |
| Unmodified community skills (global) | Catalog below + `configs/agents/apm.global.yml` | Opt-in install via `apm` or `bunx skills add` |
| Unmodified community skills (project) | Archetype docs + `configs/agents/apm.{web,go}.yml` | Offered per project during `cstack-init` |
| Package-bundled skills | `node_modules/<pkg>/skills` | Referenced in `AGENTS.md`; updated automatically with dependencies |

## Installing Skills (Installer-Agnostic)

Because `cstack` uses standard `skills/<name>/SKILL.md` folders, users can pick whichever workflow fits them:

- **Zero-clone quick install (Antigravity, Claude Code, Codex):**
  ```bash
  bunx skills add CS-5/cstack -g
  ```
- **Local clone / fork (auto-updating symlinks):**
  ```bash
  mise run install:skills
  ```
- **Reproducible personal pack with Microsoft APM:**
  Use [configs/agents/apm.global.yml](../../configs/agents/apm.global.yml) for global community skills and project-level `apm.yml` + `apm.lock.yaml` (generated during `cstack-init`) for stack-specific skills.

## Precedence Rule

Project `CODING_STANDARDS.md` and `cstack` specs always take precedence over generic community skills when rules conflict:

- **Testing Charter over blanket TDD:** Use `mattpocock/skills` TDD workflows for high-value logic and fail-first regression tests, not for routine CRUD, UI, or glue code banned by [testing.md](testing.md). When selecting individual skills from `mattpocock/skills`, omit `code-review` if it would shadow your agent's built-in `/code-review`.
- **Vite SPA + React Compiler over Next.js/SSR advice:** Apply `vercel-labs/agent-skills` React guidance selectively; ignore Next.js/SSR rules and manual memoization advice banned by [linting.md](linting.md).
- **Go SQL and error conventions over generic Go examples:** `go-app` standards (`go-sqlbuilder`, Goose SQL migrations, schema-enforced invariants, and project error packages) override conflicting examples in `samber/cc-skills-golang` (`golang-database`, `golang-error-handling`).

## Curated Community Skills

### Global (Useful Across Every Repo)

| Skill Set | Repository | Purpose | Notes |
| --- | --- | --- | --- |
| Matt Pocock Skills | `mattpocock/skills` | Socratic planning (`grilling`/`grill-me`, `to-spec`, `to-prd`), bug diagnosis, architecture and code review | Respect `cstack`'s Testing Charter over default TDD |
| Cloudflare Security Audit | `cloudflare/security-audit-skill` | Multi-phase adversarial security audit with separate hunter and validator passes | High-value pre-release and auth boundary audits |

### Web Archetypes (`web-spa`, `web-static`)

| Skill Set | Repository | Archetypes | Purpose |
| --- | --- | --- | --- |
| Cloudflare Platform Skills | `cloudflare/skills` | `web-spa`, `web-static` | First-party Cloudflare Workers, D1, Durable Objects, R2, Queues, and Agents SDK guidance |
| Impeccable | `pbakaus/impeccable` | `web-spa`, `web-static` | Deliberate frontend design vocabulary, `DESIGN.md` workflows, critique, polish, and accessibility audits |
| Vercel React & Web Skills | `vercel-labs/agent-skills` | `web-spa` (`react-best-practices`, `web-design-guidelines`), `web-static` (`web-design-guidelines`) | React performance patterns and UI/UX review guidelines (skip Next.js/SSR rules) |
| Modern Web Guidance | `GoogleChrome/modern-web-guidance` | `web-spa`, `web-static` | Modern HTML/CSS/browser APIs (`<dialog>`, Popover, Anchor Positioning, Container Queries, View Transitions, Baseline) |
| Agent Browser | `vercel-labs/agent-browser` | `web-spa`, `web-static` | Native Rust CDP browser CLI for visual inspection when harness-native browser tooling is unavailable |

### Go Archetype (`go-app`)

| Skill Set | Repository | Archetypes | Purpose |
| --- | --- | --- | --- |
| Go Engineering Skills | `samber/cc-skills-golang` | `go-app` | Go idioms, concurrency, context, design patterns, dependency injection, testing (`testify`), safety, and performance |

### Package-Bundled (No Separate Install)

- **TanStack (`web-spa`):** `node_modules/@tanstack/{react-router,db,react-db,offline-transactions}/skills`. Reference installed paths in the project's `AGENTS.md` so agents read current library docs instead of relying on memory.
