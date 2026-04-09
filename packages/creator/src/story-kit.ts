import type { UserCreatePayload } from "@tokovo/apps-x";
import type { BackgroundConfigIR, ConversationConfig, DeviceConfig } from "@tokovo/ir";
import type {
  AssetBucketName,
  AssetPack,
  DeviceKit,
  DeviceKitEntry,
  PackRegistry,
  Persona,
  PersonaPack,
  StyleKit,
} from "@tokovo/packs";

const ASSET_BUCKETS: readonly AssetBucketName[] = [
  "avatars",
  "wallpapers",
  "backgrounds",
  "media",
  "maps",
  "docs",
  "stickers",
  "linkPreviewImages",
  "profileBanners",
] as const;

export const KNOWN_APP_IDS = new Set<string>([
  "app_whatsapp",
  "app_imessage",
  "app_x",
  "app_linkedin",
  "app_snapchat",
  "app_teams",
  "app_typewriter",
]);

export interface StoryStyleOverrides {
  appThemes?: Readonly<Record<string, string>>;
  appVisualModes?: Readonly<Record<string, string>>;
  appStyles?: Readonly<
    Record<string, Readonly<Record<string, string | number | boolean>>>
  >;
}

export interface CastEntry {
  persona: string;
  device?: string;
  overrides?: Partial<Pick<Persona, "name" | "handle" | "bio" | "voice" | "traits">>;
  appOverrides?: Readonly<Record<string, Readonly<Record<string, unknown>>>>;
  assetOverrides?: {
    avatar?: string;
  };
  styleOverrides?: StoryStyleOverrides;
}

export type CastMap = Readonly<Record<string, CastEntry>>;

export interface StoryDeviceOverride {
  app?: string;
  profile?: string;
  installedApps?: readonly string[];
  homeScreen?: DeviceConfig["homeScreen"];
  screenRecording?: boolean;
  styleRef?: string;
  wallpaper?: string;
  styleOverrides?: StoryStyleOverrides;
}

export interface StoryKitConfig {
  personaPackId?: string;
  assetPackId?: string;
  styleKitId?: string;
  deviceKitId?: string;
  cast: CastMap;
  devices: Readonly<Record<string, StoryDeviceOverride>>;
  background?: BackgroundConfigIR;
  appThemeDefaults?: Readonly<Record<string, string>>;
}

export interface StoryKitPackRefs {
  personas?: string;
  assets?: string;
  styles?: string;
  devices?: string;
}

export interface StoryKitStudioConfig {
  id: string;
  title: string;
  packs: StoryKitPackRefs;
  cast: CastMap;
  devices: Readonly<Record<string, StoryDeviceOverride>>;
  background?: BackgroundConfigIR;
  appThemeDefaults?: Readonly<Record<string, string>>;
  notes?: string;
}

export interface ResolvedActor {
  role: string;
  personaId: string;
  deviceId?: string;
  name: string;
  handle: string;
  bio: string;
  avatar: string;
  voice?: string;
  traits?: readonly string[];
  defaultAppMetadata?: Readonly<Record<string, Readonly<Record<string, unknown>>>>;
}

export interface ResolvedStyle {
  theme?: string;
  visualMode?: string;
  style?: Readonly<Record<string, string | number | boolean>>;
}

export interface ResolvedDevice {
  id: string;
  profile: string;
  app: string;
  installedApps?: readonly string[];
  homeScreen?: DeviceConfig["homeScreen"];
  screenRecording?: boolean;
  theme?: string;
}

export interface StoryXUserProjectionOverrides extends Partial<UserCreatePayload> { }

export interface StoryLinkedInUserProjection {
  id: string;
  name: string;
  handle: string;
  headline?: string;
  avatarUrl?: string;
  connections?: number;
  followers?: number;
}

export interface StoryLinkedInUserProjectionOverrides
  extends Partial<StoryLinkedInUserProjection> { }

export interface StoryWhatsAppConversationProjection
  extends Omit<ConversationConfig, "participants" | "avatar"> {
  participants?: readonly string[];
  participantRoles?: readonly string[];
  avatar?: string;
  avatarRole?: string;
  avatarAsset?: string;
}

