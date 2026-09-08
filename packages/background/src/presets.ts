import { BACKDROP_PROFILES, type BackdropProfileId } from "@tokovo/visual-system";
import type { BackgroundPreset } from "./types.js";

const NAMES: Readonly<Record<BackdropProfileId, string>> = {
  "studio-quiet-dark": "Quiet Dark Studio",
  "studio-quiet-light": "Quiet Light Studio",
  "ambient-depth": "Ambient Depth",
  "editorial-neon": "Editorial Neon",
  "signal-pop": "Signal Pop",
};

export const BACKGROUND_PRESETS: Readonly<Record<BackdropProfileId, BackgroundPreset>> =
  Object.fromEntries(
    Object.values(BACKDROP_PROFILES).map((profile) => [
      profile.id,
      {
        id: profile.id,
        name: NAMES[profile.id],
        description: `${profile.visualEnergy} ${profile.orientation} backdrop; signage=${String(profile.permitsTextOrSignage)}`,
        config:
          profile.paint.kind === "solid"
            ? {
                type: "solid" as const,
                color: profile.paint.color,
                opacity: 1,
                parallax: profile.parallaxDepth > 0,
              }
            : {
                type: "gradient" as const,
                gradient: profile.paint.gradient,
                opacity: 1,
                parallax: profile.parallaxDepth > 0,
              },
      },
    ]),
  ) as Record<BackdropProfileId, BackgroundPreset>;

export function getPreset(id: BackdropProfileId): BackgroundPreset {
  const preset = BACKGROUND_PRESETS[id];
  if (!preset) {
    throw new Error(`BACKGROUND_PRESET_MISSING: backdrop profile "${id}" is not registered.`);
  }
  return preset;
}

export function listPresets(): BackdropProfileId[] {
  return Object.keys(BACKGROUND_PRESETS) as BackdropProfileId[];
}

export function isPresetId(value: string): value is BackdropProfileId {
  return value in BACKGROUND_PRESETS;
}
