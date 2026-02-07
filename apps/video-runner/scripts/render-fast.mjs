/* eslint-disable no-console */
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";

/**
 * Fast local renderer wrapper.
 *
 * Usage:
 *   EPISODE_ID=v2-enterprise-long-showcase pnpm --filter video-runner render:fast
 *
 * Notes:
 * - This is tuned for speed on a MacBook (GPU + concurrency).
 * - It is intentionally an opt-in profile. For final exports, use a quality profile.
 */

const repoRoot = process.cwd();
const appRoot = path.join(repoRoot, "apps/video-runner");

const episodeId = process.env.EPISODE_ID ?? "v2-enterprise-long-showcase";
const outDir = process.env.OUT_DIR ?? path.join(repoRoot, "out");
const outFile = process.env.OUT_FILE ?? path.join(outDir, `${episodeId}.mp4`);

const concurrency =
  process.env.CONCURRENCY ? Number(process.env.CONCURRENCY) : os.cpus().length;

const args = [
  "remotion",
  "render",
  "src/index.ts",
  episodeId,
  outFile,
  "--concurrency",
  String(concurrency),
  "--codec",
  "h264",
  "--x264-preset",
  "veryfast",
  "--video-bitrate",
  "8M",
  "--gl",
  "angle",
  "--hardware-acceleration",
  "if-possible",
];

console.log(`[render:fast] episode=${episodeId}`);
console.log(`[render:fast] out=${outFile}`);
console.log(`[render:fast] concurrency=${concurrency}`);

const result = spawnSync("npx", args, {
  cwd: appRoot,
  stdio: "inherit",
  env: {
    ...process.env,
    TOKOVO_RENDER_PROFILE: "fast",
  },
});

process.exit(result.status ?? 1);

