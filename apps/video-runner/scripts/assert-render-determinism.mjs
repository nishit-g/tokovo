/* eslint-disable no-console */
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import sharp from "sharp";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(scriptDir, "..");
const repoRoot = path.resolve(appRoot, "..", "..");
const entryPoint = path.join(appRoot, "src/index.ts");
const compositionId = "episode-render";
const goldenRoot = path.join(appRoot, "test-assets", "render-goldens");
const goldenManifestPath = path.join(goldenRoot, "manifest.json");

const defaultProbes = [
  // This gate is deliberately scoped to the package whose browser-time motion
  // has been eliminated. Add other apps only after their CSS animations are
  // migrated to frame-derived motion and reviewed goldens are checked in.
  { episodeId: "whatsapp-flagship-v2", frame: 150 },
  { episodeId: "whatsapp-theme-storybook-v2", frame: 195 },
  { episodeId: "whatsapp-theme-storybook-v2", frame: 300 },
  { episodeId: "whatsapp-interaction-matrix-v3", frame: 150 },
  { episodeId: "whatsapp-interaction-matrix-v3", frame: 225 },
  { episodeId: "whatsapp-interaction-matrix-v3", frame: 315 },
  { episodeId: "whatsapp-interaction-matrix-v3", frame: 435 },
  { episodeId: "whatsapp-interaction-matrix-v3", frame: 492 },
  { episodeId: "whatsapp-interaction-matrix-v3", frame: 555 },
  { episodeId: "whatsapp-interaction-matrix-v3", frame: 585 },
  { episodeId: "whatsapp-interaction-matrix-v3", frame: 630 },
  { episodeId: "whatsapp-interaction-matrix-v3", frame: 735 },
  { episodeId: "whatsapp-interaction-matrix-v3", frame: 754 },
  { episodeId: "whatsapp-interaction-matrix-v3", frame: 825 },
  { episodeId: "whatsapp-interaction-matrix-v3", frame: 915 },
  { episodeId: "whatsapp-interaction-matrix-v3", frame: 1005 },
  { episodeId: "whatsapp-interaction-matrix-v3", frame: 1095 },
  { episodeId: "whatsapp-interaction-matrix-v3", frame: 1185 },
  // Canonical input-session lifecycle: entrance, multilingual key press,
  // correction, submit/clear and deterministic surface exit.
  { episodeId: "keyboard-input-exhaustive", frame: 64 },
  { episodeId: "keyboard-input-exhaustive", frame: 68 },
  { episodeId: "keyboard-input-exhaustive", frame: 927 },
  { episodeId: "keyboard-input-exhaustive", frame: 948 },
  { episodeId: "keyboard-input-exhaustive", frame: 958 },
  // Canonical iOS notification anatomy: live banner and grouped center stack.
  { episodeId: "notification-center-exhaustive", frame: 42 },
  { episodeId: "notification-center-exhaustive", frame: 150 },
  // Current iOS screen-capture lifecycle: persistent compact dot, three-second
  // countdown, explicit expanded stop control, collapse, dismiss and save banner.
  // Intermediate probes lock the frame-derived morphs, not only resting states.
  { episodeId: "screen-recording-exhaustive", frame: 30 },
  { episodeId: "screen-recording-exhaustive", frame: 216 },
  { episodeId: "screen-recording-exhaustive", frame: 225 },
  { episodeId: "screen-recording-exhaustive", frame: 336 },
  { episodeId: "screen-recording-exhaustive", frame: 345 },
  { episodeId: "screen-recording-exhaustive", frame: 402 },
  { episodeId: "screen-recording-exhaustive", frame: 408 },
  { episodeId: "screen-recording-exhaustive", frame: 546 },
  { episodeId: "screen-recording-exhaustive", frame: 555 },
  { episodeId: "screen-recording-exhaustive", frame: 660 },
  { episodeId: "screen-recording-exhaustive", frame: 910 },
];

function parseProbes(raw) {
  if (!raw) return defaultProbes;
  return raw.split(",").map((item) => {
    const [episodeId, frameText] = item.trim().split("@");
    const frame = Number(frameText);
    if (!episodeId || !Number.isInteger(frame) || frame < 0) {
      throw new Error(`Invalid determinism probe "${item}"; expected episode-id@frame`);
    }
    return { episodeId, frame };
  });
}

function assertDefaultGoldenCoverage(probes, goldenManifest) {
  const probeKeys = new Set(probes.map((probe) => `${probe.episodeId}@${probe.frame}`));
  const orphanedGoldens = [...goldenManifest.keys()].filter((key) => !probeKeys.has(key));
  if (orphanedGoldens.length > 0) {
    throw new Error(
      `Golden manifest contains unexecuted default probes: ${orphanedGoldens.join(", ")}`,
    );
  }
}

