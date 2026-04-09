import type {
  AssetBucketName,
  AssetPack,
  DeviceKit,
  PackRegistry,
  PackRegistryInput,
  Persona,
  PersonaPack,
  StyleKit,
} from "./types.js";

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const key of Object.getOwnPropertyNames(value)) {
      deepFreeze((value as Record<string, unknown>)[key]);
    }
  }
  return value;
}

function asIdMap<T extends { id: string }>(
  kind: string,
  items: readonly T[] | undefined,
): Readonly<Record<string, T>> {
  const next: Record<string, T> = {};
  for (const item of items ?? []) {
    if (next[item.id]) {
      throw new Error(`Duplicate ${kind} id "${item.id}" in pack registry`);
    }
    next[item.id] = item;
  }

  const keys = Object.keys(next).sort();
  const sorted: Record<string, T> = {};
  for (const key of keys) sorted[key] = next[key];
  return deepFreeze(sorted);
}

export function createPackRegistry(input: PackRegistryInput = {}): PackRegistry {
  const personaPacks = asIdMap<PersonaPack>("persona pack", input.personaPacks);
  const assetPacks = asIdMap<AssetPack>("asset pack", input.assetPacks);
  const styleKits = asIdMap<StyleKit>("style kit", input.styleKits);
  const deviceKits = asIdMap<DeviceKit>("device kit", input.deviceKits);

  const registry: PackRegistry = {
    personaPacks,
    assetPacks,
    styleKits,
    deviceKits,
    listPersonaPackIds: () => Object.keys(personaPacks),
    listAssetPackIds: () => Object.keys(assetPacks),
    listStyleKitIds: () => Object.keys(styleKits),
    listDeviceKitIds: () => Object.keys(deviceKits),
    getPersonaPack: (id) => personaPacks[id],
    getAssetPack: (id) => assetPacks[id],
    getStyleKit: (id) => styleKits[id],
    getDeviceKit: (id) => deviceKits[id],
    getPersona: (packId: string, personaId: string): Persona | undefined => {
      return personaPacks[packId]?.personas[personaId];
    },
    resolveAsset: (
      packId: string,
      bucket: AssetBucketName,
      alias: string,
    ): string | undefined => {
      return assetPacks[packId]?.assets[bucket]?.[alias];
    },
  };

  return deepFreeze(registry);
}
