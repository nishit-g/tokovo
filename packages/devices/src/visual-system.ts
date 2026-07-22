import {
  resolvePlatformVisuals,
  resolveSystemGeometry,
  type ResolvedPlatformVisuals,
  type SystemGeometryFrame,
  type SystemGeometryState,
  type VisualAppearance,
  type VisualDirection,
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
): ResolvedPlatformVisuals {
  return resolvePlatformVisuals({
    platformProfileId: profile.platformProfileId,
    appearance,
    locale,
    direction: directionForLocale(locale),
    textScale: 1,
    contrast: "standard",
    motion: "full",
  });
}

export function resolveDeviceSystemGeometry(
  profile: DeviceProfile,
  options: {
    appearance?: VisualAppearance;
    locale?: string;
    state?: SystemGeometryState;
  } = {},
): SystemGeometryFrame {
  const visuals = resolveDevicePlatformVisuals(
    profile,
    options.appearance ?? "light",
    options.locale,
  );
  return resolveSystemGeometry(profile, visuals, options.state);
}
