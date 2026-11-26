# AGENTS.md

`cstack` is a living specification, config library, and skill pack used by AI agents to initialize and audit projects.

## Navigation

Read only the files relevant to your task:

- Philosophy, code style, comments, git, dependencies: [docs/principles.md](docs/principles.md)
- Cross-cutting standards: [docs/standards/](docs/standards/)
- Project-type recipes: [docs/archetypes/](docs/archetypes/)
- Executable config templates: [configs/](configs/)
- Cross-agent workflows: [skills/](skills/)

## Maintaining `cstack`

- **Keep specs and configs in lockstep.** Any change to a standard in `docs/standards/` or `docs/archetypes/` that affects a config primitive must update the corresponding file under `configs/` in the same commit.
- **State the enforcer.** Every standard should name whether it is enforced by a linter/compiler, a shape test, a behavioral test, or review. Move rules from prose to static checks whenever practical.
- **Track upstream provenance.** Any vendored rule or file (such as `configs/typescript/anti-slop/`) must record its upstream URL, commit SHA, and local modifications in `UPSTREAM.md`.
- **Keep it open-source clean.** Never put private domains, personal emails, account IDs, or credentials in `cstack`. Use neutral placeholders (`example.com`, `<app-name>`).
- **Comments and prose stay durable.** Describe what the standard *is* and *why* it exists. Leave out transient censuses ("currently only used by…") and edit narration.

## Commands

| Command | Purpose |
| --- | --- |
| `mise run install:skills` | Symlink `skills/*` into global Antigravity, Claude Code, and Codex skill directories |
| `mise run check` | Validate markdown links, config syntax, and skill frontmatter |

## `CLAUDE.md`

`CLAUDE.md` contains only `@AGENTS.md` to reference this file. Always edit `AGENTS.md`.
