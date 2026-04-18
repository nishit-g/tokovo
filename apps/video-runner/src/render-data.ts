import { staticFile } from "remotion";
import {
  prepareTrackEpisode,
  type PreparedTrackEpisode,
} from "@tokovo/compiler";
import {
  createConfig,
  resolveStaticAssetSrc,
  type EpisodeAssetRef,
} from "@tokovo/core";
import type { BackgroundConfigIR, VoiceConfig } from "@tokovo/ir";
import { ensureCanvasProfile, resolveCanvasProfileId } from "@tokovo/devices";
import {
  getFormat,
  type EpisodeDefinition,
  type FormatId,
} from "@tokovo/episodes";
import type { PluginManagerClass } from "@tokovo/react";
import {
  type ReactionPlan,
} from "@tokovo/reactions";
import type { VoiceManifest } from "@tokovo/voice";
import { getSharedVideoRunnerRuntime } from "./runtime";

type SerializablePreparedEpisode = Pick<
  PreparedTrackEpisode,
  | "id"
  | "fps"
  | "durationInFrames"
  | "events"
  | "keyframeInterval"
  | "eventSignature"
  | "initialWorld"
  | "assetRefs"
  | "metadata"
>;

export type EpisodeRenderData = {
  episodeId: string;
  sourceSignature: string;
  durationInFrames: number;
  format: {
    width: number;
    height: number;
    fps: number;
  };
  prepared: SerializablePreparedEpisode;
  backgroundConfig: BackgroundConfigIR | null;
  voiceConfig: VoiceConfig | null;
  voiceManifest: VoiceManifest | null;
  reactionPlan: ReactionPlan | null;
};

type AssetUrlMap = Record<string, string>;

export type EpisodeRenderDataHandle = {
  cacheKey: string;
  durationInFrames: number;
  format: EpisodeRenderData["format"];
};

type RenderDataCacheEntry = {
  value: Promise<EpisodeRenderData>;
};

type BuiltEpisodeSource = {
  episodeId: string;
  sourceSignature: string;
  episode: EpisodeDefinition;
  format: EpisodeRenderData["format"];
  ir: ReturnType<EpisodeDefinition["build"]>;
};

const MAX_RENDER_DATA_CACHE_ENTRIES = 8;
const METADATA_CONFIG = createConfig();
const RENDER_DATA_CACHE = new Map<string, RenderDataCacheEntry>();
const RENDER_DATA_BY_KEY = new Map<string, EpisodeRenderData>();

function getMetadataRuntime() {
  return getSharedVideoRunnerRuntime();
}

function stableSerialize(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableSerialize(entry)).join(",")}]`;
  }

  const record = value as Record<string, unknown>;
  const entries = Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableSerialize(record[key])}`);

  return `{${entries.join(",")}}`;
}

function hashString(value: string): string {
  let hash = 0x811c9dc5;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return (hash >>> 0).toString(16).padStart(8, "0");
}

function buildEpisodeSourceSignature(
  episode: EpisodeDefinition,
  format: EpisodeRenderData["format"],
  ir: ReturnType<EpisodeDefinition["build"]>,
): string {
  return hashString(
    stableSerialize({
      episodeId: episode.meta.id,
      apps: episode.config.apps,
      durationInFrames: episode.config.durationInFrames,
      format,
      ir,
    }),
  );
}

function touchMapEntry<K, V>(map: Map<K, V>, key: K, value: V): void {
  map.delete(key);
  map.set(key, value);
}

function evictOldestEntries<K, V>(map: Map<K, V>, maxSize: number): void {
  while (map.size > maxSize) {
    const oldestKey = map.keys().next().value;
    if (oldestKey === undefined) {
      return;
    }
    map.delete(oldestKey);
  }
}

function resolvePlugins(
  pluginManager: PluginManagerClass,
  appIds: string[],
) {
  const missing: string[] = [];
  const plugins = appIds
    .map((appId) => {
      const plugin = pluginManager.get(appId);
      if (!plugin) {
        missing.push(appId);
      }
      return plugin;
    })
    .filter(
      (plugin): plugin is NonNullable<typeof plugin> => plugin !== undefined,
    );

  if (missing.length > 0) {
    throw new Error(
      `[Video-Runner] Missing plugins for appIds: ${missing.join(", ")}`,
    );
  }

  return plugins;
}

function serializePreparedEpisode(
  prepared: PreparedTrackEpisode,
  reactionAssetRefs: EpisodeAssetRef[] = [],
): SerializablePreparedEpisode {
  return {
    id: prepared.id,
    fps: prepared.fps,
    durationInFrames: prepared.durationInFrames,
    events: prepared.events,
    keyframeInterval: prepared.keyframeInterval,
    eventSignature: prepared.eventSignature,
    initialWorld: prepared.initialWorld,
    assetRefs: [...prepared.assetRefs, ...reactionAssetRefs],
    metadata: prepared.metadata,
  };
}

