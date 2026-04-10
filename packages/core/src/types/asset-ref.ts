import type { RuntimeEvent } from "./runtime-event.js";
import type { WorldState } from "./world-state.js";

export type EpisodeAssetKind =
  | "image"
  | "video"
  | "audio"
  | "gif"
  | "json"
  | "unknown";

export type EpisodeAssetOwner = "system" | "app";

export type EpisodeAssetUsage =
  | "background"
  | "voice-audio"
  | "voice-manifest"
  | "avatar"
  | "message-media"
  | "link-preview"
  | "sticker"
  | "map"
  | "document"
  | "wallpaper"
  | "other";

export type EpisodeAssetPrefetchStrategy = "eager" | "lookahead" | "none";

export interface EpisodeAssetRef {
  id: string;
  src: string;
  kind: EpisodeAssetKind;
  owner: EpisodeAssetOwner;
  usage: EpisodeAssetUsage;
  appId?: string;
  fromFrame?: number;
  toFrame?: number;
  strategy: EpisodeAssetPrefetchStrategy;
  priority: number;
  source: "ir" | "initial-world" | "runtime-event" | "plugin";
  path?: string;
}

export interface PluginAssetCollectorContext<AppId extends string = string> {
  appId: AppId;
  ir: import("@tokovo/ir").TrackEpisodeIR;
  initialWorld: WorldState;
  events: RuntimeEvent[];
}

export type PluginAssetCollector<AppId extends string = string> = (
  context: PluginAssetCollectorContext<AppId>,
) => EpisodeAssetRef[];
