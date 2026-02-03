import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["src/__tests__/**/*.test.ts"],
    coverage: {
      provider: "v8",
      all: true,
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "**/*.d.ts",
        "**/__tests__/**",
        "src/**/index.ts",
        "src/types/**",
        "src/types.ts",
        "src/plugin/examples/**",
      ],
      thresholds: {
        lines: 100,
        functions: 100,
        branches: 100,
        statements: 100,
      },
    },
  },
});
