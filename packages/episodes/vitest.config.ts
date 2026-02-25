import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
    coverage: {
      reporter: ["text", "json-summary"],
      thresholds: {
        lines: 75,
        branches: 70,
        functions: 75,
        statements: 75,
      },
    },
  },
});
