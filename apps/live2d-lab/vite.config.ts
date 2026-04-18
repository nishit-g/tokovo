import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
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
  publicDir: path.resolve(__dirname, "../video-runner/public"),
});
