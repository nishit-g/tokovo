import { staticFile } from "remotion";
import { prepareTrackEpisode, } from "@tokovo/compiler";
import { createConfig, resolveStaticAssetSrc, } from "@tokovo/core";
import { ensureCanvasProfile, resolveCanvasProfileId } from "@tokovo/devices";
import { getFormat, } from "@tokovo/episodes";
import { getSharedVideoRunnerRuntime } from "./runtime";
const MAX_RENDER_DATA_CACHE_ENTRIES = 8;
const METADATA_CONFIG = createConfig();
const RENDER_DATA_CACHE = new Map();
const RENDER_DATA_BY_KEY = new Map();
function getMetadataRuntime() {
    return getSharedVideoRunnerRuntime();
}
function stableSerialize(value) {
    if (value === null || typeof value !== "object") {
        return JSON.stringify(value);
    }
    if (Array.isArray(value)) {
        return `[${value.map((entry) => stableSerialize(entry)).join(",")}]`;
    }
    const record = value;
    const entries = Object.keys(record)
        .sort()
        .map((key) => `${JSON.stringify(key)}:${stableSerialize(record[key])}`);
    return `{${entries.join(",")}}`;
}
function hashString(value) {
    let hash = 0x811c9dc5;
    for (let index = 0; index < value.length; index += 1) {
        hash ^= value.charCodeAt(index);
        hash = Math.imul(hash, 0x01000193);
    }
    return (hash >>> 0).toString(16).padStart(8, "0");
}
function buildEpisodeSourceSignature(episode, format, ir) {
    return hashString(stableSerialize({
        episodeId: episode.meta.id,
        apps: episode.config.apps,
        durationInFrames: episode.config.durationInFrames,
        format,
        ir,
    }));
}
function touchMapEntry(map, key, value) {
    map.delete(key);
    map.set(key, value);
}
function evictOldestEntries(map, maxSize) {
    while (map.size > maxSize) {
        const oldestKey = map.keys().next().value;
        if (oldestKey === undefined) {
            return;
        }
        map.delete(oldestKey);
    }
}
function resolvePlugins(pluginManager, appIds) {
    const missing = [];
    const plugins = appIds
        .map((appId) => {
        const plugin = pluginManager.get(appId);
        if (!plugin) {
            missing.push(appId);
        }
        return plugin;
    })
        .filter((plugin) => plugin !== undefined);
    if (missing.length > 0) {
        throw new Error(`[Video-Runner] Missing plugins for appIds: ${missing.join(", ")}`);
    }
    return plugins;
}
function serializePreparedEpisode(prepared) {
    return {
        id: prepared.id,
        fps: prepared.fps,
        durationInFrames: prepared.durationInFrames,
        events: prepared.events,
        keyframeInterval: prepared.keyframeInterval,
        eventSignature: prepared.eventSignature,
        initialWorld: prepared.initialWorld,
        assetRefs: prepared.assetRefs,
        metadata: prepared.metadata,
    };
}
function buildEmbeddedVoiceManifest(episodeId, voiceConfig) {
    if (!voiceConfig.segments || voiceConfig.segments.length === 0) {
        return null;
    }
    return {
        scriptId: episodeId,
        audioFile: voiceConfig.audioPath,
        durationMs: voiceConfig.durationMs || 0,
        generatedAt: "embedded",
        provider: "embedded",
        model: "embedded",
        contentHash: "embedded",
        segments: voiceConfig.segments.map((seg, index) => ({
            index,
            id: seg.id,
            speaker: seg.speaker,
            text: seg.text || "",
            startMs: seg.startMs,
            endMs: seg.endMs,
            durationMs: seg.durationMs ?? seg.endMs - seg.startMs,
        })),
    };
}
async function loadVoiceManifest(episodeId, voiceConfig, assetUrlMap, abortSignal) {
    if (!voiceConfig) {
        return null;
    }
    const embeddedManifest = buildEmbeddedVoiceManifest(episodeId, voiceConfig);
    if (embeddedManifest) {
        return embeddedManifest;
    }
    if (!voiceConfig.manifestPath) {
        return null;
    }
    const manifestUrl = assetUrlMap?.[voiceConfig.manifestPath] ??
        resolveStaticAssetSrc(voiceConfig.manifestPath, staticFile);
    const manifestResponse = await fetch(manifestUrl, {
        signal: abortSignal,
    });
    if (!manifestResponse.ok) {
        throw new Error(`Voice manifest failed to load: ${voiceConfig.manifestPath} (HTTP ${manifestResponse.status})`);
    }
    return (await manifestResponse.json());
}
function buildEpisodeSource(episode) {
    const format = typeof episode.config.format === "string"
        ? getFormat(episode.config.format)
        : episode.config.format;
    const ir = episode.build();
    return {
        episodeId: episode.meta.id,
        sourceSignature: buildEpisodeSourceSignature(episode, format, ir),
        episode,
        format: {
            width: format.width,
            height: format.height,
            fps: format.fps,
        },
        ir,
    };
}
function isAbortSignal(value) {
    return (!!value &&
        typeof value === "object" &&
        "aborted" in value &&
        typeof value.aborted === "boolean");
}
async function prepareEpisodeRenderData(source, assetUrlMap, abortSignal) {
    const prepared = preparePreparedEpisode(source);
    const voiceConfig = source.ir.voice ?? null;
    const voiceManifest = await loadVoiceManifest(source.episodeId, source.ir.voice, assetUrlMap, abortSignal);
    const renderData = {
        episodeId: source.episodeId,
        sourceSignature: source.sourceSignature,
        durationInFrames: prepared.durationInFrames,
        format: source.format,
        prepared: serializePreparedEpisode(prepared),
        backgroundConfig: source.ir.background ?? null,
        voiceConfig,
        voiceManifest,
    };
    return assetUrlMap
        ? rewriteRenderDataAssetUrls(renderData, assetUrlMap)
        : renderData;
}
function preparePreparedEpisode(source) {
    for (const device of source.ir.devices ?? []) {
        if (device.profile !== "canvas") {
            continue;
        }
        const canvasId = resolveCanvasProfileId({
            width: source.format.width,
            height: source.format.height,
        });
        device.profile = canvasId;
        ensureCanvasProfile(getMetadataRuntime().rendererRegistries.devices, canvasId, {
            width: source.format.width,
            height: source.format.height,
        });
    }
    const plugins = resolvePlugins(getMetadataRuntime().pluginManager, source.episode.config.apps);
    const prepared = prepareTrackEpisode(source.ir, plugins, {
        config: METADATA_CONFIG,
        validate: true,
        log: false,
    });
    return prepared;
}
function rewriteAssetUrls(value, assetUrlMap, seen = new WeakMap()) {
    if (typeof value === "string") {
        return (assetUrlMap[value] ?? value);
    }
    if (!value || typeof value !== "object") {
        return value;
    }
    if (seen.has(value)) {
        return seen.get(value);
    }
    if (Array.isArray(value)) {
        const next = [];
        seen.set(value, next);
        for (const entry of value) {
            next.push(rewriteAssetUrls(entry, assetUrlMap, seen));
        }
        return next;
    }
    const next = {};
    seen.set(value, next);
    for (const [key, entry] of Object.entries(value)) {
        next[key] = rewriteAssetUrls(entry, assetUrlMap, seen);
    }
    return next;
}
function rewriteRenderDataAssetUrls(renderData, assetUrlMap) {
    return rewriteAssetUrls(renderData, assetUrlMap);
}
export function getEpisodeAssetRefs(episodeId) {
    const episode = getMetadataRuntime().episodeRegistry.get(episodeId);
    if (!episode) {
        throw new Error(`Episode not found: ${episodeId}`);
    }
    const source = buildEpisodeSource(episode);
    return preparePreparedEpisode(source).assetRefs;
}
function buildRenderDataCacheKey(renderData) {
    return `${renderData.episodeId}:${renderData.sourceSignature}:${renderData.prepared.eventSignature ?? "unknown"}`;
}
function cacheResolvedRenderData(renderData) {
    const cacheKey = buildRenderDataCacheKey(renderData);
    touchMapEntry(RENDER_DATA_BY_KEY, cacheKey, renderData);
    evictOldestEntries(RENDER_DATA_BY_KEY, MAX_RENDER_DATA_CACHE_ENTRIES);
    return cacheKey;
}
export function getCachedEpisodeRenderData(cacheKey) {
    if (!cacheKey) {
        return null;
    }
    const cached = RENDER_DATA_BY_KEY.get(cacheKey);
    if (!cached) {
        return null;
    }
    touchMapEntry(RENDER_DATA_BY_KEY, cacheKey, cached);
    return cached;
}
export async function primeEpisodeRenderData(episodeId, abortSignal) {
    const renderData = await getEpisodeRenderData(episodeId, abortSignal);
    return {
        cacheKey: cacheResolvedRenderData(renderData),
        durationInFrames: renderData.durationInFrames,
        format: renderData.format,
    };
}
export async function getEpisodeRenderData(episodeId, assetUrlMapOrAbortSignal, maybeAbortSignal) {
    const assetUrlMap = assetUrlMapOrAbortSignal && !isAbortSignal(assetUrlMapOrAbortSignal)
        ? assetUrlMapOrAbortSignal
        : undefined;
    const abortSignal = isAbortSignal(assetUrlMapOrAbortSignal)
        ? assetUrlMapOrAbortSignal
        : maybeAbortSignal;
    const episode = getMetadataRuntime().episodeRegistry.get(episodeId);
    if (!episode) {
        throw new Error(`Episode not found: ${episodeId}`);
    }
    const source = buildEpisodeSource(episode);
    if (assetUrlMap) {
        return prepareEpisodeRenderData(source, assetUrlMap, abortSignal);
    }
    const cacheId = `${source.episodeId}:${source.sourceSignature}`;
    const cached = RENDER_DATA_CACHE.get(cacheId);
    if (cached) {
        touchMapEntry(RENDER_DATA_CACHE, cacheId, cached);
        const renderData = await cached.value;
        cacheResolvedRenderData(renderData);
        return renderData;
    }
    const pending = prepareEpisodeRenderData(source, undefined, abortSignal);
    touchMapEntry(RENDER_DATA_CACHE, cacheId, {
        value: pending,
    });
    evictOldestEntries(RENDER_DATA_CACHE, MAX_RENDER_DATA_CACHE_ENTRIES);
    try {
        const renderData = await pending;
        cacheResolvedRenderData(renderData);
        touchMapEntry(RENDER_DATA_CACHE, cacheId, {
            value: Promise.resolve(renderData),
        });
        return renderData;
    }
    catch (error) {
        RENDER_DATA_CACHE.delete(cacheId);
        throw error;
    }
}
export function clearEpisodeRenderDataCaches() {
    RENDER_DATA_CACHE.clear();
    RENDER_DATA_BY_KEY.clear();
}
