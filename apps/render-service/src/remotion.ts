import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { bundle } from "@remotion/bundler";
import { openBrowser, renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import { getEpisodeAssetRefs, getEpisodeRenderData } from "video-runner/render-data";
import type { EpisodeRenderData } from "video-runner/render-data";

import {
  releaseCompositionId,
  repoRoot,
  videoRunnerEntryPoint,
  videoRunnerRoot,
} from "./constants";
import { createBundleSourceSignature, createStagePainterSourceSignature } from "./bundle-manifest";
import { getBrowserExecutable, getPublicAssetBaseUrl } from "./env";
import { createRenderServiceError } from "./errors";
import { type RenderLogger } from "./logger";
import { type RenderProfile } from "./profiles";
import { createPresignedAssetUrlMap } from "./storage";
import {
  CameraTextureCaptureCollector,
  compositeCameraTexture,
  renderPosterFromVideo,
} from "./camera-texture-compositor";
import {
  lookupCameraStagePlate,
  storeCameraStagePlate,
  type CameraStagePlateIdentity,
} from "./camera-stage-plate-cache";

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
  if (fs.existsSync(indexPath)) {
    await logger?.info("bundle.reuse", "Reusing cached Remotion bundle", {
      sourceSignature,
      bundleDir,
    });
    serveUrlSignature = sourceSignature;
    serveUrlPromise = Promise.resolve(bundleDir);
    return { serveUrl: bundleDir, sourceSignature };
  }

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

export async function renderEpisodeMedia(input: {
  episodeId: string;
  cameraPlanId?: string;
  /** Internal verification/chunking seam. Values are inclusive source frames. */
  frameRange?: [number, number];
  profile: RenderProfile;
  outputLocation: string;
  posterLocation: string;
  logger: RenderLogger;
}) {
  const browser = await getBrowser(input.profile.chromiumGl, input.logger);
  const publicAssetBaseUrl = getPublicAssetBaseUrl();
  const assetSources = getEpisodeAssetSources(input.episodeId);
  const presignedAssetUrlMap = await createPresignedAssetUrlMap(
    assetSources,
    Math.max(3600, Math.floor(input.profile.timeoutInMilliseconds / 1000) + 300),
  );
  const renderData = await getPreparedRenderData({
    episodeId: input.episodeId,
    assetUrlMap: presignedAssetUrlMap,
  });
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
  const { serveUrl, sourceSignature } = await getServeUrl(input.logger);
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
        sourceSignature,
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
    const stagePlateIdentity: CameraStagePlateIdentity = {
      episodeId: input.episodeId,
      stagePainterSignature: createStagePainterSourceSignature(),
      storySignature: cinematicPrograms.storySignature,
      stageSignature: cinematicPrograms.stageSignature,
      frameRange: [sourceFrameRange[0], sourceFrameRange[1]],
      fps: composition.fps,
      width: stageRoot.localBounds.width,
      height: stageRoot.localBounds.height,
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
      const cacheEnabled = process.env.TOKOVO_CAMERA_STAGE_PLATE_CACHE !== "off";
      const stagePlateLookup = cacheEnabled
        ? await lookupCameraStagePlate(stagePlateIdentity)
        : null;
      let resolvedCameraPlatePath = cameraPlatePath;
      if (stagePlateLookup?.status === "hit") {
        const cachedStagePlate = stagePlateLookup;
        resolvedCameraPlatePath = cachedStagePlate.platePath;
        await input.logger.info(
          "camera.stage-plate.cache.hit",
          "Reusing camera-independent stage plate",
          {
            cacheKey: cachedStagePlate.key,
            platePath: cachedStagePlate.platePath,
            sha256: cachedStagePlate.sha256,
            sizeBytes: cachedStagePlate.sizeBytes,
            stagePainterSignature: stagePlateIdentity.stagePainterSignature,
            storySignature: stagePlateIdentity.storySignature,
            stageSignature: stagePlateIdentity.stageSignature,
          },
        );
        const projectionData = await selectLayer("camera-projection-data");
        await renderMedia({
          ...sharedLayerOptions,
          composition: projectionData.layerComposition,
          inputProps: projectionData.layerInputProps,
          outputLocation: projectionDataPath,
          codec: "h264",
          pixelFormat: "yuv420p",
          muted: true,
          onBrowserLog: (log) => collector.acceptBrowserLog(log.text),
        });
      } else {
        await input.logger.info(
          cacheEnabled ? "camera.stage-plate.cache.miss" : "camera.stage-plate.cache.disabled",
          cacheEnabled
            ? "Rendering uncached camera-independent stage plate"
            : "Stage-plate cache disabled for this render",
          {
            storySignature: cinematicPrograms.storySignature,
            stageSignature: cinematicPrograms.stageSignature,
            stagePainterSignature: stagePlateIdentity.stagePainterSignature,
            ...(stagePlateLookup?.status === "miss"
              ? {
                  cacheKey: stagePlateLookup.key,
                  missReason: stagePlateLookup.reason,
                  cacheError: stagePlateLookup.error,
                }
              : {}),
          },
        );
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
          onBrowserLog: (log) => collector.acceptBrowserLog(log.text),
        });
        if (cacheEnabled) {
          try {
            const stored = await storeCameraStagePlate({
              identity: stagePlateIdentity,
              sourcePath: cameraPlatePath,
            });
            resolvedCameraPlatePath = stored.platePath;
            await input.logger.info(
              "camera.stage-plate.cache.store",
              "Stored camera-independent stage plate",
              {
                cacheKey: stored.key,
                platePath: stored.platePath,
                sha256: stored.sha256,
                sizeBytes: stored.sizeBytes,
                stagePainterSignature: stagePlateIdentity.stagePainterSignature,
                storySignature: stagePlateIdentity.storySignature,
                stageSignature: stagePlateIdentity.stageSignature,
              },
            );
          } catch (error) {
            await input.logger.warn(
              "camera.stage-plate.cache.store-failed",
              "Stage-plate cache write failed; continuing with the freshly rendered plate",
              { error: error instanceof Error ? error.message : String(error) },
            );
          }
        }
      }
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
      const captures = collector.completeRange(sourceFrameRange[0], sourceFrameRange[1]);
      await compositeCameraTexture({
        captures,
        underlayPath,
        cameraPlatePath: resolvedCameraPlatePath,
        foregroundPlatePath,
        outputPath: input.outputLocation,
        workingDirectory,
        width: composition.width,
        height: composition.height,
        fps: composition.fps,
        profile: input.profile,
        logger: input.logger,
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
        sourceSignature,
        composition,
        timingMs: {
          bundle: bundleMs,
          selectComposition: selectCompositionMs,
          renderMedia: renderMediaMs,
          renderStill: renderStillMs,
        },
      };
    } catch (error) {
      throw createRenderServiceError({
        code: "CAM_TEXTURE_RENDER_FAILED",
        stage: "camera-texture-render",
        message: `Texture camera render failed for plan "${selectedCameraProgram.plan.id}"`,
        details: {
          episodeId: input.episodeId,
          cameraPlanId: selectedCameraProgram.plan.id,
          cameraSignature: selectedCameraProgram.signature,
        },
        cause: error instanceof Error ? error : undefined,
      });
    } finally {
      await fs.promises.rm(workingDirectory, { recursive: true, force: true });
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
        sourceSignature,
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
        sourceSignature,
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
    sourceSignature,
    composition,
    timingMs: {
      bundle: bundleMs,
      selectComposition: selectCompositionMs,
      renderMedia: renderMediaMs,
      renderStill: renderStillMs,
    },
  };
}