export interface StoryConversationProjection
  extends Omit<ConversationConfig, "participants" | "avatar"> {
  participants?: readonly string[];
  participantRoles?: readonly string[];
  avatar?: string;
  avatarRole?: string;
  avatarAsset?: string;
}

export interface StoryProjectedDeviceConfig {
  profile: string;
  options: Omit<DeviceConfig, "id" | "profile">;
}

export interface StoryDeviceProjectionOverrides
  extends Partial<Omit<DeviceConfig, "id">> { }

export interface StoryProjectionHelpers {
  xUser(role: string, overrides?: StoryXUserProjectionOverrides): UserCreatePayload;
  linkedinUser(
    role: string,
    overrides?: StoryLinkedInUserProjectionOverrides,
  ): StoryLinkedInUserProjection;
  whatsappConversation(input: StoryWhatsAppConversationProjection): ConversationConfig;
  imessageConversation(input: StoryConversationProjection): ConversationConfig;
  snapchatConversation(input: StoryConversationProjection): ConversationConfig;
  device(
    deviceId: string,
    overrides?: StoryDeviceProjectionOverrides,
  ): StoryProjectedDeviceConfig;
}

export interface ResolvedStoryKit {
  personaPack?: PersonaPack;
  assetPack?: AssetPack;
  styleKit?: StyleKit;
  deviceKit?: DeviceKit;
  background?: BackgroundConfigIR;
  warnings: readonly string[];
  actors: Readonly<Record<string, ResolvedActor>>;
  devices: Readonly<Record<string, ResolvedDevice>>;
  actor(role: string): ResolvedActor;
  asset(alias: string, bucket?: AssetBucketName): string;
  device(deviceId: string): ResolvedDevice;
  style(appId: string): ResolvedStyle;
  project: StoryProjectionHelpers;
}

function storyKitError(message: string): Error {
  return new Error(`[StoryKit] ${message}`);
}

type ExistsSyncFn = (targetPath: string) => boolean;
type PathResolveFn = (...parts: string[]) => string;

let cachedExistsSync: ExistsSyncFn | null | undefined;
let cachedPathResolve: PathResolveFn | null | undefined;

function isNodeRuntime(): boolean {
  const g = globalThis as {
    process?: {
      versions?: { node?: string };
      cwd?: () => string;
      mainModule?: { require?: (id: string) => unknown };
    };
    require?: (id: string) => unknown;
  };
  return Boolean(g.process?.versions?.node);
}

function getCommonJSRequire():
  | ((id: string) => unknown)
  | undefined {
  const g = globalThis as {
    process?: { mainModule?: { require?: (id: string) => unknown } };
    require?: (id: string) => unknown;
  };
  if (typeof g.require === "function") return g.require;
  if (typeof g.process?.mainModule?.require === "function") {
    return g.process.mainModule.require.bind(g.process.mainModule);
  }
  return undefined;
}

function getExistsSync(): ExistsSyncFn | undefined {
  if (cachedExistsSync !== undefined) return cachedExistsSync ?? undefined;
  if (!isNodeRuntime()) {
    cachedExistsSync = null;
    return undefined;
  }
  const req = getCommonJSRequire();
  if (!req) {
    cachedExistsSync = null;
    return undefined;
  }
  try {
    const fsModule = req("fs") as { existsSync?: ExistsSyncFn };
    cachedExistsSync =
      typeof fsModule.existsSync === "function" ? fsModule.existsSync : null;
  } catch {
    cachedExistsSync = null;
  }
  return cachedExistsSync ?? undefined;
}

function getPathResolve(): PathResolveFn | undefined {
  if (cachedPathResolve !== undefined) return cachedPathResolve ?? undefined;
  if (!isNodeRuntime()) {
    cachedPathResolve = null;
    return undefined;
  }
  const req = getCommonJSRequire();
  if (!req) {
    cachedPathResolve = null;
    return undefined;
  }
  try {
    const pathModule = req("path") as { resolve?: PathResolveFn };
    cachedPathResolve =
      typeof pathModule.resolve === "function" ? pathModule.resolve : null;
  } catch {
    cachedPathResolve = null;
  }
  return cachedPathResolve ?? undefined;
}

