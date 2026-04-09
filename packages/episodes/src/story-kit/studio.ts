import type { StoryEpisodeBuilder, StoryKitStudioConfig } from "@tokovo/creator";
import { starterPackRegistry } from "@tokovo/packs";

export interface StudioStoryKitEpisodeDescriptor {
  id: string;
  title: string;
  exportName: string;
  relativeEpisodePath: string;
  relativeSetupPath: string;
  config: StoryKitStudioConfig;
}

export function applyStudioStoryKitConfig(
  ep: StoryEpisodeBuilder,
  config: StoryKitStudioConfig,
): StoryEpisodeBuilder {
  ep.usePacks({
    registry: starterPackRegistry,
    personas: config.packs.personas,
    assets: config.packs.assets,
    styles: config.packs.styles,
    devices: config.packs.devices,
    background: config.background,
    appThemeDefaults: config.appThemeDefaults,
  }).cast(config.cast);

  for (const [deviceId, override] of Object.entries(config.devices)) {
    ep.device(deviceId, override);
  }

  return ep;
}
