# Archetype: Static Web Site (`web-static`)

Use this archetype for content sites, documentation, marketing sites, and organization sites where HTML should ship statically with zero client-side framework runtime.

## Stack

| Concern | Default Choice | Notes |
| --- | --- | --- |
| Framework | Astro (static output) | Zero client-side framework runtime—`.astro` components and plain `<script>` only |
| Styling | Tailwind CSS v4 + CSS design tokens | Map `tokens.css` onto `@theme`; `DESIGN.md` is visual truth |
| Content | Astro Content Collections (`src/content/`) | Keep collection schemas flat (strings, enums, booleans, dates, numbers, images) |
| Dynamic Endpoints (minimal) | Cloudflare Workers Static Assets / Functions | Only for isolated actions like contact forms or API proxies |
| Validation | Valibot (or Zod where Astro content schemas use `astro:content`) | Validate form inputs and external data at the edge |
| Deploy | Cloudflare Workers Static Assets (or Cloudflare Pages for legacy sites) | Static `dist/` served from edge |
| Tooling | `mise`, `hk`, Bun (or `pnpm`), `knip` | See Astro carve-out below |

## Astro Tooling Carve-Out

Astro's `.astro` compiler (`@astrojs/check` / Volar) currently requires the TypeScript 6 JavaScript compiler API, and Oxlint does not yet lint `.astro` templates. Until upstream parity lands (tracked by `cstack-refresh`), static Astro sites use:

- **Typecheck:** TypeScript 6 (`astro check` for `src/` and root configs; `tsc -p` for `functions/` and `tools/`).
- **Lint:** ESLint (`recommended`, `strictTypeChecked`, `stylisticTypeChecked`, `eslint-plugin-astro` with `jsx-a11y-strict`, `@shadcn/lint`, and vendored `anti-slop` rules).
- **Format:** Prettier (with Astro and Tailwind plugins).
- **Dead code:** `knip` (check-only, never `knip --fix`).
- **Whole-program `hk` profile:** Tag `astro check`, `tsc`, and `knip` with `profiles = List("slow")` in `hk.pkl` so per-edit/pre-commit hooks stay instant while `mise run check`, CI, and agent Stop hooks run with `HK_PROFILE=slow`.

## Directory Structure

```text
├── astro.config.ts
├── mise.toml + mise.lock
├── hk.pkl
├── eslint.config.ts
├── .prettierrc.json
├── knip.jsonc
├── tsconfig.json
├── AGENTS.md + CLAUDE.md       # CLAUDE.md contains only @AGENTS.md
├── DESIGN.md
├── docs/tooling.md
├── functions/                  # Optional Cloudflare endpoints (own tsconfig.json)
├── tools/                      # Repo check scripts, asset pipelines (erasable TS, own tsconfig.json)
└── src/
    ├── pages/                  # File-based routes; every page sets title + description
    ├── layouts/                # BaseLayout (chrome + SEO) and section layouts
    ├── components/ui/          # Site components + zero-JS primitives
    ├── content/                # Markdown/JSON content collections
    ├── data/site.ts            # Org facts, external URLs, shared metadata (no scattered constants)
    └── styles/                 # tokens.css + global.css
```

## Architectural Rules

- **No client framework islands** unless a specific interactive widget genuinely cannot be done with HTML/CSS and minimal vanilla JS.
- **Content lives in collections, never inline arrays.** Query `src/content/` instead of hardcoding repeating data in page frontmatter.
- **Verify against the production build (`preview`), not dev.** Check built metadata, links, responsive layout (1440px and 390px), light/dark modes (via harness-native browser tools first, or `agent-browser` for terminal/scripted runs), and performance/accessibility budgets (Lighthouse CI when warranted: Perf >= 0.95, A11y = 1.00, SEO = 1.00).
- **Scripts in `tools/` use erasable TypeScript syntax** so they execute directly with native type stripping and no build step.

## Recommended Community Skills

Offer to install these project-scoped skills during `cstack-init` (see [docs/standards/skills.md](../standards/skills.md) and [configs/agents/apm.web.yml](../../configs/agents/apm.web.yml)):

- `cloudflare/skills`: first-party Cloudflare Workers Static Assets and platform guidance.
- `pbakaus/impeccable`: design language (`DESIGN.md`), critique, polish, and accessibility audits.
- `vercel-labs/agent-skills` (`web-design-guidelines`): UI/UX and accessibility checks.
- `vercel-labs/agent-browser`: native Rust CDP browser CLI when harness-native browser tooling is unavailable.
- `GoogleChrome/modern-web-guidance`: modern HTML/CSS/browser APIs and Baseline guidance.
