---
name: cstack-retro
description: Harvest real-world lessons, recurring agent mistakes, config improvements, or architectural patterns from a project back into cstack.
---

# cstack-retro

Turn lessons learned in real projects into durable upgrades to `cstack` so the same pain never repeats twice.

## Locating `cstack`

Resolve the real directory containing this `SKILL.md` file to locate the local `cstack` checkout (`../../docs/`, `../../configs/`).

## Workflow

1. **Gather Signal from the Source Project**
   - Inspect recent commits, `CODING_STANDARDS.md`, `AGENTS.md`, `oxlint.config.ts`, `.golangci.yml`, `mise.toml`, `hk.pkl`, or user-described friction from the current project.
   - Identify candidate lessons:
     - A bug or AI habit that a static lint rule, tsconfig flag, or `hk` step could prevent mechanically.
     - A tooling quirk or workaround (e.g., `mise` trust, `cf` CLI flag, `hk` step ordering, package manager edge case).
     - A Testing Charter refinement or a class of test that proved unusually valuable or useless.
     - A clean structural convention that belongs in an archetype.

2. **Filter Against `cstack` Principles**
   - **Generalize:** Strip project-specific names, domains, accounts, and product logic. Keep `cstack` open-source clean.
   - **Prefer executable truth:** If a lesson can be enforced in `configs/typescript/oxlint.config.ts`, `configs/go/.golangci.yml`, `configs/mise/hk.base.pkl`, or `configs/agents/claude-settings.json`, put it in the config first and reference the enforcer in `docs/`.
   - **Keep it lean:** Reject one-off workarounds that apply only to a single repo.

3. **Propose & Apply Updates**
   - Show the user a concise list of proposed updates with exact target files in `cstack` (`docs/` + `configs/`).
   - Once approved (or directly if the user asked to apply), edit `cstack`, keep docs and configs synchronized, and run `mise run check` inside `cstack`.
