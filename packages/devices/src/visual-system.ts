import {
  resolvePlatformVisuals,
  resolveSystemGeometry,
  type ResolvedPlatformVisuals,
  type SystemGeometryFrame,
  type SystemGeometryState,
  type VisualAppearance,
  type VisualDirection,
  type VisualPreferences,
} from "@tokovo/visual-system";
import type { DeviceProfile } from "./types.js";

function directionForLocale(locale: string): VisualDirection {
  const language = locale.trim().toLowerCase().split(/[-_]/u)[0];
  return language === "ar" || language === "fa" || language === "he" || language === "ur"
    ? "rtl"
    : "ltr";
}

export function resolveDevicePlatformVisuals(
  profile: DeviceProfile,
  appearance: VisualAppearance,
  locale = "en-US",
  preferences: Partial<VisualPreferences> = {},
): ResolvedPlatformVisuals {
  return resolvePlatformVisuals({
    platformProfileId: profile.platformProfileId,
    appearance,
    locale,
    direction: directionForLocale(locale),
    textScale: preferences.textScale ?? 1,
    contrast: preferences.contrast ?? "standard",
    motion: preferences.motion ?? "full",
    transparency: preferences.transparency ?? "standard",
    materialPreference: preferences.materialPreference ?? "automatic",
    colorSeed: preferences.colorSeed,
  });
}

export function resolveDeviceSystemGeometry(
  profile: DeviceProfile,
  options: {
    appearance?: VisualAppearance;
    locale?: string;
    preferences?: Partial<VisualPreferences>;
    state?: SystemGeometryState;
  } = {},
): SystemGeometryFrame {
  const visuals = resolveDevicePlatformVisuals(
    profile,
    options.appearance ?? "light",
    options.locale,
    options.preferences,
  );
  return resolveSystemGeometry(profile, visuals, options.state);
}
