#!/usr/bin/env node
import * as fs from "fs";
import * as path from "path";

interface SyncOptions {
  cacheDir: string;
  publicDir: string;
  watch: boolean;
}

function findLatestCache(scriptId: string, cacheDir: string): string | null {
  if (!fs.existsSync(cacheDir)) return null;

  const entries = fs.readdirSync(cacheDir);
  const matching = entries
    .filter((e) => e.startsWith(`${scriptId}_`))
    .map((e) => ({
      name: e,
      path: path.join(cacheDir, e),
      mtime: fs.statSync(path.join(cacheDir, e)).mtime.getTime(),
    }))
    .sort((a, b) => b.mtime - a.mtime);

  return matching.length > 0 ? matching[0].path : null;
}

function syncScript(
  scriptId: string,
  cachePath: string,
  publicDir: string,
): void {
  const manifestSrc = path.join(cachePath, "manifest.json");
  const audioSrc = path.join(cachePath, "audio.mp3");

  if (!fs.existsSync(manifestSrc) || !fs.existsSync(audioSrc)) {
    console.warn(`  ⚠ Skipping ${scriptId}: missing manifest or audio`);
    return;
  }

  const voiceDir = path.join(publicDir, "voice");
  if (!fs.existsSync(voiceDir)) {
    fs.mkdirSync(voiceDir, { recursive: true });
  }

  const manifestDest = path.join(voiceDir, `${scriptId}-manifest.json`);
  const audioDest = path.join(voiceDir, `${scriptId}.mp3`);

  fs.copyFileSync(manifestSrc, manifestDest);
  fs.copyFileSync(audioSrc, audioDest);

  console.log(`  ✓ ${scriptId}`);
  console.log(`    → ${path.relative(process.cwd(), manifestDest)}`);
  console.log(`    → ${path.relative(process.cwd(), audioDest)}`);
}

function generateTypes(
  scriptId: string,
  cachePath: string,
  typesDir: string,
): void {
  const manifestPath = path.join(cachePath, "manifest.json");
  if (!fs.existsSync(manifestPath)) return;

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  const segments = manifest.segments as Array<{
    id: string;
    startMs: number;
    endMs: number;
    text: string;
    speaker: string;
  }>;

  const safeId = scriptId.replace(/-/g, "_").replace(/[^a-zA-Z0-9_]/g, "");

  const segmentIds = segments.map((s) => s.id);
  const segmentUnion = segmentIds.map((id) => `"${id}"`).join(" | ");

  const segmentEntries = segments
    .map((s) => {
      const safeName = s.id.replace("seg_", "");
      return `  "${s.id}": { id: "${s.id}", startMs: ${s.startMs}, endMs: ${s.endMs}, speaker: "${s.speaker}" }`;
    })
    .join(",\n");

  const typeContent = `/**
 * Auto-generated voice script types for "${scriptId}"
 * DO NOT EDIT - regenerate with: pnpm voice:generate
 */

export type ${safeId}_SegmentId = ${segmentUnion};

export const ${safeId}_segments = {
${segmentEntries}
} as const;

export const ${safeId} = {
  id: "${scriptId}",
  manifestPath: "/voice/${scriptId}-manifest.json",
  audioPath: "/voice/${scriptId}.mp3",
  durationMs: ${manifest.durationMs},
  segments: ${safeId}_segments,
  
  start(segmentId: ${safeId}_SegmentId, fps: number = 30): number {
    return Math.round((${safeId}_segments[segmentId].startMs / 1000) * fps);
  },
  
  end(segmentId: ${safeId}_SegmentId, fps: number = 30): number {
    return Math.round((${safeId}_segments[segmentId].endMs / 1000) * fps);
  },
  
  duration(segmentId: ${safeId}_SegmentId, fps: number = 30): number {
    const seg = ${safeId}_segments[segmentId];
    return Math.round(((seg.endMs - seg.startMs) / 1000) * fps);
  },
} as const;

export type ${safeId}_Script = typeof ${safeId};
`;

  if (!fs.existsSync(typesDir)) {
    fs.mkdirSync(typesDir, { recursive: true });
  }

  const typePath = path.join(typesDir, `${scriptId}.ts`);
  fs.writeFileSync(typePath, typeContent);
  console.log(`  ✓ Types: ${path.relative(process.cwd(), typePath)}`);
}

function syncAll(options: SyncOptions): void {
  console.log("\n🔊 Voice Sync\n");

  if (!fs.existsSync(options.cacheDir)) {
    console.log("No voice cache found. Run 'pnpm voice:generate' first.");
    return;
  }

  const entries = fs.readdirSync(options.cacheDir);
  const scriptIds = [
    ...new Set(entries.map((e) => e.split("_")[0]).filter(Boolean)),
  ];

  if (scriptIds.length === 0) {
    console.log("No generated scripts found.");
    return;
  }

  console.log(`Found ${scriptIds.length} script(s):\n`);

  const typesDir = path.join(
    path.dirname(options.cacheDir),
    "..",
    "src",
    "scripts",
  );

  for (const scriptId of scriptIds) {
    const cachePath = findLatestCache(scriptId, options.cacheDir);
    if (cachePath) {
      syncScript(scriptId, cachePath, options.publicDir);
      generateTypes(scriptId, cachePath, typesDir);
    }
  }

  console.log("\n✅ Sync complete\n");
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help")) {
    console.log(`
Usage: pnpm voice:sync [options]

Syncs generated voice assets to the public folder and generates TypeScript types.

Options:
  --cache-dir    Source cache directory (default: ./generated/voice-cache)
  --public-dir   Destination public folder (default: ../../apps/video-runner/public)
  --watch        Watch for changes and auto-sync
  --help         Show this help message

Examples:
  pnpm voice:sync
  pnpm voice:sync --watch
`);
    process.exit(0);
  }

  const cacheDirIndex = args.indexOf("--cache-dir");
  const publicDirIndex = args.indexOf("--public-dir");

  const options: SyncOptions = {
    cacheDir:
      cacheDirIndex !== -1
        ? args[cacheDirIndex + 1]
        : path.join(__dirname, "..", "generated", "voice-cache"),
    publicDir:
      publicDirIndex !== -1
        ? args[publicDirIndex + 1]
        : path.join(
            __dirname,
            "..",
            "..",
            "..",
            "apps",
            "video-runner",
            "public",
          ),
    watch: args.includes("--watch"),
  };

  syncAll(options);

  if (options.watch) {
    console.log("👀 Watching for changes...\n");
    fs.watch(options.cacheDir, { recursive: true }, (event, filename) => {
      if (
        filename &&
        (filename.endsWith(".mp3") || filename.endsWith(".json"))
      ) {
        console.log(`\n📝 Change detected: ${filename}`);
        syncAll(options);
      }
    });
  }
}

main().catch((err) => {
  console.error("Sync failed:", err);
  process.exit(1);
});