function getCwd(): string | undefined {
  const g = globalThis as { process?: { cwd?: () => string } };
  return typeof g.process?.cwd === "function" ? g.process.cwd() : undefined;
}

function resolveAgainstCwd(relativePath: string): string {
  const cwd = getCwd();
  if (!cwd) return relativePath;
  const resolve = getPathResolve();
  if (resolve) return resolve(cwd, relativePath);

  const normalizedCwd = cwd.endsWith("/") ? cwd.slice(0, -1) : cwd;
  const normalizedRelative = relativePath.replace(/^\.\//, "");
  return `${normalizedCwd}/${normalizedRelative}`;
}

function assertPathExists(targetPath: string, context: string): void {
  const exists = getExistsSync();
  // Browser-bundled environments cannot reliably check local filesystem paths.
  if (!exists) return;
  if (!exists(targetPath)) {
    throw storyKitError(`Missing file path for ${context}: "${targetPath}"`);
  }
}

function parseAssetReference(ref: string): {
  bucket?: AssetBucketName;
  alias: string;
} {
  const i = ref.indexOf(":");
  if (i <= 0) {
    return { alias: ref };
  }
  const bucket = ref.slice(0, i) as AssetBucketName;
  const alias = ref.slice(i + 1);
  if (ASSET_BUCKETS.includes(bucket)) {
    return { bucket, alias };
  }
  return { alias: ref };
}

function validateResolvablePath(value: string, context: string): void {
  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:")
  ) {
    return;
  }

  if (value.startsWith("/Users/") || value.startsWith("/tmp/")) {
    assertPathExists(value, context);
    return;
  }

  if (value.startsWith("file://")) {
    const localPath = value.slice("file://".length);
    assertPathExists(localPath, context);
    return;
  }

  if (value.startsWith("./") || value.startsWith("../")) {
    assertPathExists(resolveAgainstCwd(value), context);
  }
}

function validateStyleAppRefs(style: StoryStyleOverrides | undefined, context: string): void {
  if (!style) return;
  const maps = [style.appThemes, style.appVisualModes, style.appStyles];
  for (const map of maps) {
    if (!map) continue;
    for (const appId of Object.keys(map)) {
      if (!KNOWN_APP_IDS.has(appId)) {
        throw storyKitError(`Unknown style app ref "${appId}" in ${context}`);
      }
    }
  }
}

function findAliasByValue(assetPack: AssetPack, value: string): string | undefined {
  for (const bucket of ASSET_BUCKETS) {
    for (const [alias, candidate] of Object.entries(assetPack.assets[bucket])) {
      if (candidate === value) {
        return `${bucket}:${alias}`;
      }
    }
  }
  return undefined;
}

function resolveAssetRef(
  assetPack: AssetPack | undefined,
  registry: PackRegistry,
  ref: string | undefined,
  bucketHint: AssetBucketName | undefined,
  context: string,
): string | undefined {
  if (!ref) return undefined;

  if (assetPack) {
    const parsed = parseAssetReference(ref);
    if (parsed.bucket) {
      const hit = registry.resolveAsset(assetPack.id, parsed.bucket, parsed.alias);
      if (!hit) {
        throw storyKitError(
          `Unknown asset alias "${parsed.bucket}:${parsed.alias}" for ${context}`,
        );
      }
      return hit;
    }
    if (bucketHint) {
      const hit = registry.resolveAsset(assetPack.id, bucketHint, parsed.alias);
      if (hit) return hit;
    }
  }

  validateResolvablePath(ref, context);
  return ref;
}

function toHomeScreenPreset(
  preset: string | undefined,
): DeviceConfig["homeScreen"] | undefined {
  if (!preset) return undefined;
  if (preset === "ios-default" || preset === "android-default") {
    return { preset };
  }
  return undefined;
}

function asObjectRecord(
  value: unknown,
): Readonly<Record<string, unknown>> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }
  return value as Readonly<Record<string, unknown>>;
}

