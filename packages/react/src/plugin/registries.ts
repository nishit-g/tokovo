import {
  createReducerRegistry,
  type ReducerRegistryClass,
  createSoundRegistry,
  type SoundRegistryAPI,
  createAutoSoundRegistry,
  type AutoSoundRegistryClass,
  createCinematicSubjectRegistry,
  type CinematicSubjectRegistryClass,
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
} from "../registries/index.js";

export interface PluginRegistries {
  reducers: ReducerRegistryClass;
  apps: AppRegistryAPI;
  sounds: SoundRegistryAPI;
  layouts: LayoutRegistryClass;
  metadata: AppMetadataRegistryAPI;
  autoSounds: AutoSoundRegistryClass;
  widgets: WidgetRegistryClass;
  icons: IconRegistryAPI;
  cinematicSubjects: CinematicSubjectRegistryClass;
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
    autoSounds: overrides.autoSounds ?? createAutoSoundRegistry(),
    widgets: overrides.widgets ?? createWidgetRegistry(),
    icons: overrides.icons ?? createIconRegistry(),
    cinematicSubjects:
      overrides.cinematicSubjects ?? createCinematicSubjectRegistry(),
  };
}
