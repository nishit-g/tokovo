import {
  createReducerRegistry,
  type ReducerRegistryClass,
  createSoundRegistry,
  type SoundRegistryAPI,
  createAnchorRegistry,
  type AnchorRegistryClass,
  createAutoSoundRegistry,
  type AutoSoundRegistryClass,
  createNotificationAdapterRegistry,
  type NotificationAdapterRegistryClass,
  createBehaviorRegistry,
  type BehaviorRegistryAPI,
} from "@tokovo/core";
import {
  createAppRegistry,
  type AppRegistryAPI,
  createLayoutRegistry,
  type LayoutRegistryClass,
  createAppMetadataRegistry,
  type AppMetadataRegistryAPI,
  createWidgetRegistry,
  type WidgetRegistryClass,
  createIconRegistry,
  type IconRegistryAPI,
} from "../registries";

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
