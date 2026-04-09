import type {
  AssetBucket,
  AssetBucketName,
  AssetBuckets,
  AssetPack,
  DeviceKit,
  DeviceKitEntry,
  DeviceStyleDefaults,
  Persona,
  PersonaPack,
  StyleKit,
} from "./types.js";

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

type Mutable<T> = {
  -readonly [K in keyof T]: T[K];
};

function sortRecord<T>(record: Readonly<Record<string, T>>): Readonly<Record<string, T>> {
  const keys = Object.keys(record).sort();
  const next: Record<string, T> = {};
  for (const key of keys) next[key] = record[key];
  return next;
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.getOwnPropertyNames(value)) {
      deepFreeze((value as Record<string, unknown>)[key]);
    }
  }
  return value;
}

function normalizeAssetBuckets(
  input: Partial<Record<AssetBucketName, AssetBucket>> | undefined,
): AssetBuckets {
  const assets = {} as Mutable<AssetBuckets>;
  for (const bucket of ASSET_BUCKETS) {
    assets[bucket] = sortRecord(input?.[bucket] ?? {});
  }
  return deepFreeze(assets as AssetBuckets);
}

function normalizeDeviceDefaults(
  input: Readonly<Record<string, DeviceStyleDefaults>> | undefined,
): Readonly<Record<string, DeviceStyleDefaults>> | undefined {
  if (!input) return undefined;
  return deepFreeze(sortRecord(input));
}

function normalizeAppStyleMap<T>(
  input: Readonly<Record<string, T>> | undefined,
): Readonly<Record<string, T>> | undefined {
  if (!input) return undefined;
  return deepFreeze(sortRecord(input));
}

export function definePersonaPack(pack: PersonaPack): PersonaPack {
  const personas = sortRecord(pack.personas);
  for (const [key, persona] of Object.entries(personas)) {
    if (persona.id !== key) {
      throw new Error(
        `Persona pack "${pack.id}" has mismatched persona key "${key}" and id "${persona.id}"`,
      );
    }
  }

  return deepFreeze({
    ...pack,
    personas,
  });
}

export function defineAssetPack(
  pack: Omit<AssetPack, "assets"> & {
    assets?: Partial<Record<AssetBucketName, AssetBucket>>;
  },
): AssetPack {
  return deepFreeze({
    ...pack,
    assets: normalizeAssetBuckets(pack.assets),
  });
}

function normalizeInstalledApps(
  installedApps: readonly string[] | undefined,
): readonly string[] | undefined {
  if (!installedApps) return undefined;
  return [...new Set(installedApps)].sort();
}

function normalizeDeviceEntries(
  entries: Readonly<Record<string, DeviceKitEntry>>,
): Readonly<Record<string, DeviceKitEntry>> {
  const sorted = sortRecord(entries);
  const next: Record<string, DeviceKitEntry> = {};
  for (const [id, entry] of Object.entries(sorted)) {
    next[id] = {
      ...entry,
      installedApps: normalizeInstalledApps(entry.installedApps),
    };
  }
  return deepFreeze(next);
}

export function defineDeviceKit(pack: DeviceKit): DeviceKit {
  return deepFreeze({
    ...pack,
    devices: normalizeDeviceEntries(pack.devices),
  });
}

export function defineStyleKit(pack: StyleKit): StyleKit {
  const appStyles = pack.appStyles
    ? Object.fromEntries(
        Object.entries(sortRecord(pack.appStyles)).map(([appId, styleConfig]) => [
          appId,
          sortRecord(styleConfig),
        ]),
      )
    : undefined;

  return deepFreeze({
    ...pack,
    deviceDefaults: normalizeDeviceDefaults(pack.deviceDefaults),
    appThemes: normalizeAppStyleMap(pack.appThemes),
    appVisualModes: normalizeAppStyleMap(pack.appVisualModes),
    appStyles: appStyles ? deepFreeze(sortRecord(appStyles)) : undefined,
  });
}

export { ASSET_BUCKETS };
