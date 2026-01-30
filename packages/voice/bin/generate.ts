#!/usr/bin/env node
import * as fs from "fs";
import * as path from "path";
import { generateVoice, validateScript } from "../src/generate";
import { VoiceScript } from "../src/types/script";

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help")) {
    console.log(`
Usage: pnpm generate <script.json> [options]

Options:
  --skip-cache    Force regeneration even if cached
  --cache-dir     Custom cache directory (default: ./generated/voice-cache)
  --help          Show this help message

Example:
  pnpm generate scripts/examples/drama.json
`);
    process.exit(0);
  }

  const scriptPath = args[0];
  if (!fs.existsSync(scriptPath)) {
    console.error(`Script file not found: ${scriptPath}`);
    process.exit(1);
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error("ELEVENLABS_API_KEY environment variable not set");
    console.error("Set it in packages/voice/.env or export it");
    process.exit(1);
  }

  const skipCache = args.includes("--skip-cache");
  const cacheDirIndex = args.indexOf("--cache-dir");
  const cacheDir =
    cacheDirIndex !== -1 ? args[cacheDirIndex + 1] : "./generated/voice-cache";

  console.log(`Loading script: ${scriptPath}`);
  const script: VoiceScript = JSON.parse(fs.readFileSync(scriptPath, "utf-8"));

  const errors = validateScript(script);
  if (errors.length > 0) {
    console.error("Script validation failed:");
    errors.forEach((e) => console.error(`  - ${e}`));
    process.exit(1);
  }

  console.log(`Script "${script.id}" is valid`);
  console.log(`  Voices: ${Object.keys(script.voices).join(", ")}`);
  console.log(`  Lines: ${script.lines.length}`);
  console.log(
    `  Characters: ${script.lines.reduce((s, l) => s + l.text.length, 0)}`,
  );

  console.log("\nGenerating voice...");
  const startTime = Date.now();

  const result = await generateVoice(script, {
    apiKey,
    cacheDir,
    skipCache,
  });

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

  if (result.cached) {
    console.log(`\nUsed cached result (${elapsed}s)`);
  } else {
    console.log(`\nGeneration complete (${elapsed}s)`);
  }

  console.log(`  Audio: ${result.audioPath}`);
  console.log(`  Duration: ${(result.manifest.durationMs / 1000).toFixed(2)}s`);
  console.log(`  Segments: ${result.manifest.segments.length}`);

  const manifestPath = path.join(
    path.dirname(result.audioPath),
    "manifest.json",
  );
  console.log(`  Manifest: ${manifestPath}`);

  console.log("\nSegment timing:");
  result.manifest.segments.forEach((seg) => {
    const start = (seg.startMs / 1000).toFixed(2);
    const end = (seg.endMs / 1000).toFixed(2);
    console.log(
      `  ${seg.id}: [${start}s - ${end}s] ${seg.speaker}: "${seg.text.slice(0, 40)}..."`,
    );
  });
}

main().catch((err) => {
  console.error("Generation failed:", err);
  process.exit(1);
});
