#!/usr/bin/env node
import { promises as fs } from "fs";
import path from "path";

interface Finding {
  file: string;
  rule: string;
  message: string;
  suggestion: string;
  frameHint?: string;
}

interface LintResult {
  findings: Finding[];
  scannedFiles: number;
}

function resolveRepoRoot(): string {
  const cwd = process.cwd();
  if (cwd.endsWith(path.join("packages", "device-camera"))) {
    return path.resolve(cwd, "..", "..");
  }
  return cwd;
}

const DEFAULT_SCAN_ROOT = path.resolve(resolveRepoRoot(), "packages/episodes/src");

const VALID_ANCHORS = new Set([
  "device",
  "app",
  "content",
  "header",
  "profile",
  "inputArea",
  "input_area",
  "typingIndicator",
  "typing_indicator",
  "lastMessage",
  "headsUpNotification",
  "dynamicIsland",
  "device_keyboard",
  "device_notifications",
  "nav_bar",
  "timeline_header",
  "timeline_feed",
  "tweet_card",
  "metrics_row",
  "reply_composer",
  "compose_fab",
  "profile_header",
  "notifications_list",
  "dm_thread",
  "imessage_list_header",
  "imessage_list",
  "imessage_thread",
  "imessage_composer",
  "imessage_info",
  "imessage_media",
]);

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return walk(full);
      }
      if (entry.isFile() && full.endsWith(".ts")) {
        return [full];
      }
      return [];
    }),
  );
  return files.flat();
}

