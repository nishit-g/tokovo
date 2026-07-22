import type { DeviceProfile } from "../types.js";
import { resolveDevicePlatformVisuals } from "../visual-system.js";
import type { SystemAppearance, SystemSurfaceDesign, SystemSurfaceLayout } from "./contract.js";

function px(profile: DeviceProfile, points: number): number {
  return points * profile.pointScale;
}

function resolveLayout(profile: DeviceProfile): SystemSurfaceLayout {
  const ios = profile.platform === "ios";
  const pointScale = profile.pointScale;
  return {
    pointScale,
    lock: ios
      ? {
          dateTop: px(profile, 74),
          dateSize: px(profile, 16),
          clockTop: px(profile, 96),
          clockSize: px(profile, 88),
          androidClockSize: px(profile, 88),
          controlsBottom: px(profile, 28),
          controlSize: px(profile, 50),
          controlIconSize: px(profile, 20),
        }
      : {
          dateTop: px(profile, 78),
          dateSize: px(profile, 17),
          clockTop: px(profile, 106),
          clockSize: px(profile, 64),
          androidClockSize: px(profile, 88),
          controlsBottom: px(profile, 42),
          controlSize: px(profile, 48),
          controlIconSize: px(profile, 22),
        },
    home: ios
      ? {
          gridColumns: 4,
          gridRows: 6,
          gridTop: px(profile, 82),
          gridPaddingX: px(profile, 24),
          rowGap: px(profile, 21),
          columnGap: px(profile, 18),
          iconSize: px(profile, 60),
          iconRadius: px(profile, 13.5),
          labelSize: px(profile, 11.5),
          labelGap: px(profile, 5),
          dockHeight: px(profile, 92),
          dockWidth: profile.display.width - px(profile, 26),
          dockBottom: px(profile, 17),
          dockRadius: px(profile, 30),
          dockIconSize: px(profile, 60),
          pageDotsBottom: px(profile, 119),
          pageDotSize: px(profile, 7),
          pageDotGap: px(profile, 7),
          searchBottom: px(profile, 111),
          searchHeight: px(profile, 28),
          atAGlanceTop: 0,
        }
      : {
          gridColumns: 5,
          gridRows: 5,
          gridTop: px(profile, 164),
          gridPaddingX: px(profile, 14),
          rowGap: px(profile, 22),
          columnGap: px(profile, 10),
          iconSize: px(profile, 56),
          iconRadius: px(profile, 28),
          labelSize: px(profile, 11),
          labelGap: px(profile, 5),
          dockHeight: px(profile, 74),
          dockWidth: profile.display.width - px(profile, 20),
          dockBottom: px(profile, 18),
          dockRadius: px(profile, 28),
          dockIconSize: px(profile, 56),
          pageDotsBottom: px(profile, 100),
          pageDotSize: px(profile, 5),
          pageDotGap: px(profile, 6),
          searchBottom: px(profile, 98),
          searchHeight: px(profile, 52),
          atAGlanceTop: px(profile, 58),
        },
  };
}

export function resolveSystemSurfaceDesign(
  profile: DeviceProfile,
  appearance: SystemAppearance,
  locale = "en-US",
): SystemSurfaceDesign {
  const visuals = resolveDevicePlatformVisuals(profile, appearance, locale);
  const ios = profile.platform === "ios";
  const light = appearance === "light";
  const palette = visuals.palette;
  const materials = visuals.materials;

  return {
    theme: {
      id: `${profile.platformProfileId}:${appearance}:system-surfaces`,
      platform: profile.platform,
      appearance,
      statusBarTheme: light ? "light" : "dark",
      fontFamily: visuals.typography.primaryFamily,
      colors: {
        primaryText: palette.primaryText,
        secondaryText: palette.secondaryText,
        chrome: materials.chrome.fill,
        chromeStrong: materials.chromeRaised.fill,
        chromeBorder: materials.chrome.stroke?.color ?? palette.separator,
        badge: ios ? (light ? "#FF3B30" : "#FF453A") : light ? "#B3261E" : "#F2B8B5",
        badgeText: ios || light ? "#FFFFFF" : "#601410",
        dock: ios ? materials.chrome.fill : "transparent",
        folder: materials.chrome.fill,
        search: materials.chromeRaised.fill,
      },
      wallpaper: light
        ? ios
          ? "radial-gradient(circle at 76% 18%, #ffe3cf 0 15%, transparent 44%), radial-gradient(circle at 18% 72%, #bed8ff 0 18%, transparent 48%), linear-gradient(155deg, #f7f0e8 0%, #d8e8f6 52%, #eadcf0 100%)"
          : "radial-gradient(circle at 18% 18%, #d6e2ff 0 18%, transparent 42%), radial-gradient(circle at 84% 70%, #f6d8ff 0 16%, transparent 44%), linear-gradient(145deg, #f7f2fa 0%, #e4e8f4 100%)"
        : ios
          ? "radial-gradient(circle at 72% 18%, #364477 0 12%, transparent 42%), radial-gradient(circle at 18% 76%, #402f61 0 13%, transparent 45%), linear-gradient(155deg, #08090d 0%, #141827 58%, #090a0f 100%)"
          : "radial-gradient(circle at 20% 20%, #283453 0 16%, transparent 42%), radial-gradient(circle at 82% 72%, #432c4b 0 15%, transparent 44%), linear-gradient(145deg, #111318 0%, #1b1d24 100%)",
      wallpaperScrim: light
        ? ios
          ? "rgba(255, 255, 255, 0.08)"
          : "rgba(255, 255, 255, 0.12)"
        : ios
          ? "rgba(0, 0, 0, 0.08)"
          : "rgba(0, 0, 0, 0.14)",
      materials: {
        chrome: materials.chrome,
        chromeRaised: materials.chromeRaised,
      },
    },
    layout: resolveLayout(profile),
  };
}