function normalizeXVerified(
  value: unknown,
): UserCreatePayload["verified"] | undefined {
  if (value === null) return null;
  if (value === true) return "blue";
  if (value === false) return null;
  if (value === "blue" || value === "gold" || value === "grey") {
    return value;
  }
  return undefined;
}

function toXUserProjection(
  actor: ResolvedActor,
  overrides?: StoryXUserProjectionOverrides,
): UserCreatePayload {
  const metadata = asObjectRecord(actor.defaultAppMetadata?.["app_x"]);
  const followerCount =
    typeof metadata?.followers === "number"
      ? metadata.followers
      : typeof metadata?.followerCount === "number"
        ? metadata.followerCount
        : undefined;
  const followingCount =
    typeof metadata?.following === "number"
      ? metadata.following
      : typeof metadata?.followingCount === "number"
        ? metadata.followingCount
        : undefined;
  const avatarUrl =
    typeof metadata?.avatarUrl === "string"
      ? metadata.avatarUrl
      : typeof metadata?.avatar === "string"
        ? metadata.avatar
        : undefined;

  return {
    id: actor.personaId,
    name: actor.name,
    handle: actor.handle,
    bio: actor.bio,
    avatarUrl: actor.avatar,
    followers: followerCount,
    following: followingCount,
    verified: normalizeXVerified(metadata?.verified),
    ...(avatarUrl ? { avatarUrl } : {}),
    ...overrides,
  };
}

function toLinkedInUserProjection(
  actor: ResolvedActor,
  overrides?: StoryLinkedInUserProjectionOverrides,
): StoryLinkedInUserProjection {
  const metadata = asObjectRecord(actor.defaultAppMetadata?.["app_linkedin"]);

  return {
    id: actor.personaId,
    name: actor.name,
    handle: actor.handle,
    headline:
      typeof metadata?.headline === "string" ? metadata.headline : actor.bio,
    avatarUrl:
      typeof metadata?.avatarUrl === "string" ? metadata.avatarUrl : actor.avatar,
    connections:
      typeof metadata?.connections === "number" ? metadata.connections : undefined,
    followers:
      typeof metadata?.followers === "number" ? metadata.followers : undefined,
    ...overrides,
  };
}

function toConversationProjection(
  actorFor: (role: string) => ResolvedActor,
  assetFor: (alias: string, bucket?: AssetBucketName) => string,
  input: StoryConversationProjection,
): ConversationConfig {
  const {
    participants: rawParticipants,
    participantRoles,
    avatar: rawAvatar,
    avatarRole,
    avatarAsset,
    ...conversation
  } = input;

  if (rawParticipants && participantRoles) {
    throw storyKitError(
      `Conversation "${input.id}" cannot specify both participants and participantRoles`,
    );
  }

  const avatarSources = [rawAvatar, avatarRole, avatarAsset].filter(
    (value) => value !== undefined,
  );
  if (avatarSources.length > 1) {
    throw storyKitError(
      `Conversation "${input.id}" cannot specify more than one avatar source`,
    );
  }

  const participants = participantRoles
    ? participantRoles.map((role) => actorFor(role).name)
    : rawParticipants
      ? [...rawParticipants]
      : undefined;

  const avatar = avatarRole
    ? actorFor(avatarRole).avatar
    : avatarAsset
      ? assetFor(avatarAsset, "avatars")
      : rawAvatar;

  return {
    ...conversation,
    participants,
    avatar,
  };
}

function deepMergeStyle(
  packStyle: StoryStyleOverrides | undefined,
  castStyle: StoryStyleOverrides | undefined,
  deviceStyle: StoryStyleOverrides | undefined,
): StoryStyleOverrides | undefined {
  if (!packStyle && !castStyle && !deviceStyle) return undefined;
  return {
    appThemes: {
      ...(packStyle?.appThemes ?? {}),
      ...(castStyle?.appThemes ?? {}),
      ...(deviceStyle?.appThemes ?? {}),
    },
    appVisualModes: {
      ...(packStyle?.appVisualModes ?? {}),
      ...(castStyle?.appVisualModes ?? {}),
      ...(deviceStyle?.appVisualModes ?? {}),
    },
    appStyles: {
      ...(packStyle?.appStyles ?? {}),
      ...(castStyle?.appStyles ?? {}),
      ...(deviceStyle?.appStyles ?? {}),
    },
  };
}

