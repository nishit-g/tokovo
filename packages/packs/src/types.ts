export type AppId = `app_${string}` | string;

export interface Persona {
  id: string;
  name: string;
  handle: string;
  bio: string;
  avatar: string;
  voice?: string;
  traits?: readonly string[];
  defaultAppMetadata?: Readonly<Record<AppId, Readonly<Record<string, unknown>>>>;
}

export interface PersonaPack {
  id: string;
  name: string;
  version?: string;
  personas: Readonly<Record<string, Persona>>;
}

export type AssetBucketName =
  | "avatars"
  | "wallpapers"
  | "backgrounds"
  | "media"
  | "maps"
  | "docs"
  | "stickers"
  | "linkPreviewImages"
  | "profileBanners";

export type AssetBucket = Readonly<Record<string, string>>;

export type AssetBuckets = Readonly<Record<AssetBucketName, AssetBucket>>;

export interface AssetPack {
  id: string;
  name: string;
  version?: string;
  assets: AssetBuckets;
}

export interface DeviceStyleDefaults {
  profile?: string;
  wallpaper?: string;
  homeScreen?: string;
  screenRecording?: boolean;
}

export interface StyleKit {
  id: string;
  name: string;
  version?: string;
  background?: string;
  deviceDefaults?: Readonly<Record<string, DeviceStyleDefaults>>;
  appThemes?: Readonly<Record<AppId, string>>;
  appVisualModes?: Readonly<Record<AppId, string>>;
  appStyles?: Readonly<
    Record<AppId, Readonly<Record<string, string | number | boolean>>>
  >;
}

export interface DeviceKitEntry {
  profile: string;
  installedApps?: readonly AppId[];
  homeScreen?: string;
  styleRef?: string;
  wallpaper?: string;
  screenRecording?: boolean;
}

export interface DeviceKit {
  id: string;
  name: string;
  version?: string;
  devices: Readonly<Record<string, DeviceKitEntry>>;
}

export interface PackRegistryInput {
  personaPacks?: readonly PersonaPack[];
  assetPacks?: readonly AssetPack[];
  styleKits?: readonly StyleKit[];
  deviceKits?: readonly DeviceKit[];
}

export interface PackRegistry {
  personaPacks: Readonly<Record<string, PersonaPack>>;
  assetPacks: Readonly<Record<string, AssetPack>>;
  styleKits: Readonly<Record<string, StyleKit>>;
  deviceKits: Readonly<Record<string, DeviceKit>>;
  listPersonaPackIds(): readonly string[];
  listAssetPackIds(): readonly string[];
  listStyleKitIds(): readonly string[];
  listDeviceKitIds(): readonly string[];
  getPersonaPack(id: string): PersonaPack | undefined;
  getAssetPack(id: string): AssetPack | undefined;
  getStyleKit(id: string): StyleKit | undefined;
  getDeviceKit(id: string): DeviceKit | undefined;
  getPersona(packId: string, personaId: string): Persona | undefined;
  resolveAsset(
    packId: string,
    bucket: AssetBucketName,
    alias: string,
  ): string | undefined;
}

export type StudioPackKind = "personas" | "assets" | "styles" | "devices";

export interface StudioPackSourceDescriptor {
  kind: StudioPackKind;
  id: string;
  name: string;
  exportName: string;
  relativeSourcePath: string;
}
