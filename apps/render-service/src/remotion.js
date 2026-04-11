import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { openBrowser, renderMedia, renderStill, selectComposition, } from "@remotion/renderer";
import { getEpisodeAssetRefs, getEpisodeRenderData, } from "video-runner/render-data";
import { releaseCompositionId, repoRoot, videoRunnerEntryPoint, videoRunnerRoot, } from "./constants";
import { createBundleSourceSignature } from "./bundle-manifest";
import { getBrowserExecutable, getPublicAssetBaseUrl } from "./env";
import { createPresignedAssetUrlMap } from "./storage";
let serveUrlPromise = null;
let serveUrlSignature = "";
let browserPromise = null;
function resolveRenderCatalogProfile() {
    return process.env.TOKOVO_EPISODE_CATALOG_PROFILE ?? "release";
}
function getEpisodeAssetSources(episodeId) {
    return getEpisodeAssetRefs(episodeId).map((ref) => ref.src);
}
async function getPreparedRenderData(input) {
    return (await getEpisodeRenderData(input.episodeId, input.assetUrlMap));
}
export async function getServeUrl(logger) {
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
    });
    const serveUrl = await serveUrlPromise;
    await logger?.info("bundle.done", "Bundled Remotion entrypoint", {
        sourceSignature,
        bundleDir,
    });
    return { serveUrl, sourceSignature };
}
export async function getBrowser(logger) {
    if (!browserPromise) {
        await logger?.info("browser.launch", "Launching reusable render browser", {
            browserExecutable: getBrowserExecutable() ?? "auto",
        });
        browserPromise = openBrowser("chrome", {
            browserExecutable: getBrowserExecutable(),
            chromeMode: "headless-shell",
            chromiumOptions: {
                gl: "angle",
                enableMultiProcessOnLinux: false,
            },
            logLevel: "error",
        });
    }
    const browser = await browserPromise;
    await logger?.info("browser.open", "Opened reusable render browser", {
        browserExecutable: getBrowserExecutable() ?? "auto",
    });
    return browser;
}
export async function closeBrowser() {
    if (!browserPromise)
        return;
    const browser = await browserPromise;
    await browser.close({ silent: true });
    browserPromise = null;
}
export async function renderEpisodeMedia(input) {
    const browser = await getBrowser(input.logger);
    const publicAssetBaseUrl = getPublicAssetBaseUrl();
    const assetSources = getEpisodeAssetSources(input.episodeId);
    const presignedAssetUrlMap = await createPresignedAssetUrlMap(assetSources, Math.max(3600, Math.floor(input.profile.timeoutInMilliseconds / 1000) + 300));
    const renderData = await getPreparedRenderData({
        episodeId: input.episodeId,
        assetUrlMap: presignedAssetUrlMap,
    });
    const inputProps = {
        episodeId: input.episodeId,
        renderData,
    };
    const renderEnvVariables = {
        TOKOVO_RENDER_PROFILE: input.profile.id,
        TOKOVO_RENDER_EXECUTOR: "render-service",
        ...(publicAssetBaseUrl
            ? { TOKOVO_PUBLIC_ASSET_BASE_URL: publicAssetBaseUrl }
            : {}),
        ...(Object.keys(presignedAssetUrlMap).length > 0
            ? { TOKOVO_ASSET_URL_MAP: JSON.stringify(presignedAssetUrlMap) }
            : {}),
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
        frame: Math.max(0, Math.floor(composition.durationInFrames / 2)),
        browserExecutable: getBrowserExecutable(),
        puppeteerInstance: browser,
        timeoutInMilliseconds: input.profile.timeoutInMilliseconds,
        chromiumOptions: {
            gl: input.profile.chromiumGl,
        },
        envVariables: renderEnvVariables,
        overwrite: true,
        logLevel: "error",
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
