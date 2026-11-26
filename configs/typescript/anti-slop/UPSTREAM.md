# anti-slop (vendored)

Copied from https://github.com/dmmulroy/anti-slop at commit
`13909c9e07590f5a85d93c62712259fe14a883f7`. Upstream intends this code to be
vendored and adapted to local standards.

- Registered in `oxlint.config.ts` as the `anti-slop` JS plugin.
- `@oxlint/plugins` must stay pinned to the exact same version as `oxlint`.

## Local changes

Record every change here so `cstack-refresh` preserves local decisions when checking upstream:

- Removed `effect/` (optional rule group for the Effect library).
- Removed the 12 rules shipped by `@nkzw/oxlint-config` (via `@cloudflare/oxlint-config`) as `quality/*`:
  `no-array-filter-map`, `no-chained-type-assertions`, `no-conditional-empty-object-spread`,
  `no-known-value-widening`, `no-object-parameters`, `no-reduce-accumulator-copy`, `no-reflect-apply`,
  `no-reflect-get`, `no-unknown-returns`, `no-unknown-type-aliases`, `no-unsafe-dictionary-type`,
  `no-widen-then-assert`, plus shared helpers only they used.
- Removed `no-module-mocking` (and `shared/scope.ts`) and `require-readable-spacing` (and `vendor/`),
  covered by `landmines/no-test-doubles` and `landmines/padding-between-statements` in `@interfere/landmines`.
- Adjusted `rules/no-runtime-typeof.ts` to read `option["allowInTypeGuards"]` so it passes
  `noPropertyAccessFromIndexSignature` under `tsconfig.base.json`.