async function readGoldenManifest() {
  let raw;
  try {
    raw = await fs.readFile(goldenManifestPath, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") return new Map();
    throw error;
  }

  const parsed = JSON.parse(raw);
  if (parsed.version !== 1 || !Array.isArray(parsed.goldens)) {
    throw new Error(`Invalid golden manifest at ${goldenManifestPath}`);
  }

  const result = new Map();
  for (const golden of parsed.goldens) {
    const key = `${golden.episodeId}@${golden.frame}`;
    if (
      typeof golden.episodeId !== "string" ||
      !Number.isInteger(golden.frame) ||
      golden.frame < 0 ||
      typeof golden.file !== "string" ||
      golden.file.includes("..") ||
      path.isAbsolute(golden.file)
    ) {
      throw new Error(`Invalid golden manifest entry ${JSON.stringify(golden)}`);
    }
    if (result.has(key)) {
      throw new Error(`Duplicate golden manifest entry ${key}`);
    }
    result.set(key, golden);
  }
  return result;
}

async function comparePixels(firstPath, secondPath, channelTolerance) {
  const first = await sharp(firstPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const second = await sharp(secondPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  if (
    first.info.width !== second.info.width ||
    first.info.height !== second.info.height ||
    first.info.channels !== second.info.channels
  ) {
    return { equal: false, reason: "dimensions differ" };
  }

  const diff = Buffer.alloc(first.data.length);
  let changedPixels = 0;
  let maxChannelDelta = 0;
  const channels = first.info.channels;

  for (let offset = 0; offset < first.data.length; offset += channels) {
    let pixelChanged = false;
    for (let channel = 0; channel < channels; channel += 1) {
      const index = offset + channel;
      const delta = Math.abs(first.data[index] - second.data[index]);
      diff[index] = channel === 3 ? 255 : delta;
      maxChannelDelta = Math.max(maxChannelDelta, delta);
      pixelChanged ||= delta > channelTolerance;
    }
    if (pixelChanged) changedPixels += 1;
  }

  return {
    equal: changedPixels === 0,
    changedPixels,
    maxChannelDelta,
    width: first.info.width,
    height: first.info.height,
    channels,
    diff,
  };
}

async function preserveFailure(probe, firstPath, secondPath, comparison) {
  const outputDir = path.join(repoRoot, "out", "render-determinism");
  await fs.mkdir(outputDir, { recursive: true });
  const stem = `${probe.episodeId}-frame-${probe.frame}`;
  const firstOutput = path.join(outputDir, `${stem}-a.png`);
  const secondOutput = path.join(outputDir, `${stem}-b.png`);
  await Promise.all([fs.copyFile(firstPath, firstOutput), fs.copyFile(secondPath, secondOutput)]);

  if (comparison.diff) {
    await sharp(comparison.diff, {
      raw: {
        width: comparison.width,
        height: comparison.height,
        channels: comparison.channels,
      },
    })
      .png()
      .toFile(path.join(outputDir, `${stem}-diff.png`));
  }

  return outputDir;
}

async function preserveGoldenFailure(probe, expectedPath, actualPath, comparison) {
  const outputDir = path.join(repoRoot, "out", "render-goldens");
  await fs.mkdir(outputDir, { recursive: true });
  const stem = `${probe.episodeId}-frame-${probe.frame}`;
  const expectedOutput = path.join(outputDir, `${stem}-expected.png`);
  const actualOutput = path.join(outputDir, `${stem}-actual.png`);
  await Promise.all([
    fs.copyFile(expectedPath, expectedOutput),
    fs.copyFile(actualPath, actualOutput),
  ]);

  if (comparison.diff) {
    await sharp(comparison.diff, {
      raw: {
        width: comparison.width,
        height: comparison.height,
        channels: comparison.channels,
      },
    })
      .png()
      .toFile(path.join(outputDir, `${stem}-diff.png`));
  }

  return outputDir;
}

async function main() {
  const customProbeInput = process.env.TOKOVO_DETERMINISM_PROBES;
  const probes = parseProbes(customProbeInput);
  const goldenManifest = await readGoldenManifest();
  if (!customProbeInput) assertDefaultGoldenCoverage(probes, goldenManifest);
  const updateGoldens = process.env.TOKOVO_UPDATE_RENDER_GOLDENS === "1";
  const chromiumGl = process.env.TOKOVO_DETERMINISM_GL ?? "swangle";
  const channelTolerance = Number(process.env.TOKOVO_DETERMINISM_CHANNEL_TOLERANCE ?? "1");
  if (!Number.isInteger(channelTolerance) || channelTolerance < 0 || channelTolerance > 255) {
    throw new Error("TOKOVO_DETERMINISM_CHANNEL_TOLERANCE must be an integer from 0 to 255");
  }
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "tokovo-render-determinism-"));
  let browser;

  process.env.TOKOVO_EPISODE_CATALOG_PROFILE = "studio";

  try {
    console.log(`[render-determinism] bundling ${probes.length} pixel probes`);
    const serveUrl = await bundle({
      entryPoint,
      rootDir: appRoot,
      enableCaching: true,
    });
    browser = await openBrowser("chrome", {
      chromeMode: "headless-shell",
      chromiumOptions: { gl: chromiumGl, enableMultiProcessOnLinux: false },
      logLevel: "error",
    });

    for (const probe of probes) {
      const inputProps = { episodeId: probe.episodeId };
      const envVariables = {
        TOKOVO_EPISODE_CATALOG_PROFILE: "studio",
        TOKOVO_RENDER_PROFILE: "determinism",
      };
      const composition = await selectComposition({
        serveUrl,
        id: compositionId,
        inputProps,
        puppeteerInstance: browser,
        envVariables,
        timeoutInMilliseconds: 120_000,
        logLevel: "error",
      });

      if (probe.frame >= composition.durationInFrames) {
        throw new Error(
          `Probe ${probe.episodeId}@${probe.frame} exceeds duration ${composition.durationInFrames}`,
        );
      }

      const firstPath = path.join(tempDir, `${probe.episodeId}-${probe.frame}-a.png`);
      const secondPath = path.join(tempDir, `${probe.episodeId}-${probe.frame}-b.png`);
      const render = (output) =>
        renderStill({
          composition,
          serveUrl,
          inputProps,
          output,
          imageFormat: "png",
          frame: probe.frame,
          puppeteerInstance: browser,
          envVariables,
          chromiumOptions: { gl: chromiumGl },
          timeoutInMilliseconds: 120_000,
          overwrite: true,
          logLevel: "error",
        });

      await render(firstPath);
      await render(secondPath);
      const comparison = await comparePixels(firstPath, secondPath, channelTolerance);

      if (!comparison.equal) {
        const outputDir = await preserveFailure(probe, firstPath, secondPath, comparison);
        throw new Error(
          `${probe.episodeId}@${probe.frame} changed ${comparison.changedPixels ?? "unknown"} pixels ` +
            `(max channel delta ${comparison.maxChannelDelta ?? "unknown"}); artifacts: ${outputDir}`,
        );
      }

      const golden = goldenManifest.get(`${probe.episodeId}@${probe.frame}`);
      if (golden) {
        const goldenPath = path.join(goldenRoot, golden.file);
        if (updateGoldens) {
          await fs.mkdir(path.dirname(goldenPath), { recursive: true });
          await fs.copyFile(firstPath, goldenPath);
          console.log(`[render-goldens] UPDATED ${probe.episodeId}@${probe.frame}`);
        } else {
          try {
            await fs.access(goldenPath);
          } catch {
            throw new Error(
              `Missing reviewed golden for ${probe.episodeId}@${probe.frame}: ${goldenPath}`,
            );
          }
          const goldenTolerance = Number(golden.channelTolerance ?? 0);
          if (!Number.isInteger(goldenTolerance) || goldenTolerance < 0 || goldenTolerance > 255) {
            throw new Error(
              `Invalid golden channel tolerance for ${probe.episodeId}@${probe.frame}`,
            );
          }
          const goldenComparison = await comparePixels(goldenPath, firstPath, goldenTolerance);
          if (!goldenComparison.equal) {
            const outputDir = await preserveGoldenFailure(
              probe,
              goldenPath,
              firstPath,
              goldenComparison,
            );
            throw new Error(
              `${probe.episodeId}@${probe.frame} differs from its reviewed golden by ` +
                `${goldenComparison.changedPixels ?? "unknown"} pixels ` +
                `(max channel delta ${goldenComparison.maxChannelDelta ?? "unknown"}); ` +
                `artifacts: ${outputDir}`,
            );
          }
          console.log(`[render-goldens] PASS ${probe.episodeId}@${probe.frame}`);
        }
      }

      console.log(`[render-determinism] PASS ${probe.episodeId}@${probe.frame}`);
    }

    console.log(`[render-determinism] PASS all ${probes.length} pixel probes`);
  } finally {
    await browser?.close({ silent: true });
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error("[render-determinism] FAIL", error);
  process.exit(1);
});
