import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { analyzeCameraTemporalQuality, type CameraTemporalQualityReport } from "@tokovo/camera";

import { bundle } from "@remotion/bundler";
import { openBrowser, renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import {
  getEpisodeAssetRefs,
  getEpisodeRenderData,
  getRenderDataAssetSources,
  rewriteEpisodeRenderDataAssetUrls,
} from "video-runner/render-data";
import type { EpisodeRenderData } from "video-runner/render-data";

import {
  publicAssetsRoot,
  releaseCompositionId,
  repoRoot,
  videoRunnerEntryPoint,
  videoRunnerRoot,
} from "./constants";
import {
  createBundleSourceSignature,
  createCameraLayerPainterSourceSignature,
} from "./bundle-manifest";
import { getBrowserExecutable, getPublicAssetBaseUrl } from "./env";
import { createRenderServiceError, toRenderServiceError } from "./errors";
import { type RenderLogger } from "./logger";
import { type RenderProfile } from "./profiles";
import { createPresignedAssetUrlMap } from "./storage";
import {
  CameraTextureCaptureCollector,
  compositeCameraTexture,
  renderPosterFromVideo,
} from "./camera-texture-compositor";
import {
  createCameraLayerPlateCacheKey,
  lookupCameraLayerPlate,
  storeCameraLayerPlate,
  type CameraLayerPlateIdentity,
} from "./camera-layer-plate-cache";

let serveUrlPromise: Promise<string> | null = null;
let serveUrlSignature = "";
const browserPromises = new Map<
  RenderProfile["chromiumGl"],
  Promise<Awaited<ReturnType<typeof openBrowser>>>
>();

function getEpisodeAssetSources(episodeId: string): string[] {
  return getEpisodeAssetRefs(episodeId).map((ref: { src: string }) => ref.src);
}

async function getPreparedRenderData(input: {
  episodeId: string;
  assetUrlMap: Record<string, string>;
}): Promise<EpisodeRenderData> {
  try {
    return await getEpisodeRenderData(input.episodeId, input.assetUrlMap);
  } catch (error) {
    throw createRenderServiceError({
      code: "RENDER_DATA_FAILED",
      stage: "bootstrap",
      message: `Failed to prepare render data for episode "${input.episodeId}"`,
      details: {
        episodeId: input.episodeId,
      },
      cause: error instanceof Error ? error : undefined,
    });
  }
}

export async function getServeUrl(
  logger?: RenderLogger,
): Promise<{ serveUrl: string; sourceSignature: string }> {
  const sourceSignature = createBundleSourceSignature();
  if (serveUrlPromise && serveUrlSignature === sourceSignature) {
    return { serveUrl: await serveUrlPromise, sourceSignature };
  }

  const bundleDir = path.join(repoRoot, ".remotion", "bundles", sourceSignature);
  const indexPath = path.join(bundleDir, "index.html");
  const publicAssetMarker = path.join(
    bundleDir,
    "public",
    "asset-provenance.json",
  );
  if (fs.existsSync(indexPath) && fs.existsSync(publicAssetMarker)) {
    await logger?.info("bundle.reuse", "Reusing cached Remotion bundle", {
      sourceSignature,
      bundleDir,
    });
    serveUrlSignature = sourceSignature;
    serveUrlPromise = Promise.resolve(bundleDir);
    return { serveUrl: bundleDir, sourceSignature };
  }

  fs.rmSync(bundleDir, { recursive: true, force: true });
  fs.mkdirSync(bundleDir, { recursive: true });
  await logger?.info("bundle.start", "Bundling Remotion entrypoint", {
    sourceSignature,
    bundleDir,
  });
  serveUrlSignature = sourceSignature;
  serveUrlPromise = bundle({
    entryPoint: videoRunnerEntryPoint,
    outDir: bundleDir,
    rootDir: videoRunnerRoot,
    publicDir: publicAssetsRoot,
    enableCaching: true,
  }).catch((error) => {
    serveUrlPromise = null;
    serveUrlSignature = "";
    throw createRenderServiceError({
      code: "BUNDLE_FAILED",
      stage: "bundle",
      message: "Bundling the Remotion entrypoint failed",
      retryable: true,
      details: {
        bundleDir,
        sourceSignature,
      },
      cause: error instanceof Error ? error : undefined,
    });
  });
  const serveUrl = await serveUrlPromise;
  await logger?.info("bundle.done", "Bundled Remotion entrypoint", {
    sourceSignature,
    bundleDir,
  });
  return { serveUrl, sourceSignature };
}

export async function getBrowser(
  chromiumGl: RenderProfile["chromiumGl"] = "angle",
  logger?: RenderLogger,
) {
  let browserPromise = browserPromises.get(chromiumGl);
  if (!browserPromise) {
    await logger?.info("browser.launch", "Launching reusable render browser", {
      browserExecutable: getBrowserExecutable() ?? "auto",
    });
    browserPromise = openBrowser("chrome", {
      browserExecutable: getBrowserExecutable(),
      chromeMode: "headless-shell",
      chromiumOptions: {
        gl: chromiumGl,
        enableMultiProcessOnLinux: false,
      },
      logLevel: "error",
    }).catch((error) => {
      browserPromises.delete(chromiumGl);
      throw createRenderServiceError({
        code: "BROWSER_LAUNCH_FAILED",
        stage: "browser",
        message: "Launching the render browser failed",
        retryable: true,
        details: {
          browserExecutable: getBrowserExecutable() ?? "auto",
        },
        cause: error instanceof Error ? error : undefined,
      });
    });
    browserPromises.set(chromiumGl, browserPromise);
  }

  const browser = await browserPromise;
  await logger?.info("browser.open", "Opened reusable render browser", {
    browserExecutable: getBrowserExecutable() ?? "auto",
  });
  return browser;
}

export async function closeBrowser(): Promise<void> {
  const browsers = [...browserPromises.values()];
  browserPromises.clear();
  await Promise.all(
    browsers.map(async (browserPromise) => {
      const browser = await browserPromise;
      await browser.close({ silent: true });
    }),
  );
}

async function resolveCameraLayerPlate(input: {
  identity: CameraLayerPlateIdentity;
  sourcePath: string;
  cacheEnabled: boolean;
  logger: RenderLogger;
  render: () => Promise<void>;
}): Promise<{
  path: string;
  cacheStatus: "hit" | "miss" | "disabled";
  timingMs: {
    lookup: number;
    render: number;
    store: number;
    total: number;
  };
}> {
  const startedAt = Date.now();
  const lookupStartedAt = Date.now();
  const lookup = input.cacheEnabled ? await lookupCameraLayerPlate(input.identity) : null;
  const lookupMs = Date.now() - lookupStartedAt;
  if (lookup?.status === "hit") {
    await input.logger.info(
      "camera.layer-plate.cache.hit",
      "Reusing camera-independent layer plate",
      {
        layer: input.identity.layer,
        cacheKey: lookup.key,
        platePath: lookup.platePath,
        sha256: lookup.sha256,
        sizeBytes: lookup.sizeBytes,
        painterSignature: input.identity.painterSignature,
        storySignature: input.identity.storySignature,
        stageSignature: input.identity.stageSignature,
      },
    );
    return {
      path: lookup.platePath,
      cacheStatus: "hit",
      timingMs: {
        lookup: lookupMs,
        render: 0,
        store: 0,
        total: Date.now() - startedAt,
      },
    };
  }

  await input.logger.info(
    input.cacheEnabled ? "camera.layer-plate.cache.miss" : "camera.layer-plate.cache.disabled",
    input.cacheEnabled
      ? "Rendering uncached camera-independent layer plate"
      : "Layer-plate cache disabled for this render",
    {
      layer: input.identity.layer,
      painterSignature: input.identity.painterSignature,
      storySignature: input.identity.storySignature,
      stageSignature: input.identity.stageSignature,
      ...(lookup?.status === "miss"
        ? {
            cacheKey: lookup.key,
            missReason: lookup.reason,
            cacheError: lookup.error,
          }
        : {}),
    },
  );
  const renderStartedAt = Date.now();
  await input.render();
  const renderMs = Date.now() - renderStartedAt;
  if (!input.cacheEnabled) {
    return {
      path: input.sourcePath,
      cacheStatus: "disabled",
      timingMs: {
        lookup: lookupMs,
        render: renderMs,
        store: 0,
        total: Date.now() - startedAt,
      },
    };
  }

  const storeStartedAt = Date.now();
  try {
    const stored = await storeCameraLayerPlate({
      identity: input.identity,
      sourcePath: input.sourcePath,
    });
    await input.logger.info(
      "camera.layer-plate.cache.store",
      "Stored camera-independent layer plate",
      {
        layer: input.identity.layer,
        cacheKey: stored.key,
        platePath: stored.platePath,
        sha256: stored.sha256,
        sizeBytes: stored.sizeBytes,
        painterSignature: input.identity.painterSignature,
        storySignature: input.identity.storySignature,
        stageSignature: input.identity.stageSignature,
      },
    );
    const storeMs = Date.now() - storeStartedAt;
    return {
      path: stored.platePath,
      cacheStatus: "miss",
      timingMs: {
        lookup: lookupMs,
        render: renderMs,
        store: storeMs,
        total: Date.now() - startedAt,
      },
    };
  } catch (error) {
    await input.logger.warn(
      "camera.layer-plate.cache.store-failed",
      "Layer-plate cache write failed; continuing with the freshly rendered plate",
      {
        layer: input.identity.layer,
        error: error instanceof Error ? error.message : String(error),
      },
    );
    return {
      path: input.sourcePath,
      cacheStatus: "miss",
      timingMs: {
        lookup: lookupMs,
        render: renderMs,
        store: Date.now() - storeStartedAt,
        total: Date.now() - startedAt,
      },
    };
  }
}

export async function renderEpisodeMedia(input: {
  episodeId: string;
  renderData?: EpisodeRenderData;
  cameraPlanId?: string;
  /** Internal verification/chunking seam. Values are inclusive source frames. */
  frameRange?: [number, number];
  profile: RenderProfile;
  outputLocation: string;
  posterLocation: string;
  cameraTracePath?: string;
  logger: RenderLogger;
}) {
  const browser = await getBrowser(input.profile.chromiumGl, input.logger);
  const publicAssetBaseUrl = getPublicAssetBaseUrl();
  const unresolvedRenderData =
    input.renderData ??
    (await getPreparedRenderData({
      episodeId: input.episodeId,
      assetUrlMap: {},
    }));
  if (unresolvedRenderData.episodeId !== input.episodeId) {
    throw createRenderServiceError({
      code: "RENDER_DATA_EPISODE_MISMATCH",
      stage: "bootstrap",
      message: `Prepared render data belongs to "${unresolvedRenderData.episodeId}", not "${input.episodeId}".`,
      details: {
        episodeId: input.episodeId,
        renderDataEpisodeId: unresolvedRenderData.episodeId,
      },
    });
  }
  const assetSources = input.renderData
    ? getRenderDataAssetSources(input.renderData)
    : getEpisodeAssetSources(input.episodeId);
  const presignedAssetUrlMap = await createPresignedAssetUrlMap(
    assetSources,
    Math.max(3600, Math.floor(input.profile.timeoutInMilliseconds / 1000) + 300),
  );
  const renderData =
    Object.keys(presignedAssetUrlMap).length > 0
      ? rewriteEpisodeRenderDataAssetUrls(
          unresolvedRenderData,
          presignedAssetUrlMap,
        )
      : unresolvedRenderData;
  const inputProps = {
    episodeId: input.episodeId,
    renderData,
    cameraPlanId: input.cameraPlanId,
  };
  const renderEnvVariables = {
    TOKOVO_RENDER_PROFILE: input.profile.id,
    TOKOVO_RENDER_EXECUTOR: "render-service",
    ...(publicAssetBaseUrl ? { TOKOVO_PUBLIC_ASSET_BASE_URL: publicAssetBaseUrl } : {}),
  };
  const bundleStartedAt = Date.now();
  const {
    serveUrl,
    sourceSignature: bundleSourceSignature,
  } = await getServeUrl(input.logger);
  const bundleMs = Date.now() - bundleStartedAt;

  const selectStartedAt = Date.now();
  await input.logger.info("composition.select.start", "Selecting composition", {
    compositionId: releaseCompositionId,
    episodeId: input.episodeId,
    serveUrl,
    precomputedAssetCount: assetSources.length,
    signedAssetCount: Object.keys(presignedAssetUrlMap).length,
  });
  const composition = await selectComposition({
    serveUrl,
    id: releaseCompositionId,
    inputProps,
    browserExecutable: getBrowserExecutable(),
    puppeteerInstance: browser,
    timeoutInMilliseconds: input.profile.timeoutInMilliseconds,
    envVariables: renderEnvVariables,
    logLevel: "error",
  }).catch((error) => {
    throw createRenderServiceError({
      code: "COMPOSITION_SELECT_FAILED",
      stage: "composition",
      message: `Selecting composition "${releaseCompositionId}" failed`,
      retryable: true,
      details: {
        episodeId: input.episodeId,
        compositionId: releaseCompositionId,
        sourceSignature: renderData.sourceSignature,
        bundleSourceSignature,
      },
      cause: error instanceof Error ? error : undefined,
    });
  });
  const selectCompositionMs = Date.now() - selectStartedAt;
  await input.logger.info("composition.select.done", "Selected composition", {
    compositionId: composition.id,
    durationInFrames: composition.durationInFrames,
    fps: composition.fps,
    width: composition.width,
    height: composition.height,
    durationMs: selectCompositionMs,
  });

  const sourceFrameRange = input.frameRange ?? [0, composition.durationInFrames - 1];
  if (
    !Number.isInteger(sourceFrameRange[0]) ||
    !Number.isInteger(sourceFrameRange[1]) ||
    sourceFrameRange[0] < 0 ||
    sourceFrameRange[1] < sourceFrameRange[0] ||
    sourceFrameRange[1] >= composition.durationInFrames
  ) {
    throw createRenderServiceError({
      code: "RENDER_FRAME_RANGE_INVALID",
      stage: "composition",
      message: `Invalid inclusive frame range ${sourceFrameRange[0]}-${sourceFrameRange[1]} for ${composition.durationInFrames} frames.`,
      details: {
        episodeId: input.episodeId,
        frameRange: sourceFrameRange,
        durationInFrames: composition.durationInFrames,
      },
    });
  }

  const cinematicPrograms = renderData.prepared.cinematics;
  const selectedCameraProgram = cinematicPrograms?.cameraPrograms.find(
    (program) => program.plan.id === (input.cameraPlanId ?? cinematicPrograms.defaultCameraPlanId),
  );
  if ((cinematicPrograms && !selectedCameraProgram) || (!cinematicPrograms && input.cameraPlanId)) {
    throw createRenderServiceError({
      code: "CAMERA_PLAN_NOT_FOUND",
      stage: "composition",
      message: `CameraPlan "${input.cameraPlanId}" is not prepared for episode "${input.episodeId}".`,
      details: {
        episodeId: input.episodeId,
        cameraPlanId: input.cameraPlanId,
      },
    });
  }
  if (selectedCameraProgram?.projectionBackendRequirement === "texture") {
    const stageProgram = cinematicPrograms?.stageProgram.program;
    const stageRoot = stageProgram?.nodes.find((node) => node.id === stageProgram.rootNodeId);
    if (!cinematicPrograms || !stageRoot) {
      throw createRenderServiceError({
        code: "CAM_TEXTURE_RENDER_FAILED",
        stage: "camera-texture-render",
        message: "Texture camera rendering requires a prepared stage root",
        details: { episodeId: input.episodeId },
      });
    }
    const layerPainterSignature = createCameraLayerPainterSourceSignature();
    const createLayerPlateIdentity = (
      layer: CameraLayerPlateIdentity["layer"],
    ): CameraLayerPlateIdentity => ({
      layer,
      episodeId: input.episodeId,
      painterSignature: layerPainterSignature,
      storySignature: cinematicPrograms.storySignature,
      stageSignature: cinematicPrograms.stageSignature,
      frameRange: [sourceFrameRange[0], sourceFrameRange[1]],
      fps: composition.fps,
      width: stageRoot.localBounds.width,
      height: stageRoot.localBounds.height,
      chromiumGl: input.profile.chromiumGl,
      encodingSignature:
        layer === "underlay"
          ? "prores-standard-yuv422p10le-pcm16"
          : "prores-4444-yuva444p10le-muted",
    });
    const layerPlateIdentities = {
      underlay: createLayerPlateIdentity("underlay"),
      stage: createLayerPlateIdentity("stage"),
      foreground: createLayerPlateIdentity("foreground"),
    } satisfies Record<CameraLayerPlateIdentity["layer"], CameraLayerPlateIdentity>;
    const layerPlateKeys = {
      underlay: createCameraLayerPlateCacheKey(layerPlateIdentities.underlay),
      stage: createCameraLayerPlateCacheKey(layerPlateIdentities.stage),
      foreground: createCameraLayerPlateCacheKey(layerPlateIdentities.foreground),
    };
    const textureStartedAt = Date.now();
    const workingDirectory = await fs.promises.mkdtemp(
      path.join(os.tmpdir(), "tokovo-camera-texture-"),
    );
    const underlayPath = path.join(workingDirectory, "underlay.mov");
    const cameraPlatePath = path.join(workingDirectory, "camera.mov");
    const projectionDataPath = path.join(workingDirectory, "camera-projection-data.mp4");
    const foregroundPlatePath = path.join(workingDirectory, "foreground.mov");
    const collector = new CameraTextureCaptureCollector();
    try {
      await input.logger.info(
        "camera.texture.render.start",
        "Rendering layer-attached camera texture plates",
        {
          cameraPlanId: selectedCameraProgram.plan.id,
          cameraSignature: selectedCameraProgram.signature,
          workingDirectory,
        },
      );
      const sharedLayerOptions = {
        serveUrl,
        concurrency: Math.max(1, Math.min(input.profile.concurrency, os.cpus().length)),
        browserExecutable: getBrowserExecutable(),
        puppeteerInstance: browser,
        timeoutInMilliseconds: input.profile.timeoutInMilliseconds,
        imageFormat: "png" as const,
        chromiumOptions: { gl: input.profile.chromiumGl },
        envVariables: renderEnvVariables,
        overwrite: true,
        logLevel: "error" as const,
        frameRange: sourceFrameRange,
      };
      const selectLayer = async (
        cameraRenderLayer:
          | "underlay"
          | "camera-plate"
          | "camera-projection-data"
          | "foreground-plate",
      ) => {
        const layerInputProps = { ...inputProps, cameraRenderLayer };
        const layerComposition = await selectComposition({
          serveUrl,
          id: releaseCompositionId,
          inputProps: layerInputProps,
          browserExecutable: getBrowserExecutable(),
          puppeteerInstance: browser,
          timeoutInMilliseconds: input.profile.timeoutInMilliseconds,
          envVariables: renderEnvVariables,
          logLevel: "error",
        });
        return { layerInputProps, layerComposition };
      };
      const renderCacheEnabled = process.env.TOKOVO_RENDER_CACHE !== "off";
      const layerPlateCacheEnabled =
        renderCacheEnabled && process.env.TOKOVO_CAMERA_LAYER_PLATE_CACHE !== "off";
      const compositorChunkCacheEnabled =
        renderCacheEnabled && process.env.TOKOVO_CAMERA_COMPOSITOR_CHUNK_CACHE !== "off";
      const projectionData = await selectLayer("camera-projection-data");
      const projectionDataStartedAt = Date.now();
      await renderMedia({
        ...sharedLayerOptions,
        composition: projectionData.layerComposition,
        inputProps: projectionData.layerInputProps,
        outputLocation: projectionDataPath,
        codec: "h264",
        pixelFormat: "yuv420p",
        muted: true,
        onArtifact: (artifact) => {
          if (typeof artifact.content === "string") {
            collector.acceptBrowserLog(artifact.content);
          }
        },
      });
      const projectionDataMs = Date.now() - projectionDataStartedAt;

      const resolvedUnderlay = await resolveCameraLayerPlate({
        identity: layerPlateIdentities.underlay,
        sourcePath: underlayPath,
        cacheEnabled: layerPlateCacheEnabled,
        logger: input.logger,
        render: async () => {
          const underlay = await selectLayer("underlay");
          await renderMedia({
            ...sharedLayerOptions,
            composition: underlay.layerComposition,
            inputProps: underlay.layerInputProps,
            outputLocation: underlayPath,
            codec: "prores",
            proResProfile: "standard",
            pixelFormat: "yuv422p10le",
            audioCodec: "pcm-16",
          });
        },
      });
      const resolvedCameraPlate = await resolveCameraLayerPlate({
        identity: layerPlateIdentities.stage,
        sourcePath: cameraPlatePath,
        cacheEnabled: layerPlateCacheEnabled,
        logger: input.logger,
        render: async () => {
          const cameraPlate = await selectLayer("camera-plate");
          await renderMedia({
            ...sharedLayerOptions,
            composition: cameraPlate.layerComposition,
            inputProps: cameraPlate.layerInputProps,
            outputLocation: cameraPlatePath,
            codec: "prores",
            proResProfile: "4444",
            pixelFormat: "yuva444p10le",
            muted: true,
          });
        },
      });
      const resolvedForegroundPlate = await resolveCameraLayerPlate({
        identity: layerPlateIdentities.foreground,
        sourcePath: foregroundPlatePath,
        cacheEnabled: layerPlateCacheEnabled,
        logger: input.logger,
        render: async () => {
          const foreground = await selectLayer("foreground-plate");
          await renderMedia({
            ...sharedLayerOptions,
            composition: foreground.layerComposition,
            inputProps: foreground.layerInputProps,
            outputLocation: foregroundPlatePath,
            codec: "prores",
            proResProfile: "4444",
            pixelFormat: "yuva444p10le",
            muted: true,
          });
        },
      });
      const captures = collector.completeRange(sourceFrameRange[0], sourceFrameRange[1]);
      const cameraQuality: CameraTemporalQualityReport = analyzeCameraTemporalQuality(
        captures.flatMap((capture) =>
          capture.outputs.map((output) => ({
            frame: capture.frame,
            outputId: output.outputId,
            viewport: output.viewport,
            ...output.quality,
          })),
        ),
      );
      if (input.cameraTracePath) {
        await fs.promises.writeFile(
          input.cameraTracePath,
          `${captures
            .map((capture) => JSON.stringify({ kind: "projection", ...capture }))
            .join("\n")}\n`,
          "utf8",
        );
      }
      await input.logger.info("camera.quality.measured", "Measured camera temporal quality", {
        passed: cameraQuality.passed,
        sampleCount: cameraQuality.sampleCount,
        violationCount: cameraQuality.violations.length,
        violations: cameraQuality.violations,
      });
      if (input.profile.id === "release" && !cameraQuality.passed) {
        throw createRenderServiceError({
          code: "CAMERA_TEMPORAL_QUALITY_FAILED",
          stage: "camera-texture-render",
          message: `Release camera quality gate failed with ${cameraQuality.violations.length} violation(s).`,
          details: { cameraQuality },
        });
      }
      const compositeResult = await compositeCameraTexture({
        captures,
        underlayPath: resolvedUnderlay.path,
        cameraPlatePath: resolvedCameraPlate.path,
        foregroundPlatePath: resolvedForegroundPlate.path,
        outputPath: input.outputLocation,
        workingDirectory,
        width: composition.width,
        height: composition.height,
        fps: composition.fps,
        profile: input.profile,
        logger: input.logger,
        cache: {
          enabled: compositorChunkCacheEnabled,
          plateKeys: layerPlateKeys,
        },
      });
      const renderMediaMs = Date.now() - textureStartedAt;
      await input.logger.info(
        "camera.texture.render.done",
        "Rendered and composited camera texture plates",
        {
          outputLocation: input.outputLocation,
          durationMs: renderMediaMs,
          frameCount: captures.length,
        },
      );

      const stillStartedAt = Date.now();
      await renderPosterFromVideo({
        videoPath: input.outputLocation,
        posterPath: input.posterLocation,
        frame: Math.floor(captures.length / 2),
        fps: composition.fps,
      });
      const renderStillMs = Date.now() - stillStartedAt;
      return {
        sourceSignature: renderData.sourceSignature,
        bundleSourceSignature,
        composition,
        sourceFrameRange,
        timingMs: {
          bundle: bundleMs,
          selectComposition: selectCompositionMs,
          renderMedia: renderMediaMs,
          renderStill: renderStillMs,
          cameraTexture: {
            projectionData: projectionDataMs,
            underlayPlate: resolvedUnderlay.timingMs.total,
            stagePlate: resolvedCameraPlate.timingMs.total,
            foregroundPlate: resolvedForegroundPlate.timingMs.total,
            displacementMaps: compositeResult.timingMs.displacementMaps,
            compositorChunks: compositeResult.timingMs.chunks,
            mux: compositeResult.timingMs.mux,
          },
        },
        cameraQuality,
        renderCache: {
          layerPlateEnabled: layerPlateCacheEnabled,
          compositorChunkEnabled: compositorChunkCacheEnabled,
          layerPlates: {
            hits: [resolvedUnderlay, resolvedCameraPlate, resolvedForegroundPlate].filter(
              (resolution) => resolution.cacheStatus === "hit",
            ).length,
            misses: [resolvedUnderlay, resolvedCameraPlate, resolvedForegroundPlate].filter(
              (resolution) => resolution.cacheStatus === "miss",
            ).length,
            disabled: [resolvedUnderlay, resolvedCameraPlate, resolvedForegroundPlate].filter(
              (resolution) => resolution.cacheStatus === "disabled",
            ).length,
          },
          compositorChunks: compositeResult.cache,
        },
      };
    } catch (error) {
      throw toRenderServiceError(error, {
        code: "CAM_TEXTURE_RENDER_FAILED",
        stage: "camera-texture-render",
        message: `Texture camera render failed for plan "${selectedCameraProgram.plan.id}"`,
        details: {
          episodeId: input.episodeId,
          cameraPlanId: selectedCameraProgram.plan.id,
          cameraSignature: selectedCameraProgram.signature,
        },
      });
    } finally {
      if (process.env.TOKOVO_KEEP_CAMERA_WORKDIR === "1") {
        await input.logger.warn(
          "camera.texture.workdir.preserved",
          "Preserved camera texture working directory for diagnostics",
          { workingDirectory },
        );
      } else {
        await fs.promises.rm(workingDirectory, {
          recursive: true,
          force: true,
        });
      }
    }
  }

  let compositedCameraQuality: CameraTemporalQualityReport | undefined;
  if (selectedCameraProgram) {
    const diagnosticsDirectory = await fs.promises.mkdtemp(
      path.join(os.tmpdir(), "tokovo-camera-quality-"),
    );
    const diagnosticsVideo = path.join(diagnosticsDirectory, "projection-data.mp4");
    const collector = new CameraTextureCaptureCollector();
    try {
      const diagnosticInputProps = {
        ...inputProps,
        cameraRenderLayer: "camera-projection-data" as const,
      };
      const diagnosticComposition = await selectComposition({
        serveUrl,
        id: releaseCompositionId,
        inputProps: diagnosticInputProps,
        browserExecutable: getBrowserExecutable(),
        puppeteerInstance: browser,
        timeoutInMilliseconds: input.profile.timeoutInMilliseconds,
        envVariables: renderEnvVariables,
        logLevel: "error",
      });
      await renderMedia({
        composition: diagnosticComposition,
        serveUrl,
        inputProps: diagnosticInputProps,
        outputLocation: diagnosticsVideo,
        codec: "h264",
        pixelFormat: "yuv420p",
        muted: true,
        concurrency: Math.max(1, Math.min(input.profile.concurrency, os.cpus().length)),
        browserExecutable: getBrowserExecutable(),
        puppeteerInstance: browser,
        timeoutInMilliseconds: input.profile.timeoutInMilliseconds,
        imageFormat: "jpeg",
        chromiumOptions: { gl: input.profile.chromiumGl },
        envVariables: renderEnvVariables,
        overwrite: true,
        logLevel: "error",
        frameRange: sourceFrameRange,
        onArtifact: (artifact) => {
          if (typeof artifact.content === "string") {
            collector.acceptBrowserLog(artifact.content);
          }
        },
      });
      const captures = collector.completeRange(sourceFrameRange[0], sourceFrameRange[1]);
      compositedCameraQuality = analyzeCameraTemporalQuality(
        captures.flatMap((capture) =>
          capture.outputs.map((output) => ({
            frame: capture.frame,
            outputId: output.outputId,
            viewport: output.viewport,
            ...output.quality,
          })),
        ),
      );
      if (input.cameraTracePath) {
        await fs.promises.writeFile(
          input.cameraTracePath,
          `${captures.map((capture) => JSON.stringify({ kind: "projection", ...capture })).join("\n")}\n`,
          "utf8",
        );
      }
      await input.logger.info(
        "camera.quality.measured",
        "Measured composited camera temporal quality",
        {
          passed: compositedCameraQuality.passed,
          sampleCount: compositedCameraQuality.sampleCount,
          violationCount: compositedCameraQuality.violations.length,
        },
      );
      if (input.profile.id === "release" && !compositedCameraQuality.passed) {
        throw createRenderServiceError({
          code: "CAMERA_TEMPORAL_QUALITY_FAILED",
          stage: "camera-quality",
          message: `Release camera quality gate failed with ${compositedCameraQuality.violations.length} violation(s).`,
          details: { cameraQuality: compositedCameraQuality },
        });
      }
    } finally {
      await fs.promises.rm(diagnosticsDirectory, { recursive: true, force: true });
    }
  }

  const renderStartedAt = Date.now();
  await input.logger.info("render.media.start", "Rendering video artifact", {
    outputLocation: input.outputLocation,
    concurrency: Math.max(1, Math.min(input.profile.concurrency, os.cpus().length)),
  });
  await renderMedia({
    composition,
    serveUrl,
    inputProps,
    outputLocation: input.outputLocation,
    codec: input.profile.codec,
    audioCodec: input.profile.audioCodec,
    concurrency: Math.max(1, Math.min(input.profile.concurrency, os.cpus().length)),
    videoBitrate: input.profile.videoBitrate,
    x264Preset: input.profile.x264Preset,
    hardwareAcceleration: input.profile.hardwareAcceleration,
    browserExecutable: getBrowserExecutable(),
    puppeteerInstance: browser,
    timeoutInMilliseconds: input.profile.timeoutInMilliseconds,
    imageFormat: input.profile.imageFormat,
    chromiumOptions: {
      gl: input.profile.chromiumGl,
    },
    envVariables: renderEnvVariables,
    overwrite: true,
    logLevel: "error",
    ...(input.frameRange ? { frameRange: sourceFrameRange } : {}),
  }).catch((error) => {
    throw createRenderServiceError({
      code: "MEDIA_RENDER_FAILED",
      stage: "render-media",
      message: "Rendering the video artifact failed",
      retryable: true,
      details: {
        episodeId: input.episodeId,
        outputLocation: input.outputLocation,
        sourceSignature: renderData.sourceSignature,
        bundleSourceSignature,
      },
      cause: error instanceof Error ? error : undefined,
    });
  });
  const renderMediaMs = Date.now() - renderStartedAt;
  await input.logger.info("render.media.done", "Rendered video artifact", {
    outputLocation: input.outputLocation,
    durationMs: renderMediaMs,
  });

  const stillStartedAt = Date.now();
  await input.logger.info("render.poster.start", "Rendering poster frame", {
    outputLocation: input.posterLocation,
  });
  await renderStill({
    composition,
    serveUrl,
    inputProps,
    output: input.posterLocation,
    imageFormat: "png",
    frame: Math.floor((sourceFrameRange[0] + sourceFrameRange[1]) / 2),
    browserExecutable: getBrowserExecutable(),
    puppeteerInstance: browser,
    timeoutInMilliseconds: input.profile.timeoutInMilliseconds,
    chromiumOptions: {
      gl: input.profile.chromiumGl,
    },
    envVariables: renderEnvVariables,
    overwrite: true,
    logLevel: "error",
  }).catch((error) => {
    throw createRenderServiceError({
      code: "POSTER_RENDER_FAILED",
      stage: "render-poster",
      message: "Rendering the poster frame failed",
      retryable: true,
      details: {
        episodeId: input.episodeId,
        outputLocation: input.posterLocation,
        sourceSignature: renderData.sourceSignature,
        bundleSourceSignature,
      },
      cause: error instanceof Error ? error : undefined,
    });
  });
  const renderStillMs = Date.now() - stillStartedAt;
  await input.logger.info("render.poster.done", "Rendered poster frame", {
    outputLocation: input.posterLocation,
    durationMs: renderStillMs,
  });

  return {
    sourceSignature: renderData.sourceSignature,
    bundleSourceSignature,
    composition,
    sourceFrameRange,
    timingMs: {
      bundle: bundleMs,
      selectComposition: selectCompositionMs,
      renderMedia: renderMediaMs,
      renderStill: renderStillMs,
    },
    cameraQuality: compositedCameraQuality,
  };
}
