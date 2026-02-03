import {
  createReducerRegistry,
  type ReducerRegistryClass,
} from "../engine/registry";
import {
  createAppRegistry,
  type AppRegistryAPI,
} from "../registries/app";
import {
  createSoundRegistry,
  type SoundRegistryAPI,
} from "../registries/sound";
import {
  createLayoutRegistry,
  type LayoutRegistryClass,
} from "../registries/layout";
import {
  createAppMetadataRegistry,
  type AppMetadataRegistryAPI,
} from "../registries/metadata";
import {
  createAnchorRegistry,
  type AnchorRegistryClass,
} from "../anchors/registry";
import {
  createAutoSoundRegistry,
  type AutoSoundRegistryClass,
} from "../audio/auto-sound";
import {
  createNotificationAdapterRegistry,
  type NotificationAdapterRegistryClass,
} from "../notifications/adapter";
import {
  createWidgetRegistry,
  type WidgetRegistryClass,
} from "../registries/widget";
import {
  createIconRegistry,
  type IconRegistryAPI,
} from "../registries/icon";
import {
  createBehaviorRegistry,
  type BehaviorRegistryAPI,
} from "../registries/behavior";

export interface PluginRegistries {
  reducers: ReducerRegistryClass;
  apps: AppRegistryAPI;
  sounds: SoundRegistryAPI;
  layouts: LayoutRegistryClass;
  metadata: AppMetadataRegistryAPI;
  anchors: AnchorRegistryClass;
  autoSounds: AutoSoundRegistryClass;
  notifications: NotificationAdapterRegistryClass;
  widgets: WidgetRegistryClass;
  icons: IconRegistryAPI;
  behaviors: BehaviorRegistryAPI;
}

export function createPluginRegistries(
  overrides: Partial<PluginRegistries> = {},
): PluginRegistries {
  return {
    reducers: overrides.reducers ?? createReducerRegistry(),
    apps: overrides.apps ?? createAppRegistry(),
    sounds: overrides.sounds ?? createSoundRegistry(),
    layouts: overrides.layouts ?? createLayoutRegistry(),
    metadata: overrides.metadata ?? createAppMetadataRegistry(),
    anchors: overrides.anchors ?? createAnchorRegistry(),
    autoSounds: overrides.autoSounds ?? createAutoSoundRegistry(),
    notifications:
      overrides.notifications ?? createNotificationAdapterRegistry(),
    widgets: overrides.widgets ?? createWidgetRegistry(),
    icons: overrides.icons ?? createIconRegistry(),
    behaviors: overrides.behaviors ?? createBehaviorRegistry(),
  };
}
