import type { DeviceProfile, DynamicIslandConfig } from "../types.js";
import { resolveDevicePlatformVisuals } from "../visual-system.js";

export function getIOSPointScale(profile: DeviceProfile): number {
  if (!Number.isFinite(profile.pointScale) || profile.pointScale <= 0) {
    throw new Error(
      `DEVICE_POINT_SCALE_INVALID: Profile "${profile.id}" requires a positive finite pointScale.`,
    );
  }
  return profile.pointScale;
}

export function getIOSLogicalDimensions(profile: DeviceProfile): {
  width: number;
  height: number;
} {
  const pointScale = getIOSPointScale(profile);
  return {
    width: profile.display.width / pointScale,
    height: profile.display.height / pointScale,
  };
}

export function pointsToDevicePx(profile: DeviceProfile, points: number): number {
  return points * getIOSPointScale(profile);
}

export interface IOSChromeMetrics {
  pointScale: number;
  logicalWidth: number;
  logicalHeight: number;
  statusBar: {
    height: number;
    paddingTop: number;
    paddingX: number;
    timeFontSize: number;
    timeLetterSpacing: number;
    iconGap: number;
    iconOffsetY: number;
    networkFontSize: number;
  };
  dynamicIsland?: DynamicIslandConfig & {
    minimalWidth: number;
    compactWidth: number;
    recordingCompactWidth: number;
    countdownWidth: number;
    recordingExpandedWidth: number;
    recordingExpandedHeight: number;
    recordingExpandedCornerRadius: number;
    compactHeight: number;
    expandedCornerRadius: number;
    sensorPillWidth: number;
    sensorPillHeight: number;
    cameraLensSize: number;
    morphFrames: number;
  };
  lockscreen: {
    clockTop: number;
    clockFontSize: number;
    clockLetterSpacing: number;
    dateMarginTop: number;
    dateFontSize: number;
    bottomControlsHeight: number;
    bottomControlsPaddingX: number;
    bottomButtonSize: number;
    bottomButtonIconSize: number;
  };
  homeIndicator: {
    bottom: number;
    width: number;
    height: number;
    radius: number;
  };
}

export function getIOSChromeMetrics(profile: DeviceProfile): IOSChromeMetrics {
  const pointScale = getIOSPointScale(profile);
  const platformVisuals = resolveDevicePlatformVisuals(profile, "light");
  const logical = getIOSLogicalDimensions(profile);
  const toPx = (points: number) => points * pointScale;
  const dynamicIsland = profile.dynamicIsland
    ? {
        ...profile.dynamicIsland,
        minimalWidth: toPx(52),
        compactWidth: toPx(Math.min(250, logical.width - 24)),
        recordingCompactWidth: toPx(166),
        countdownWidth: toPx(190),
        recordingExpandedWidth: toPx(Math.min(286, logical.width - 72)),
        recordingExpandedHeight: toPx(68),
        recordingExpandedCornerRadius: toPx(34),
        compactHeight: profile.dynamicIsland.collapsedHeight,
        expandedCornerRadius: profile.dynamicIsland.expandedCornerRadius ?? toPx(44),
        sensorPillWidth: toPx(74),
        sensorPillHeight: toPx(27),
        cameraLensSize: toPx(21),
        morphFrames: 12,
      }
    : undefined;

  return {
    pointScale,
    logicalWidth: logical.width,
    logicalHeight: logical.height,
    statusBar: {
      height: toPx(platformVisuals.geometry.statusBarHeight),
      paddingTop: toPx(19),
      paddingX: toPx(34),
      timeFontSize: toPx(17),
      timeLetterSpacing: toPx(0.16),
      iconGap: toPx(5),
      iconOffsetY: toPx(4),
      networkFontSize: toPx(12),
    },
    dynamicIsland,
    lockscreen: {
      clockTop: toPx(56),
      clockFontSize: toPx(69.5),
      clockLetterSpacing: toPx(-2.7),
      dateMarginTop: toPx(5.5),
      dateFontSize: toPx(15),
      bottomControlsHeight: toPx(90),
      bottomControlsPaddingX: toPx(20),
      bottomButtonSize: toPx(50),
      bottomButtonIconSize: toPx(18),
    },
    homeIndicator: {
      bottom: toPx(8),
      width: toPx(135),
      height: toPx(5),
      radius: toPx(2.5),
    },
  };
}