export interface ResolveStoryKitInput {
  config: StoryKitConfig;
  registry: PackRegistry;
}

export function resolveStoryKit(input: ResolveStoryKitInput): ResolvedStoryKit {
  const { config, registry } = input;
  const warnings: string[] = [];

  const personaPack = config.personaPackId
    ? registry.getPersonaPack(config.personaPackId)
    : undefined;
  if (config.personaPackId && !personaPack) {
    throw storyKitError(`Missing persona pack "${config.personaPackId}"`);
  }

  const assetPack = config.assetPackId
    ? registry.getAssetPack(config.assetPackId)
    : undefined;
  if (config.assetPackId && !assetPack) {
    throw storyKitError(`Missing asset pack "${config.assetPackId}"`);
  }

  const styleKit = config.styleKitId
    ? registry.getStyleKit(config.styleKitId)
    : undefined;
  if (config.styleKitId && !styleKit) {
    throw storyKitError(`Missing style kit "${config.styleKitId}"`);
  }

  const deviceKit = config.deviceKitId
    ? registry.getDeviceKit(config.deviceKitId)
    : undefined;
  if (config.deviceKitId && !deviceKit) {
    throw storyKitError(`Missing device kit "${config.deviceKitId}"`);
  }

  validateStyleAppRefs(
    {
      appThemes: styleKit?.appThemes,
      appVisualModes: styleKit?.appVisualModes,
      appStyles: styleKit?.appStyles,
    },
    `style kit "${styleKit?.id ?? "unknown"}"`,
  );

  validateStyleAppRefs(
    {
      appThemes: config.appThemeDefaults,
    },
    "episode appThemeDefaults",
  );

  const actors: Record<string, ResolvedActor> = {};
  const castStyleByDevice: Record<string, StoryStyleOverrides> = {};

  for (const [role, castEntry] of Object.entries(config.cast)) {
    if (!personaPack) {
      throw storyKitError(
        `Role "${role}" requires persona pack resolution but personaPackId is missing`,
      );
    }
    const persona = registry.getPersona(personaPack.id, castEntry.persona);
    if (!persona) {
      throw storyKitError(
        `Role "${role}" references unknown persona "${castEntry.persona}" in pack "${personaPack.id}"`,
      );
    }

    validateStyleAppRefs(castEntry.styleOverrides, `cast role "${role}"`);

    const overrideCount =
      Object.keys(castEntry.overrides ?? {}).length +
      Object.keys(castEntry.appOverrides ?? {}).length +
      Object.keys(castEntry.assetOverrides ?? {}).length +
      Object.keys(castEntry.styleOverrides ?? {}).length;
    if (overrideCount >= 6) {
      warnings.push(
        `[StoryKit][lint] Role "${role}" uses many inline overrides (${overrideCount}); consider moving to packs`,
      );
    }

    const avatarRef = castEntry.assetOverrides?.avatar ?? persona.avatar;
    const avatar = resolveAssetRef(
      assetPack,
      registry,
      avatarRef,
      "avatars",
      `avatar for role "${role}"`,
    );
    if (!avatar) {
      throw storyKitError(`Role "${role}" does not resolve to an avatar`);
    }

    if (avatar.toLowerCase().includes("placeholder")) {
      warnings.push(
        `[StoryKit][lint] Role "${role}" resolves to placeholder-like avatar "${avatar}"`,
      );
    }

    if (assetPack && avatarRef && !parseAssetReference(avatarRef).bucket) {
      const alias = findAliasByValue(assetPack, avatarRef);
      if (alias) {
        warnings.push(
          `[StoryKit][lint] Role "${role}" uses hardcoded asset path "${avatarRef}". Use alias "${alias}"`,
        );
      }
    }

    const actor: ResolvedActor = {
      role,
      personaId: persona.id,
      deviceId: castEntry.device,
      name: castEntry.overrides?.name ?? persona.name,
      handle: castEntry.overrides?.handle ?? persona.handle,
      bio: castEntry.overrides?.bio ?? persona.bio,
      avatar,
      voice: castEntry.overrides?.voice ?? persona.voice,
      traits: castEntry.overrides?.traits ?? persona.traits,
      defaultAppMetadata: {
        ...(persona.defaultAppMetadata ?? {}),
        ...(castEntry.appOverrides ?? {}),
      },
    };

    actors[role] = actor;

    if (castEntry.device) {
      const existing = castStyleByDevice[castEntry.device] ?? {};
      castStyleByDevice[castEntry.device] = {
        appThemes: {
          ...(existing.appThemes ?? {}),
          ...(castEntry.styleOverrides?.appThemes ?? {}),
        },
        appVisualModes: {
          ...(existing.appVisualModes ?? {}),
          ...(castEntry.styleOverrides?.appVisualModes ?? {}),
        },
        appStyles: {
          ...(existing.appStyles ?? {}),
          ...(castEntry.styleOverrides?.appStyles ?? {}),
        },
      };
    }
  }

  const devices: Record<string, ResolvedDevice> = {};
  const referencedDeviceIds = new Set<string>(Object.keys(config.devices));
  for (const actor of Object.values(actors)) {
    if (actor.deviceId) referencedDeviceIds.add(actor.deviceId);
  }

  for (const deviceId of referencedDeviceIds) {
    const packDevice: DeviceKitEntry | undefined = deviceKit?.devices[deviceId];
    const override = config.devices[deviceId];
    if (!override && !packDevice) {
      throw storyKitError(`Cast references unknown device id "${deviceId}"`);
    }

    const styleDefaults =
      styleKit?.deviceDefaults?.[
        override?.styleRef ?? packDevice?.styleRef ?? override?.profile ?? packDevice?.profile ?? ""
      ];
    const profile = override?.profile ?? styleDefaults?.profile ?? packDevice?.profile;
    if (!profile) {
      throw storyKitError(
        `Device "${deviceId}" is missing profile (episode > style > device kit)`,
      );
    }

    const app = override?.app;
    if (!app) {
      throw storyKitError(`Device "${deviceId}" is missing app in episode device override`);
    }
    if (!KNOWN_APP_IDS.has(app)) {
      throw storyKitError(`Unknown app id "${app}" for device "${deviceId}"`);
    }

    validateStyleAppRefs(override?.styleOverrides, `device "${deviceId}"`);

    const mergedStyle = deepMergeStyle(
      {
        appThemes: styleKit?.appThemes,
        appVisualModes: styleKit?.appVisualModes,
        appStyles: styleKit?.appStyles,
      },
      castStyleByDevice[deviceId],
      override?.styleOverrides,
    );
    const theme = mergedStyle?.appThemes?.[app];

    const baseHomeScreen =
      override?.homeScreen ??
      toHomeScreenPreset(styleDefaults?.homeScreen ?? packDevice?.homeScreen);
    const wallpaperRef =
      override?.wallpaper ?? styleDefaults?.wallpaper ?? packDevice?.wallpaper;
    const wallpaper = resolveAssetRef(
      assetPack,
      registry,
      wallpaperRef,
      "wallpapers",
      `wallpaper for device "${deviceId}"`,
    );
    const homeScreen =
      baseHomeScreen || wallpaper
        ? {
          ...(baseHomeScreen ?? {}),
          wallpaper: wallpaper ?? baseHomeScreen?.wallpaper,
        }
        : undefined;

    const installedApps = (() => {
      if (override?.installedApps) return [...override.installedApps];
      if (packDevice?.installedApps) return [...packDevice.installedApps];
      return undefined;
    })();

    devices[deviceId] = {
      id: deviceId,
      profile,
      app,
      installedApps,
      homeScreen,
      screenRecording:
        override?.screenRecording ??
        styleDefaults?.screenRecording ??
        packDevice?.screenRecording,
      theme,
    };
  }

  const background = config.background ?? styleKit?.background;

  const styleFor = (appId: string): ResolvedStyle => {
    if (!KNOWN_APP_IDS.has(appId)) {
      throw storyKitError(`Unknown style app ref "${appId}"`);
    }
    return {
      theme: config.appThemeDefaults?.[appId] ?? styleKit?.appThemes?.[appId],
      visualMode: styleKit?.appVisualModes?.[appId],
      style: styleKit?.appStyles?.[appId],
    };
  };

  const actorFor = (role: string): ResolvedActor => {
    const hit = actors[role];
    if (!hit) throw storyKitError(`Unknown actor role "${role}"`);
    return hit;
  };

  const deviceFor = (deviceId: string): ResolvedDevice => {
    const hit = devices[deviceId];
    if (!hit) throw storyKitError(`Unknown device id "${deviceId}"`);
    return hit;
  };

  const assetFor = (alias: string, bucket?: AssetBucketName): string => {
    if (!assetPack) {
      throw storyKitError(`No asset pack configured, cannot resolve "${alias}"`);
    }
    if (bucket) {
      const hit = registry.resolveAsset(assetPack.id, bucket, alias);
      if (!hit) {
        throw storyKitError(
          `Unknown asset alias "${bucket}:${alias}" in asset pack "${assetPack.id}"`,
        );
      }
      return hit;
    }
    const hits = ASSET_BUCKETS.flatMap((b) => {
      const hit = registry.resolveAsset(assetPack.id, b, alias);
      return hit ? [{ bucket: b, value: hit }] : [];
    });
    if (hits.length === 0) {
      throw storyKitError(
        `Unknown asset alias "${alias}" in asset pack "${assetPack.id}"`,
      );
    }
    if (hits.length > 1) {
      throw storyKitError(
        `Ambiguous asset alias "${alias}". Use bucket-specific lookup.`,
      );
    }
    return hits[0].value;
  };

  const result: ResolvedStoryKit = {
    personaPack,
    assetPack,
    styleKit,
    deviceKit,
    background,
    warnings,
    actors,
    devices,
    actor: actorFor,
    asset: assetFor,
    device: deviceFor,
    style: (appId: string): ResolvedStyle => styleFor(appId),
    project: {
      xUser: (role: string, overrides?: StoryXUserProjectionOverrides): UserCreatePayload =>
        toXUserProjection(actorFor(role), overrides),
      linkedinUser: (
        role: string,
        overrides?: StoryLinkedInUserProjectionOverrides,
      ): StoryLinkedInUserProjection => toLinkedInUserProjection(actorFor(role), overrides),
      whatsappConversation: (
        input: StoryWhatsAppConversationProjection,
      ): ConversationConfig => toConversationProjection(actorFor, assetFor, input),
      imessageConversation: (input: StoryConversationProjection): ConversationConfig =>
        toConversationProjection(actorFor, assetFor, input),
      snapchatConversation: (input: StoryConversationProjection): ConversationConfig =>
        toConversationProjection(actorFor, assetFor, input),
      device: (
        deviceId: string,
        overrides?: StoryDeviceProjectionOverrides,
      ): StoryProjectedDeviceConfig => {
        const resolved = deviceFor(deviceId);
        return {
          profile: overrides?.profile ?? resolved.profile,
          options: {
            app: overrides?.app ?? resolved.app,
            conversations: overrides?.conversations
              ? [...overrides.conversations]
              : undefined,
            os: overrides?.os ? { ...overrides.os } : undefined,
            theme: overrides?.theme ?? resolved.theme,
            locked: overrides?.locked,
            installedApps: overrides?.installedApps
              ? [...overrides.installedApps]
              : resolved.installedApps
                ? [...resolved.installedApps]
                : undefined,
            homeScreen: overrides?.homeScreen
              ? { ...overrides.homeScreen }
              : resolved.homeScreen
                ? { ...resolved.homeScreen }
                : undefined,
            screenRecording:
              overrides?.screenRecording ?? resolved.screenRecording,
          },
        };
      },
    },
  };

  return result;
}