function getReactionPlanAssetRefs(
  plan: ReactionPlan | null | undefined,
): EpisodeAssetRef[] {
  if (!plan) {
    return [];
  }

  const createReactionAssetRef = (
    memberId: string,
    src: string,
    path: string,
    kind: EpisodeAssetRef["kind"] = "image",
  ): EpisodeAssetRef => ({
    id: `reaction_avatar_${memberId}_${path.split(".").at(-1) ?? "asset"}`,
    src,
    kind,
    owner: "system",
    usage: "avatar",
    fromFrame: 0,
    strategy: "lookahead",
    priority: 60,
    source: "ir",
    path,
  });

  return plan.cast.flatMap((member) => {
    const avatar = member.visualProfile.avatar;

    if (avatar?.kind === "image") {
      return [
        createReactionAssetRef(
          member.id,
          avatar.imageSrc,
          `reactionPlan.cast.${member.id}.visualProfile.avatar.imageSrc`,
        ),
      ];
    }

    if (avatar?.kind === "pngtuber") {
      return [
        ...Object.entries(avatar.frames).flatMap(([frameKey, src]) =>
          src
            ? [
                createReactionAssetRef(
                  member.id,
                  src,
                  `reactionPlan.cast.${member.id}.visualProfile.avatar.frames.${frameKey}`,
                ),
              ]
            : [],
        ),
        ...(avatar.videoSrc
          ? [
              createReactionAssetRef(
                member.id,
                avatar.videoSrc,
                `reactionPlan.cast.${member.id}.visualProfile.avatar.videoSrc`,
                "video",
              ),
            ]
          : []),
        ...(avatar.mouthTrackSrc
          ? [
              createReactionAssetRef(
                member.id,
                avatar.mouthTrackSrc,
                `reactionPlan.cast.${member.id}.visualProfile.avatar.mouthTrackSrc`,
                "json",
              ),
            ]
          : []),
        ...Object.entries(avatar.mouthSprites ?? {}).flatMap(([shapeKey, src]) =>
          src
            ? [
                createReactionAssetRef(
                  member.id,
                  src,
                  `reactionPlan.cast.${member.id}.visualProfile.avatar.mouthSprites.${shapeKey}`,
                ),
              ]
            : [],
        ),
      ];
    }

    if (avatar?.kind === "live2d") {
      return [
        createReactionAssetRef(
          member.id,
          avatar.coreScriptSrc,
          `reactionPlan.cast.${member.id}.visualProfile.avatar.coreScriptSrc`,
          "unknown",
        ),
        createReactionAssetRef(
          member.id,
          avatar.modelJsonSrc,
          `reactionPlan.cast.${member.id}.visualProfile.avatar.modelJsonSrc`,
          "json",
        ),
        ...(avatar.previewPosterSrc
          ? [
              createReactionAssetRef(
                member.id,
                avatar.previewPosterSrc,
                `reactionPlan.cast.${member.id}.visualProfile.avatar.previewPosterSrc`,
              ),
            ]
          : []),
      ];
    }

    const legacySrc = member.visualProfile.avatarImageSrc;
    return legacySrc
      ? [
          createReactionAssetRef(
            member.id,
            legacySrc,
            `reactionPlan.cast.${member.id}.visualProfile.avatarImageSrc`,
          ),
        ]
      : [];
  });
}

