import type { TrackEpisodeIR } from "@tokovo/ir";
import type {
  EpisodeAssetPrefetchStrategy,
  EpisodeAssetRef,
  RuntimeEvent,
  TokovoPlugin,
  WorldState,
} from "@tokovo/core";

type AssetSource = Extract<
  EpisodeAssetRef["source"],
  "ir" | "initial-world" | "runtime-event"
>;

type WalkContext = {
  owner: EpisodeAssetRef["owner"];
  source: AssetSource;
  appId?: string;
  fromFrame?: number;
  path: string[];
  fieldKey?: string;
  containerType?: string;
};

type AssetDescriptor = Pick<
  EpisodeAssetRef,
  "kind" | "usage" | "priority" | "strategy"
>;

const URL_PROTOCOL_PATTERN = /^(https?:\/\/|r2:\/\/|\/)/i;
const FILE_EXTENSION_PATTERN =
  /\.(png|jpe?g|webp|gif|svg|mp4|m4v|mov|webm|mp3|wav|m4a|ogg|aac|json)(\?.*)?$/i;

export function collectEpisodeAssetRefs(input: {
  ir: TrackEpisodeIR;
  initialWorld: WorldState;
  events: RuntimeEvent[];
  plugins: TokovoPlugin[];
}): EpisodeAssetRef[] {
  const refs: EpisodeAssetRef[] = [];

  refs.push(...collectSystemAssetRefs(input.ir));

  input.ir.appSnapshots.forEach((entry, index) => {
    walkAssetValue(
      entry.snapshot,
      {
        owner: "app",
        source: "ir",
        appId: entry.appId,
        fromFrame: 0,
        path: ["appSnapshots", String(index), entry.appId],
      },
      refs,
    );
  });

  walkAssetValue(
    input.initialWorld.devices,
    {
      owner: "system",
      source: "initial-world",
      fromFrame: 0,
      path: ["devices"],
    },
    refs,
  );

  for (const [appId, appState] of Object.entries(input.initialWorld.appState ?? {})) {
    walkAssetValue(
      appState,
      {
        owner: "app",
        source: "initial-world",
        appId,
        fromFrame: 0,
        path: ["appState", appId],
      },
      refs,
    );
  }

  for (const event of input.events) {
    if (event.kind !== "APP" || !("appId" in event) || !event.appId) {
      continue;
    }

    walkAssetValue(
      event.payload,
      {
        owner: "app",
        source: "runtime-event",
        appId: event.appId,
        fromFrame: event.at,
        path: ["events", event.appId, event.type],
      },
      refs,
    );
  }

  for (const plugin of input.plugins) {
    const pluginRefs = plugin.collectAssetRefs?.({
      appId: plugin.id,
      ir: input.ir,
      initialWorld: input.initialWorld,
      events: input.events,
    });

    if (!pluginRefs) {
      continue;
    }

    for (const ref of pluginRefs) {
      if (!isUsableAssetSource(ref.src)) {
        continue;
      }

      refs.push({
        ...ref,
        appId: ref.appId ?? plugin.id,
      });
    }
  }

  return dedupeEpisodeAssetRefs(refs);
}

function collectSystemAssetRefs(ir: TrackEpisodeIR): EpisodeAssetRef[] {
  const refs: EpisodeAssetRef[] = [];

  const backgroundConfig = ir.background;
  if (
    backgroundConfig &&
    typeof backgroundConfig === "object" &&
    (backgroundConfig.type === "image" || backgroundConfig.type === "video") &&
    typeof backgroundConfig.src === "string" &&
    isUsableAssetSource(backgroundConfig.src)
  ) {
    refs.push({
      id: "",
      src: backgroundConfig.src,
      kind: backgroundConfig.type,
      owner: "system",
      usage: "background",
      strategy: "eager",
      priority: 100,
      fromFrame: 0,
      source: "ir",
      path: "background.src",
    });
  }

  if (ir.voice?.audioPath && isUsableAssetSource(ir.voice.audioPath)) {
    refs.push({
      id: "",
      src: ir.voice.audioPath,
      kind: "audio",
      owner: "system",
      usage: "voice-audio",
      strategy: "eager",
      priority: 95,
      fromFrame: ir.voice.startFrame ?? 0,
      source: "ir",
      path: "voice.audioPath",
    });
  }

  if (ir.voice?.manifestPath && isUsableAssetSource(ir.voice.manifestPath)) {
    refs.push({
      id: "",
      src: ir.voice.manifestPath,
      kind: "json",
      owner: "system",
      usage: "voice-manifest",
      strategy: "none",
      priority: 5,
      fromFrame: 0,
      source: "ir",
      path: "voice.manifestPath",
    });
  }

  return refs;
}

