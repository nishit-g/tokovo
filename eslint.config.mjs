import eslint from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.turbo/**",
      "**/.next/**",
      "**/out/**",
      "**/coverage/**",
      "**/docs/**",
    ],
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/no-empty-function": "warn",
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-ignore": true,
          "ts-expect-error": "allow-with-description",
        },
      ],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      "no-var": "error",
      eqeqeq: ["error", "always"],
    },
  },
  {
    files: ["apps/**/src/**/*.{ts,tsx}", "packages/**/src/**/*.{ts,tsx}"],
    ignores: ["**/src/cli.ts", "**/src/**/*.cli.ts", "**/scripts/**", "**/bin/**"],
    rules: {
      "no-console": "error",
    },
  },
  // =========================================================================
  // PACKAGE BOUNDARY RULES
  // Prevents layer violations: core should not import from UI packages
  // =========================================================================
  {
    files: ["packages/core/src/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@tokovo/react", "@tokovo/react/*"],
              message:
                "Core cannot import from @tokovo/react (UI layer). Move UI types to react package.",
            },
            {
              group: ["@tokovo/renderer", "@tokovo/renderer/*"],
              message:
                "Core cannot import from @tokovo/renderer (UI layer). Core must be headless.",
            },
            {
              group: ["react", "react-dom"],
              message: "Core cannot import React directly. UI components belong in @tokovo/react.",
            },
            {
              group: ["./prepare.js", "./prepare/*", "../prepare/*", "@tokovo/core/prepare", "@tokovo/core/prepare/*"],
              message:
                "Legacy prepareEpisode APIs were removed. Use prepareTrackEpisode from @tokovo/compiler.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["apps/render-service/src/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/asset-refs-cli*", "**/preview-data-cli*"],
              message:
                "Render-service must consume video-runner library APIs, not CLI subprocess entrypoints.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["apps/web/src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/lib/publishing/*", "./lib/publishing/*", "../lib/publishing/*"],
              message:
                "Publishing server logic lives in @tokovo/publishing/server. Do not reintroduce web-local publishing services.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["packages/episodes/src/runtime/**/*.ts"],
    ignores: ["packages/episodes/src/runtime/catalogs/studio.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@tokovo/apps-whatsapp",
              message:
                "Runtime wiring must import app registration from the explicit package plugin entrypoint (for example @tokovo/apps-whatsapp/plugin).",
            },
            {
              name: "@tokovo/apps-imessage",
              message:
                "Runtime wiring must import app registration from the explicit package plugin entrypoint (for example @tokovo/apps-imessage/plugin).",
            },
            {
              name: "@tokovo/apps-instagram",
              message:
                "Runtime wiring must import app registration from the explicit package plugin entrypoint (for example @tokovo/apps-instagram/plugin).",
            },
            {
              name: "@tokovo/apps-linkedin",
              message:
                "Runtime wiring must import app registration from the explicit package plugin entrypoint (for example @tokovo/apps-linkedin/plugin).",
            },
            {
              name: "@tokovo/apps-snapchat",
              message:
                "Runtime wiring must import app registration from the explicit package plugin entrypoint (for example @tokovo/apps-snapchat/plugin).",
            },
            {
              name: "@tokovo/apps-teams",
              message:
                "Runtime wiring must import app registration from the explicit package plugin entrypoint (for example @tokovo/apps-teams/plugin).",
            },
            {
              name: "@tokovo/apps-typewriter",
              message:
                "Runtime wiring must import app registration from the explicit package plugin entrypoint (for example @tokovo/apps-typewriter/plugin).",
            },
            {
              name: "@tokovo/apps-x",
              message:
                "Runtime wiring must import app registration from the explicit package plugin entrypoint (for example @tokovo/apps-x/plugin).",
            },
          ],
          patterns: [
            {
              group: ["../tests/*", "../../tests/*"],
              message:
                "Runtime wiring should not depend on test catalogs unless the studio profile explicitly includes them.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["packages/apps-*/src/index.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["./plugin", "./plugin.js", "./plugin/*"],
              message:
                "Root app-package barrels are authoring surfaces. Import runtime registration from the explicit /plugin entrypoint.",
            },
            {
              group: ["./runtime/*", "./ui/*", "./lowering/*", "./layout/*", "./camera/*", "./assets/*"],
              message:
                "Root app-package barrels must not re-export runtime, UI, lowering, layout, camera, or asset internals. Use explicit subpath entrypoints instead.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["packages/apps-*/src/contract/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../runtime/*", "../ui/*", "../plugin", "../plugin.js", "../plugin/*", "../layout/*", "../camera/*", "../assets/*", "../components/*"],
              message:
                "Contract modules must stay headless. They cannot depend on runtime, UI, plugin assembly, layouts, camera behavior, or asset internals.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["packages/apps-*/src/runtime/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../ui/*", "../plugin", "../plugin.js", "../plugin/*", "../components/*"],
              message:
                "Runtime modules must not depend on UI or plugin assembly. Keep reducers and selectors headless.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["packages/apps-*/src/dsl/**/*.{ts,tsx}", "packages/apps-*/src/lowering/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../ui/*", "../plugin", "../plugin.js", "../plugin/*", "../components/*"],
              message:
                "DSL and lowering modules must not depend on UI or plugin assembly.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["packages/apps-*/src/ui/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../plugin", "../plugin.js", "../plugin/*"],
              message:
                "UI modules must not import plugin assembly. Plugin entrypoints compose UI, not the reverse.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["packages/renderer/src/**/*.ts", "packages/renderer/src/**/*.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@tokovo/apps-*"],
              message: "Renderer should not import app packages directly. Use registries instead.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["**/*.test.ts", "**/*.spec.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off",
      "no-restricted-imports": "off",
    },
  },
  {
    files: [
      "**/next.config.js",
      "**/postcss.config.js",
      "**/prettier.config.js",
      "**/*.config.cjs",
    ],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        module: "readonly",
        require: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        process: "readonly",
      },
    },
    rules: {
      "no-undef": "off",
    },
  },
  {
    files: ["**/next-env.d.ts"],
    rules: {
      "@typescript-eslint/triple-slash-reference": "off",
    },
  },
  {
    files: ["apps/docs/**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
  {
    files: ["apps/web/**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
);
