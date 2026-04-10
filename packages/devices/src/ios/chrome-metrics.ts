import type { DeviceProfile, DynamicIslandConfig } from "../types.js";

const IOS_REFERENCE_WIDTH_POINTS = 430;
const IOS_REFERENCE_HEIGHT_POINTS = 932;

function fallbackPointScale(profile: DeviceProfile): number {
  return Math.max(
    1,
    Math.min(
      profile.dimensions.width / IOS_REFERENCE_WIDTH_POINTS,
      profile.dimensions.height / IOS_REFERENCE_HEIGHT_POINTS,
    ),
  );
}

export function getIOSPointScale(profile: DeviceProfile): number {
  return profile.pixelDensity || fallbackPointScale(profile);
}

export function getIOSLogicalDimensions(profile: DeviceProfile): {
  width: number;
  height: number;
} {
  const pointScale = getIOSPointScale(profile);
  return {
    width: profile.dimensions.width / pointScale,
    height: profile.dimensions.height / pointScale,
  };
}

export function pointsToDevicePx(
  profile: DeviceProfile,
  points: number,
): number {
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
    savedWidth: number;
    compactHeight: number;
    savedHeight: number;
    compactFontSize: number;
    savedFontSize: number;
    countdownFontSize: number;
    dotSize: number;
    savedDotSize: number;
    gap: number;
    horizontalPadding: number;
  };
  lockscreen: {
    clockTop: number;
    clockFontSize: number;
    clockLetterSpacing: number;
    dateMarginTop: number;
    dateFontSize: number;
    notificationSideInset: number;
    notificationBottomPadding: number;
    notificationStackOffset: number;
    notificationOverlap: number;
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
  const logical = getIOSLogicalDimensions(profile);
  const toPx = (points: number) => points * pointScale;
  const dynamicIsland = profile.dynamicIsland
    ? {
        ...profile.dynamicIsland,
        minimalWidth: profile.dynamicIsland.collapsedWidth * 0.74,
        compactWidth: profile.dynamicIsland.collapsedWidth * 1.12,
        savedWidth: profile.dynamicIsland.collapsedWidth * 1.22,
        compactHeight: profile.dynamicIsland.collapsedHeight * 0.94,
        savedHeight: profile.dynamicIsland.collapsedHeight * 0.9,
        compactFontSize: toPx(14.25),
        savedFontSize: toPx(13),
        countdownFontSize: toPx(17),
        dotSize: toPx(7.75),
        savedDotSize: toPx(6.2),
        gap: toPx(6),
        horizontalPadding: toPx(12),
      }
    : undefined;

  return {
    pointScale,
    logicalWidth: logical.width,
    logicalHeight: logical.height,
    statusBar: {
      height: Math.max(profile.safeArea?.top ?? 0, toPx(44)),
      paddingTop: toPx(15),
      paddingX: toPx(24),
      timeFontSize: toPx(17),
      timeLetterSpacing: toPx(0.16),
      iconGap: toPx(5),
      iconOffsetY: toPx(2),
      networkFontSize: toPx(12),
    },
    dynamicIsland,
    lockscreen: {
      clockTop: toPx(56),
      clockFontSize: toPx(69.5),
      clockLetterSpacing: toPx(-2.7),
      dateMarginTop: toPx(5.5),
      dateFontSize: toPx(15),
      notificationSideInset: toPx(14),
      notificationBottomPadding: toPx(82),
      notificationStackOffset: toPx(4),
      notificationOverlap: toPx(36),
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