function buildEmbeddedVoiceManifest(
  episodeId: string,
  voiceConfig: VoiceConfig,
): VoiceManifest | null {
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

async function loadVoiceManifest(
  episodeId: string,
  voiceConfig: VoiceConfig | undefined,
  assetUrlMap?: AssetUrlMap,
  abortSignal?: AbortSignal,
): Promise<VoiceManifest | null> {
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

  const manifestUrl =
    assetUrlMap?.[voiceConfig.manifestPath] ??
    resolveStaticAssetSrc(voiceConfig.manifestPath, staticFile);
  const manifestResponse = await fetch(manifestUrl, {
    signal: abortSignal,
  });
  if (!manifestResponse.ok) {
    throw new Error(
      `Voice manifest failed to load: ${voiceConfig.manifestPath} (HTTP ${manifestResponse.status})`,
    );
  }

  return (await manifestResponse.json()) as VoiceManifest;
}

function buildEpisodeSource(episode: EpisodeDefinition): BuiltEpisodeSource {
  const format =
    typeof episode.config.format === "string"
      ? getFormat(episode.config.format as FormatId)
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

function isAbortSignal(value: unknown): value is AbortSignal {
  return (
    !!value &&
    typeof value === "object" &&
    "aborted" in value &&
    typeof (value as AbortSignal).aborted === "boolean"
  );
}

async function prepareEpisodeRenderData(
  source: BuiltEpisodeSource,
  assetUrlMap?: AssetUrlMap,
  abortSignal?: AbortSignal,
): Promise<EpisodeRenderData> {
  const prepared = preparePreparedEpisode(source);
  const voiceConfig = source.ir.voice ?? null;
  const reactionPlan = source.ir.reactionPlan ?? null;
  const reactionAssetRefs = getReactionPlanAssetRefs(reactionPlan);
  const voiceManifest = await loadVoiceManifest(
    source.episodeId,
    source.ir.voice,
    assetUrlMap,
    abortSignal,
  );

  const renderData: EpisodeRenderData = {
    episodeId: source.episodeId,
    sourceSignature: source.sourceSignature,
    durationInFrames: prepared.durationInFrames,
    format: source.format,
    prepared: serializePreparedEpisode(prepared, reactionAssetRefs),
    backgroundConfig: source.ir.background ?? null,
    voiceConfig,
    voiceManifest,
    reactionPlan,
  };

  return assetUrlMap
    ? rewriteRenderDataAssetUrls(renderData, assetUrlMap)
    : renderData;
}

function preparePreparedEpisode(
  source: BuiltEpisodeSource,
): PreparedTrackEpisode {
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

  const plugins = resolvePlugins(
    getMetadataRuntime().pluginManager,
    source.episode.config.apps,
  );
  const prepared = prepareTrackEpisode(source.ir, plugins, {
    config: METADATA_CONFIG,
    validate: true,
    log: false,
  });

  return prepared;
}

function rewriteAssetUrls<T>(
  value: T,
  assetUrlMap: AssetUrlMap,
  seen = new WeakMap<object, unknown>(),
): T {
  if (typeof value === "string") {
    return (assetUrlMap[value] ?? value) as T;
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  if (seen.has(value as object)) {
    return seen.get(value as object) as T;
  }

  if (Array.isArray(value)) {
    const next: unknown[] = [];
    seen.set(value, next);
    for (const entry of value) {
      next.push(rewriteAssetUrls(entry, assetUrlMap, seen));
    }
    return next as T;
  }

  const next: Record<string, unknown> = {};
  seen.set(value as object, next);
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    next[key] = rewriteAssetUrls(entry, assetUrlMap, seen);
  }
  return next as T;
}

function rewriteRenderDataAssetUrls(
  renderData: EpisodeRenderData,
  assetUrlMap: AssetUrlMap,
): EpisodeRenderData {
  return rewriteAssetUrls(renderData, assetUrlMap);
}

export function getEpisodeAssetRefs(episodeId: string): EpisodeAssetRef[] {
  const episode = getMetadataRuntime().episodeRegistry.get(episodeId);
  if (!episode) {
    throw new Error(`Episode not found: ${episodeId}`);
  }

  const source = buildEpisodeSource(episode);
  return preparePreparedEpisode(source).assetRefs;
}

function buildRenderDataCacheKey(renderData: EpisodeRenderData): string {
  return `${renderData.episodeId}:${renderData.sourceSignature}:${renderData.prepared.eventSignature ?? "unknown"}`;
}

function cacheResolvedRenderData(renderData: EpisodeRenderData): string {
  const cacheKey = buildRenderDataCacheKey(renderData);
  touchMapEntry(RENDER_DATA_BY_KEY, cacheKey, renderData);
  evictOldestEntries(RENDER_DATA_BY_KEY, MAX_RENDER_DATA_CACHE_ENTRIES);
  return cacheKey;
}

export function getCachedEpisodeRenderData(
  cacheKey: string | null | undefined,
): EpisodeRenderData | null {
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

export async function primeEpisodeRenderData(
  episodeId: string,
  abortSignal?: AbortSignal,
): Promise<EpisodeRenderDataHandle> {
  const renderData = await getEpisodeRenderData(episodeId, abortSignal);
  return {
    cacheKey: cacheResolvedRenderData(renderData),
    durationInFrames: renderData.durationInFrames,
    format: renderData.format,
  };
}

export async function getEpisodeRenderData(
  episodeId: string,
  assetUrlMapOrAbortSignal?: AssetUrlMap | AbortSignal,
  maybeAbortSignal?: AbortSignal,
): Promise<EpisodeRenderData> {
  const assetUrlMap =
    assetUrlMapOrAbortSignal && !isAbortSignal(assetUrlMapOrAbortSignal)
      ? assetUrlMapOrAbortSignal
      : undefined;
  const abortSignal =
    isAbortSignal(assetUrlMapOrAbortSignal)
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
  } catch (error) {
    RENDER_DATA_CACHE.delete(cacheId);
    throw error;
  }
}

export function clearEpisodeRenderDataCaches(): void {
  RENDER_DATA_CACHE.clear();
  RENDER_DATA_BY_KEY.clear();
}