function walkAssetValue(
  value: unknown,
  context: WalkContext,
  refs: EpisodeAssetRef[],
  seen = new WeakSet<object>(),
): void {
  if (typeof value === "string") {
    const inferred = inferAssetRef(value, context);
    if (inferred) {
      refs.push(inferred);
    }
    return;
  }

  if (!value || typeof value !== "object") {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((entry, index) => {
      walkAssetValue(
        entry,
        {
          ...context,
          path: [...context.path, String(index)],
        },
        refs,
        seen,
      );
    });
    return;
  }

  if (seen.has(value)) {
    return;
  }

  seen.add(value);

  const record = value as Record<string, unknown>;
  const containerType = getContainerType(record) ?? context.containerType;

  for (const [key, entry] of Object.entries(record)) {
    walkAssetValue(
      entry,
      {
        ...context,
        path: [...context.path, key],
        fieldKey: key,
        containerType,
      },
      refs,
      seen,
    );
  }
}

function inferAssetRef(
  src: string,
  context: WalkContext,
): EpisodeAssetRef | null {
  const descriptor = inferDescriptor(context);
  if (!descriptor || !isUsableAssetSource(src)) {
    return null;
  }

  return {
    id: "",
    src,
    kind: descriptor.kind,
    owner: context.owner,
    usage: descriptor.usage,
    appId: context.appId,
    fromFrame: context.fromFrame,
    strategy: descriptor.strategy,
    priority: descriptor.priority,
    source: context.source,
    path: context.path.join("."),
  };
}

function inferDescriptor(context: WalkContext): AssetDescriptor | null {
  const fieldKey = normalizeKey(context.fieldKey);
  const containerType = normalizeKey(context.containerType);
  const path = context.path.map(normalizeKey);
  const insideLinkPreview = path.includes("linkpreview") || path.includes("preview");

  switch (fieldKey) {
    case "avatar":
    case "avatarurl":
    case "contactavatarurl":
      return describeAsset("image", "avatar", context);
    case "wallpaper":
      return describeAsset("image", "wallpaper", context);
    case "image":
    case "imageurl":
    case "thumbnail":
    case "thumbnailurl":
      return describeAsset(
        "image",
        insideLinkPreview ? "link-preview" : "message-media",
        context,
      );
    case "mapthumbnailurl":
      return describeAsset("image", "map", context);
    case "favicon":
      return describeAsset("image", "link-preview", context);
    case "video":
    case "videourl":
      return describeAsset("video", "message-media", context);
    case "gif":
    case "gifurl":
      return describeAsset("gif", "message-media", context);
    case "sticker":
    case "stickerurl":
      return describeAsset("image", "sticker", context);
    case "audiopath":
    case "audiofile":
      return describeAsset(
        "audio",
        context.owner === "system" ? "voice-audio" : "message-media",
        context,
      );
    case "voice":
    case "voiceurl":
      return describeAsset("audio", "message-media", context);
    case "manifestpath":
      return describeAsset("json", "voice-manifest", context);
    case "documenturl":
      return describeAsset("unknown", "document", context);
    case "src":
    case "url":
    case "urls":
      return describeContainerAsset(containerType, context, insideLinkPreview);
    default:
      return null;
  }
}

function describeContainerAsset(
  containerType: string,
  context: WalkContext,
  insideLinkPreview: boolean,
): AssetDescriptor | null {
  switch (containerType) {
    case "image":
      return describeAsset(
        "image",
        insideLinkPreview ? "link-preview" : "message-media",
        context,
      );
    case "video":
      return describeAsset("video", "message-media", context);
    case "gif":
      return describeAsset("gif", "message-media", context);
    case "sticker":
      return describeAsset("image", "sticker", context);
    case "voice":
    case "audio":
      return describeAsset("audio", "message-media", context);
    default:
      return null;
  }
}

function describeAsset(
  kind: EpisodeAssetRef["kind"],
  usage: EpisodeAssetRef["usage"],
  context: WalkContext,
): AssetDescriptor {
  return {
    kind,
    usage,
    priority: getUsagePriority(usage, kind),
    strategy: chooseStrategy({
      kind,
      usage,
      owner: context.owner,
      source: context.source,
    }),
  };
}

function chooseStrategy(input: {
  kind: EpisodeAssetRef["kind"];
  usage: EpisodeAssetRef["usage"];
  owner: EpisodeAssetRef["owner"];
  source: EpisodeAssetRef["source"];
}): EpisodeAssetPrefetchStrategy {
  if (
    input.kind === "json" ||
    input.kind === "unknown" ||
    input.usage === "voice-manifest" ||
    input.usage === "document"
  ) {
    return "none";
  }

  if (input.owner === "system") {
    return "eager";
  }

  if (input.source === "initial-world" || input.source === "ir") {
    if (input.usage === "avatar" || input.usage === "wallpaper") {
      return "eager";
    }

    return "none";
  }

  return "lookahead";
}

