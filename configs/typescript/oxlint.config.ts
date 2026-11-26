import cloudflare from "@cloudflare/oxlint-config";
import reactYouMightNotNeedAnEffect from "eslint-plugin-react-you-might-not-need-an-effect";
import { defineConfig } from "oxlint";

// Remove React/TanStack/shadcn entries when scaffolding non-UI archetypes (e.g. ts-service).
// An override's options replace top-level ones, so repeat `compilerMemoizes` in every override that sets `no-restricted-imports`.
const compilerMemoizes = {
  name: "react",
  importNames: ["useMemo", "useCallback", "memo"],
  message: "The React Compiler memoizes automatically; do not hand-memoize unless opting out explicitly.",
};

export default defineConfig({
  // Base preset: @cloudflare/oxlint-config (built on @nkzw/oxlint-config, includes 12 quality/* anti-slop rules).
  extends: [cloudflare],
  jsPlugins: [
    // Vendored gap rules not carried by @cloudflare/oxlint-config or @interfere/landmines.
    // See tools/oxlint/anti-slop/UPSTREAM.md.
    { name: "anti-slop", specifier: "./tools/oxlint/anti-slop/index.ts" },
    { name: "landmines", specifier: "@interfere/landmines" },
    // --- Web SPA plugins (remove for non-UI projects) ---
    "@shadcn/lint",
    "eslint-plugin-react-you-might-not-need-an-effect",
    "@tanstack/eslint-plugin-query",
    "@tanstack/eslint-plugin-router",
  ],
  categories: {
    correctness: "error",
    suspicious: "error",
    perf: "error",
  },
  env: cloudflare.env,
  ignorePatterns: [
    ...cloudflare.ignorePatterns,
    "dist",
    "migrations",
    "src/client/routeTree.gen.ts",
    ".cloudflare/**",
    ".claude/**",
    "tools/oxlint/anti-slop/**",
  ],
  rules: {
    // Automatic JSX runtime is enabled.
    "react/react-in-jsx-scope": "off",
    // Side-effect imports load CSS and fonts.
    "import/no-unassigned-import": "off",

    // Extra type-aware checks beyond @cloudflare/oxlint-config
    "typescript/no-unnecessary-condition": "error",
    "typescript/prefer-nullish-coalescing": "error",
    // Fast-moving packages (Cloudflare, TanStack, MCP) outpace model memory.
    "typescript/no-deprecated": "error",
    "typescript/require-await": "error",
    "typescript/prefer-promise-reject-errors": "error",

    // Strict hygiene
    "no-unused-vars": ["error", {}],
    "no-param-reassign": "error",
    "import/no-cycle": "error",
    "import/no-default-export": "off",
    "import/no-duplicates": "error",
    "unicorn/prefer-top-level-await": "off",
    curly: "off",
    "typescript/array-type": "off",

    // --- Web SPA / React rules (remove for non-UI projects) ---
    "react/no-array-index-key": "error",
    "react/no-danger": "error",
    "react/jsx-no-useless-fragment": "error",
    "react/no-unescaped-entities": "off",
    // The React Compiler memoizes context values; this rule's fix is the banned useMemo.
    "react/jsx-no-constructed-context-values": "off",
    "no-restricted-imports": ["error", { paths: [compilerMemoizes] }],
    ...reactYouMightNotNeedAnEffect.configs.strict.rules,

    // TanStack Query and Router
    "@tanstack/query/exhaustive-deps": "error",
    "@tanstack/query/no-rest-destructuring": "error",
    "@tanstack/query/stable-query-client": "error",
    "@tanstack/query/no-unstable-deps": "error",
    "@tanstack/query/infinite-query-property-order": "error",
    "@tanstack/query/no-void-query-fn": "error",
    "@tanstack/query/mutation-property-order": "error",
    "@tanstack/query/prefer-query-options": "error",
    "@tanstack/router/create-route-property-order": "error",
    "@tanstack/router/route-param-names": "error",

    // Design tokens (@shadcn/lint)
    "shadcn/no-raw-colors": "error",
    "shadcn/no-inline-styles": "error",
    "shadcn/no-unknown-classes": "error",
    "shadcn/require-static-classes": "error",
    "shadcn/no-arbitrary-values": "error",

    // @interfere/landmines: honest code and anti-bloat test rules
    "landmines/no-clipboard-read-text": "error",
    "landmines/no-cold-import-in-test": "error",
    "landmines/no-cold-start-in-test": "error",
    "landmines/no-conditional-expect": "error",
    "landmines/no-elapsed-time-bound": "error",
    "landmines/no-fixed-sleep": "error",
    "landmines/no-flake-masking": "error",
    "landmines/no-imported-mutation": "error",
    "landmines/no-parameter-branch": "error",
    "landmines/no-project-max-workers": "error",
    "landmines/no-self-container-query": "error",
    "landmines/no-silent-catch": "error",
    "landmines/no-stale-render-assertion": "error",
    "landmines/no-styling-class-assertion": "error",
    "landmines/no-test-doubles": "error",
    "landmines/no-unsignaled-poll": "error",
    "landmines/strict-msw": "error",
    "landmines/padding-between-statements": "error",
    "landmines/no-inline-hex-encoding": "error",
    "landmines/colocated-tests": "error",
    "landmines/test-file-names": "error",
    "landmines/test-dir-only-cross-functional": "error",
    "landmines/no-scripts-directory": "error",
    "landmines/no-github-scripts": "error",

    // Vendored anti-slop gap rules
    "anti-slop/no-runtime-typeof": "error",
    "anti-slop/no-shape-in-symbol-names": "error",
    "anti-slop/no-unknown-parameters": "error",
    "anti-slop/require-safety-comment-for-type-assertion": "error",
  },
  overrides: [
    {
      // Routes and MCP tools are thin: business logic and DB queries live in services.
      files: [
        "src/worker/app.ts",
        "src/worker/http.ts",
        "src/worker/mcp/**",
        "src/worker/*/routes.ts",
        "src/worker/*/routes.tsx",
        "src/worker/*/tools.ts",
      ],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            paths: [compilerMemoizes],
            patterns: [
              {
                group: ["drizzle-orm", "drizzle-orm/*", "**/db/schema"],
                message: "Query in the module's service and call it from routes or tools.",
              },
            ],
          },
        ],
      },
    },
    {
      // The client reaches the worker only over HTTP; shared shapes live in src/shared.
      files: ["src/client/**"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            paths: [compilerMemoizes],
            patterns: [
              {
                group: ["**/worker/**", "drizzle-orm", "drizzle-orm/*", "hono", "hono/*", "cloudflare:*"],
                message: "Client code may not import worker internals; share schemas through src/shared.",
              },
            ],
          },
        ],
      },
    },
    {
      files: ["*.config.ts"],
      rules: { "import/no-default-export": "off" },
    },
  ],
});