function parseAtToFrames(raw: string): number | null {
  const value = raw.trim().replace(/^["']|["']$/g, "");
  if (value.endsWith("ms")) {
    const ms = Number(value.slice(0, -2));
    return Number.isFinite(ms) ? Math.round((ms / 1000) * 30) : null;
  }
  if (value.endsWith("s")) {
    const s = Number(value.slice(0, -1));
    return Number.isFinite(s) ? Math.round(s * 30) : null;
  }
  const frame = Number(value);
  return Number.isFinite(frame) ? Math.round(frame) : null;
}

function lintFile(file: string, source: string): Finding[] {
  const findings: Finding[] = [];

  const lagRegex = /cam\.span\([^)]*\)\.track(?:Cinematic|Drama|FastBeat|Calm)?\([^)]*\{[^}]*\blag\s*:/gs;
  if (lagRegex.test(source)) {
    findings.push({
      file,
      rule: "camera/no-lag-option",
      message: "`lag` is removed in camera V1.",
      suggestion: "Replace `lag` with `smoothing`.",
    });
  }

  const unstableMessageAnchorRegex =
    /cam\.(?:at\([^)]+\)\.focus|span\([^)]+\)\.track(?:Cinematic|Drama|FastBeat|Calm)?)\(\s*["']message-\d+["']/g;
  if (unstableMessageAnchorRegex.test(source)) {
    findings.push({
      file,
      rule: "camera/no-unstable-message-anchor",
      message: "Unstable `message-N` anchors are banned in V1.",
      suggestion: "Use `lastMessage` or provider-backed semantic anchors.",
    });
  }

  const focusAnchorRegex = /cam\.at\([^)]+\)\.focus\(\s*["']([^"']+)["']/g;
  const trackAnchorRegex =
    /cam\.span\([^)]+\)\.track(?:Cinematic|Drama|FastBeat|Calm)?\(\s*["']([^"']+)["']/g;
  const anchors = [
    ...Array.from(source.matchAll(focusAnchorRegex)).map((m) => m[1]),
    ...Array.from(source.matchAll(trackAnchorRegex)).map((m) => m[1]),
  ];
  for (const anchor of anchors) {
    if (!VALID_ANCHORS.has(anchor)) {
      findings.push({
        file,
        rule: "camera/unknown-anchor",
        message: `Anchor "${anchor}" is not in the V1 provider-backed anchor set.`,
        suggestion:
          "Use a known anchor from WhatsApp/X/iMessage/notification providers.",
      });
    }
  }

  const resetAtRegex = /cam\.at\(([^)]+)\)\.reset\(/g;
  const resetFrames: number[] = [];
  for (const match of source.matchAll(resetAtRegex)) {
    const frame = parseAtToFrames(match[1]);
    if (frame !== null) resetFrames.push(frame);
  }
  if (resetFrames.length > 2) {
    findings.push({
      file,
      rule: "camera/reset-scene-boundary-only",
      message:
        "Too many reset calls detected; V1 expects reset only at explicit scene boundaries.",
      suggestion: "Use long `track()` spans and sparse interrupt `focus()` calls.",
    });
  }

  for (let i = 1; i < resetFrames.length; i++) {
    if (resetFrames[i] - resetFrames[i - 1] <= 45) {
      findings.push({
        file,
        rule: "camera/no-reset-pingpong",
        message: "Reset ping-pong detected within 1.5 seconds.",
        suggestion:
          "Replace frequent reset/focus loops with continuous track-first choreography.",
        frameHint: `${resetFrames[i - 1]} -> ${resetFrames[i]}`,
      });
    }
  }

  return findings;
}

async function runLint(scanRoot: string): Promise<LintResult> {
  const files = (await walk(scanRoot)).filter((f) =>
    f.endsWith(".episode.ts"),
  );
  const findings: Finding[] = [];
  for (const file of files) {
    const source = await fs.readFile(file, "utf8");
    findings.push(...lintFile(file, source));
  }
  return { findings, scannedFiles: files.length };
}

function printFindings(result: LintResult): void {
  if (result.findings.length === 0) {
    process.stdout.write(
      `tokovo-camera lint: PASS (${result.scannedFiles} episode files scanned)\n`,
    );
    return;
  }

  console.error(
    `tokovo-camera lint: FAIL (${result.findings.length} findings across ${result.scannedFiles} files)`,
  );
  for (const f of result.findings) {
    console.error(
      `- ${f.rule}\n  file=${f.file}\n  message=${f.message}\n  suggestion=${f.suggestion}${f.frameHint ? `\n  frame=${f.frameHint}` : ""}`,
    );
  }
}

async function runDoctor(cameraSrcRoot: string): Promise<void> {
  const files = await walk(cameraSrcRoot);
  const imports = files
    .filter((f) => f.endsWith(".ts"))
    .map(async (file) => ({ file, source: await fs.readFile(file, "utf8") }));
  const resolved = await Promise.all(imports);
  const couplingViolations = resolved.filter((entry) =>
    /from\s+["']@tokovo\/apps-/.test(entry.source),
  );

  process.stdout.write("tokovo-camera doctor\n");
  process.stdout.write(`- camera source files: ${files.length}\n`);
  process.stdout.write(
    `- anti-coupling: ${couplingViolations.length === 0 ? "PASS" : "FAIL"}\n`,
  );
  if (couplingViolations.length > 0) {
    for (const violation of couplingViolations) {
      process.stdout.write(`  - ${violation.file}\n`);
    }
    process.exitCode = 1;
  }
  process.stdout.write(`- known anchors: ${Array.from(VALID_ANCHORS).join(", ")}\n`);
}

async function runPreview(file: string): Promise<void> {
  const source = await fs.readFile(file, "utf8");
  const focusCalls = Array.from(
    source.matchAll(/cam\.at\(([^)]+)\)\.focus\(\s*["']([^"']+)["']/g),
  );
  const trackCalls = Array.from(
    source.matchAll(
      /cam\.span\(([^,]+),([^)]+)\)\.(track(?:Cinematic|Drama|FastBeat|Calm)?)\(\s*["']([^"']+)["']/g,
    ),
  );
  const resetCalls = Array.from(source.matchAll(/cam\.at\(([^)]+)\)\.reset\(/g));

  process.stdout.write(`tokovo-camera preview: ${file}\n`);
  process.stdout.write(`- focus events: ${focusCalls.length}\n`);
  for (const m of focusCalls) {
    process.stdout.write(`  - at=${m[1].trim()} anchor=${m[2]}\n`);
  }
  process.stdout.write(`- track spans: ${trackCalls.length}\n`);
  for (const m of trackCalls) {
    process.stdout.write(
      `  - start=${m[1].trim()} end=${m[2].trim()} mode=${m[3]} anchor=${m[4]}\n`,
    );
  }
  process.stdout.write(`- reset events: ${resetCalls.length}\n`);
  for (const m of resetCalls) {
    process.stdout.write(`  - at=${m[1].trim()}\n`);
  }
}

function migrateSourceToV1(source: string): string {
  return source
    .replace(/\blag\s*:/g, "smoothing:")
    .replace(/(["'])message-\d+\1/g, '"lastMessage"')
    .replace(/(["'])typing_indicator\1/g, '"typingIndicator"')
    .replace(/(["'])input_area\1/g, '"inputArea"');
}

async function runMigrate(scanRoot: string): Promise<void> {
  const files = (await walk(scanRoot)).filter((f) =>
    f.endsWith(".episode.ts"),
  );
  let changed = 0;
  for (const file of files) {
    const source = await fs.readFile(file, "utf8");
    const migrated = migrateSourceToV1(source);
    if (migrated !== source) {
      await fs.writeFile(file, migrated, "utf8");
      changed += 1;
    }
  }
  process.stdout.write(
    `tokovo-camera migrate-v1: updated ${changed}/${files.length} files\n`,
  );
}

async function main(): Promise<void> {
  const [, , command = "lint", ...rest] = process.argv;
  const argPath = rest.find((value) => !value.startsWith("--"));
  const repoRoot = resolveRepoRoot();

  if (command === "lint") {
    const scanRoot = argPath ? path.resolve(process.cwd(), argPath) : DEFAULT_SCAN_ROOT;
    const result = await runLint(scanRoot);
    printFindings(result);
    if (result.findings.length > 0) process.exit(1);
    return;
  }

  if (command === "doctor") {
    const cameraSrcRoot = path.resolve(repoRoot, "packages/device-camera/src");
    await runDoctor(cameraSrcRoot);
    return;
  }

  if (command === "preview") {
    const file = argPath
      ? path.resolve(process.cwd(), argPath)
      : path.resolve(
          repoRoot,
          "packages/episodes/src/production/whatsapp-to-x.episode.ts",
        );
    await runPreview(file);
    return;
  }

  if (command === "migrate-v1") {
    const scanRoot = argPath ? path.resolve(process.cwd(), argPath) : DEFAULT_SCAN_ROOT;
    await runMigrate(scanRoot);
    return;
  }

  process.stderr.write(
    "Usage: tokovo-camera <lint|doctor|preview|migrate-v1> [path-or-file]\n",
  );
  process.exit(1);
}

void main();