function getUsagePriority(
  usage: EpisodeAssetRef["usage"],
  kind: EpisodeAssetRef["kind"],
): number {
  switch (usage) {
    case "background":
      return 100;
    case "voice-audio":
      return 95;
    case "wallpaper":
      return 90;
    case "avatar":
      return 80;
    case "message-media":
      switch (kind) {
        case "video":
          return 72;
        case "audio":
          return 68;
        case "gif":
          return 66;
        default:
          return 64;
      }
    case "sticker":
      return 60;
    case "link-preview":
      return 54;
    case "map":
      return 48;
    case "document":
      return 8;
    case "voice-manifest":
      return 5;
    default:
      return 20;
  }
}

function dedupeEpisodeAssetRefs(refs: EpisodeAssetRef[]): EpisodeAssetRef[] {
  const merged = new Map<string, EpisodeAssetRef>();

  for (const ref of refs) {
    const key = ref.src;
    const existing = merged.get(key);

    if (!existing) {
      merged.set(key, ref);
      continue;
    }

    merged.set(key, mergeAssetRefs(existing, ref));
  }

  return Array.from(merged.values())
    .sort(compareAssetRefs)
    .map((ref) => ({
      ...ref,
      id: ref.id || buildAssetId(ref),
    }));
}

function mergeAssetRefs(
  current: EpisodeAssetRef,
  incoming: EpisodeAssetRef,
): EpisodeAssetRef {
  const currentRank = getStrategyRank(current.strategy);
  const incomingRank = getStrategyRank(incoming.strategy);
  const preferIncoming =
    incoming.priority > current.priority ||
    incomingRank > currentRank ||
    (current.kind === "unknown" && incoming.kind !== "unknown");

  return {
    ...(preferIncoming ? current : incoming),
    ...(preferIncoming ? incoming : current),
    id: current.id || incoming.id,
    src: current.src,
    kind: preferIncoming ? incoming.kind : current.kind,
    owner: preferIncoming ? incoming.owner : current.owner,
    usage: preferIncoming ? incoming.usage : current.usage,
    appId: current.appId ?? incoming.appId,
    fromFrame:
      current.fromFrame === undefined
        ? incoming.fromFrame
        : incoming.fromFrame === undefined
          ? current.fromFrame
          : Math.min(current.fromFrame, incoming.fromFrame),
    toFrame:
      current.toFrame === undefined
        ? incoming.toFrame
        : incoming.toFrame === undefined
          ? current.toFrame
          : Math.max(current.toFrame, incoming.toFrame),
    strategy: incomingRank > currentRank ? incoming.strategy : current.strategy,
    priority: Math.max(current.priority, incoming.priority),
    source: preferIncoming ? incoming.source : current.source,
    path: current.path ?? incoming.path,
  };
}

function compareAssetRefs(a: EpisodeAssetRef, b: EpisodeAssetRef): number {
  if (a.priority !== b.priority) {
    return b.priority - a.priority;
  }

  if (a.fromFrame !== b.fromFrame) {
    return (a.fromFrame ?? Number.MAX_SAFE_INTEGER) -
      (b.fromFrame ?? Number.MAX_SAFE_INTEGER);
  }

  if (a.strategy !== b.strategy) {
    return getStrategyRank(b.strategy) - getStrategyRank(a.strategy);
  }

  return a.src.localeCompare(b.src);
}

function getStrategyRank(strategy: EpisodeAssetPrefetchStrategy): number {
  switch (strategy) {
    case "eager":
      return 2;
    case "lookahead":
      return 1;
    default:
      return 0;
  }
}

function buildAssetId(ref: EpisodeAssetRef): string {
  return `asset-${hashString(
    [
      ref.src,
      ref.owner,
      ref.appId ?? "system",
      ref.usage,
      ref.kind,
      ref.fromFrame ?? -1,
    ].join("|"),
  )}`;
}

function hashString(value: string): string {
  let hash = 0x811c9dc5;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return (hash >>> 0).toString(16).padStart(8, "0");
}

function getContainerType(record: Record<string, unknown>): string | undefined {
  if (typeof record.kind === "string") {
    return record.kind;
  }

  if (typeof record.type === "string") {
    return record.type;
  }

  return undefined;
}

function normalizeKey(value: string | undefined): string {
  return (value ?? "").replace(/[^a-z0-9]/gi, "").toLowerCase();
}

function isUsableAssetSource(src: string): boolean {
  if (!src || src.startsWith("data:") || src.startsWith("blob:")) {
    return false;
  }

  return URL_PROTOCOL_PATTERN.test(src) || FILE_EXTENSION_PATTERN.test(src);
}
