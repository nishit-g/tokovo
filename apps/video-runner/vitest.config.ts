import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/__tests__/**/*.test.ts"],
    testTimeout: 60_000,
    // Inline workspace packages so Vite can resolve TS/ESM like in dev/build.
    // Without this, Node ESM will reject extensionless/directory imports in dist.
    server: { deps: { inline: [/^@tokovo\//] } },
  },
});
