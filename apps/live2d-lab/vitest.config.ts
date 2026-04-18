import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@tokovo/reactions": path.resolve(
        __dirname,
        "../../packages/reactions/src/index.ts",
      ),
      "@tokovo/reactors": path.resolve(
        __dirname,
        "../../packages/reactors/src/index.tsx",
      ),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    server: { deps: { inline: [/^@tokovo\//] } },
  },
});
