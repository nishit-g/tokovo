#!/usr/bin/env node
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cliPath = resolve(packageRoot, "dist/cli.js");

if (!existsSync(cliPath)) {
  console.error(
    "tokovo-validate is not built yet. Run `pnpm --filter @tokovo/episodes build` first.",
  );
  process.exit(1);
}

await import(pathToFileURL(cliPath).href);
