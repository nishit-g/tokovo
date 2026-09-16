// Emit an apply_patch artifact from pinned, OFL-licensed font bytes.
// Usage: node scripts/font-data-patch.mjs inter latin
import { readFileSync } from "node:fs";
const [family, subset] = process.argv.slice(2);
if (!/^[a-z-]+$/.test(family ?? "") || !/^[a-z-]+$/.test(subset ?? ""))
  throw new Error("Expected font family and subset");
const name = `${family}-${subset}`;
const bytes = readFileSync(
  `apps/video-runner/node_modules/@fontsource-variable/${family}/files/${name}-wght-normal.woff2`,
);
console.log(
  `*** Begin Patch\n*** Add File: ${process.cwd()}/packages/visual-system/src/fonts/${name}.ts\n+// Generated from @fontsource-variable/${family}@5.3.0; OFL-1.1. Do not edit.\n+export default ${JSON.stringify(bytes.toString("base64"))};\n*** End Patch`,
);
