import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@tokovo/device-camera": path.resolve(__dirname, "../device-camera/src"),
      "@tokovo/device-keyboard": path.resolve(
        __dirname,
        "../device-keyboard/src",
      ),
    },
  },
  server: {
    port: 3000,
  },
});
