import type { DeviceProfile } from "../types.js";
import type { SystemAppearance, SystemSurfaceTheme } from "./contract.js";

const IOS_FONT = '"Noto Sans Variable", "Noto Sans Arabic Variable", -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
const ANDROID_FONT = '"Noto Sans Variable", "Noto Sans Arabic Variable", Roboto, sans-serif';

function px(profile: DeviceProfile, points: number): number {
  return points * (profile.pixelDensity || 1);
}

export function getSystemSurfaceTheme(
  profile: DeviceProfile,
  appearance: SystemAppearance,
): SystemSurfaceTheme {
  const platform = profile.platform;
  const ios = platform === "ios";
  const light = appearance === "light";
  const pointScale = profile.pixelDensity || 1;

  return {
    id: `system:${platform}:${appearance}`,
    platform,
    appearance,
    statusBarTheme: light ? "light" : "dark",
    fontFamily: ios ? IOS_FONT : ANDROID_FONT,
    colors: light
      ? {
          primaryText: "#16161A",
          secondaryText: "rgba(22, 22, 26, 0.68)",
          chrome: ios ? "rgba(247, 247, 250, 0.58)" : "rgba(238, 240, 247, 0.92)",
          chromeStrong: ios ? "rgba(255, 255, 255, 0.82)" : "#F0F2FA",
          chromeBorder: ios ? "rgba(255, 255, 255, 0.72)" : "rgba(36, 38, 45, 0.08)",
          badge: ios ? "#FF3B30" : "#B3261E",
          badgeText: "#FFFFFF",
          dock: ios ? "rgba(247, 247, 250, 0.5)" : "transparent",
          folder: ios ? "rgba(247, 247, 250, 0.48)" : "rgba(232, 235, 244, 0.88)",
          search: ios ? "rgba(247, 247, 250, 0.52)" : "#ECEEF6",
        }
      : {
          primaryText: "#FFFFFF",
          secondaryText: "rgba(245, 245, 250, 0.7)",
          chrome: ios ? "rgba(38, 38, 42, 0.62)" : "rgba(43, 45, 51, 0.94)",
          chromeStrong: ios ? "rgba(53, 53, 58, 0.82)" : "#2D2F35",
          chromeBorder: "rgba(255, 255, 255, 0.12)",
          badge: ios ? "#FF453A" : "#F2B8B5",
          badgeText: ios ? "#FFFFFF" : "#601410",
          dock: ios ? "rgba(28, 28, 32, 0.5)" : "transparent",
          folder: ios ? "rgba(40, 40, 45, 0.52)" : "rgba(43, 45, 51, 0.9)",
          search: ios ? "rgba(35, 35, 40, 0.56)" : "#2A2C32",
        },
    wallpaper: light
      ? ios
        ? "radial-gradient(circle at 76% 18%, #ffe3cf 0 15%, transparent 44%), radial-gradient(circle at 18% 72%, #bed8ff 0 18%, transparent 48%), linear-gradient(155deg, #f7f0e8 0%, #d8e8f6 52%, #eadcf0 100%)"
        : "radial-gradient(circle at 18% 18%, #d6e2ff 0 18%, transparent 42%), radial-gradient(circle at 84% 70%, #f6d8ff 0 16%, transparent 44%), linear-gradient(145deg, #f7f2fa 0%, #e4e8f4 100%)"
      : ios
        ? "radial-gradient(circle at 72% 18%, #364477 0 12%, transparent 42%), radial-gradient(circle at 18% 76%, #402f61 0 13%, transparent 45%), linear-gradient(155deg, #08090d 0%, #141827 58%, #090a0f 100%)"
        : "radial-gradient(circle at 20% 20%, #283453 0 16%, transparent 42%), radial-gradient(circle at 82% 72%, #432c4b 0 15%, transparent 44%), linear-gradient(145deg, #111318 0%, #1b1d24 100%)",
    wallpaperScrim: light
      ? ios ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.12)"
      : ios ? "rgba(0, 0, 0, 0.08)" : "rgba(0, 0, 0, 0.14)",
    geometry: {
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
            dockWidth: profile.dimensions.width - px(profile, 26),
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
            dockWidth: profile.dimensions.width - px(profile, 20),
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
    },
  };
}

