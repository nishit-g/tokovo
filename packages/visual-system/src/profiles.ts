import type {
  BackdropProfile,
  BackdropProfileId,
  CompositionProfileId,
  EditorialCompositionProfile,
  MaterialRecipe,
  PlatformDesignProfile,
  PlatformPalette,
  TypographyRole,
  TypographyStyle,
  PlatformDesignProfileId,
} from "./contract.js";

function material(
  fill: string,
  options: Partial<Omit<MaterialRecipe, "fill">> = {},
): MaterialRecipe {
  return {
    fill,
    backdropBlur: options.backdropBlur ?? 0,
    backdropSaturation: options.backdropSaturation ?? 1,
    backdropBrightness: options.backdropBrightness ?? 1,
    stroke: options.stroke,
    shadows: options.shadows ?? [],
    minimumBackdropContrast: options.minimumBackdropContrast ?? 1,
  };
}

function typography(
  family: string,
  fontAssetId: string,
  values: Record<TypographyRole, Omit<TypographyStyle, "family" | "fontAssetId">>,
): Record<TypographyRole, TypographyStyle> {
  return Object.fromEntries(
    Object.entries(values).map(([role, style]) => [role, { ...style, family, fontAssetId }]),
  ) as Record<TypographyRole, TypographyStyle>;
}

export const TOKOVO_IOS_UI_FONT_FAMILY =
  '"Inter Variable", "Noto Sans Devanagari Variable", "Noto Sans Arabic Variable", "Noto Sans JP Variable", sans-serif';
export const TOKOVO_ANDROID_UI_FONT_FAMILY =
  '"Roboto Variable", "Noto Sans Devanagari Variable", "Noto Sans Arabic Variable", "Noto Sans JP Variable", sans-serif';
export const TOKOVO_MONO_UI_FONT_FAMILY = '"Roboto Mono Variable", monospace';

const iosRoles = typography(TOKOVO_IOS_UI_FONT_FAMILY, "font:tokovo-ios-ui@1", {
  caption: { size: 12, lineHeight: 15, weight: 400, letterSpacing: 0 },
  body: { size: 17, lineHeight: 22, weight: 400, letterSpacing: -0.24 },
  "body-strong": { size: 17, lineHeight: 22, weight: 600, letterSpacing: -0.24 },
  title: { size: 17, lineHeight: 22, weight: 600, letterSpacing: -0.41 },
  "large-title": { size: 34, lineHeight: 41, weight: 700, letterSpacing: 0.37 },
  "keyboard-key": { size: 22, lineHeight: 26, weight: 400, letterSpacing: 0 },
  "keyboard-special": { size: 15, lineHeight: 19, weight: 500, letterSpacing: 0 },
  "notification-app": { size: 12, lineHeight: 15, weight: 500, letterSpacing: 0 },
  "notification-title": { size: 15, lineHeight: 19, weight: 600, letterSpacing: -0.1 },
  "notification-body": { size: 14, lineHeight: 19, weight: 400, letterSpacing: -0.05 },
  "notification-time": { size: 11, lineHeight: 14, weight: 400, letterSpacing: 0 },
});

const androidRoles = typography(TOKOVO_ANDROID_UI_FONT_FAMILY, "font:tokovo-android-ui@1", {
  caption: { size: 12, lineHeight: 16, weight: 500, letterSpacing: 0.4 },
  body: { size: 16, lineHeight: 24, weight: 400, letterSpacing: 0.5 },
  "body-strong": { size: 16, lineHeight: 24, weight: 600, letterSpacing: 0.2 },
  title: { size: 18, lineHeight: 24, weight: 500, letterSpacing: 0 },
  "large-title": { size: 32, lineHeight: 40, weight: 400, letterSpacing: 0 },
  "keyboard-key": { size: 20, lineHeight: 24, weight: 400, letterSpacing: 0.15 },
  "keyboard-special": { size: 14, lineHeight: 20, weight: 500, letterSpacing: 0.1 },
  "notification-app": { size: 12, lineHeight: 16, weight: 500, letterSpacing: 0.3 },
  "notification-title": { size: 16, lineHeight: 20, weight: 500, letterSpacing: 0.1 },
  "notification-body": { size: 14, lineHeight: 20, weight: 400, letterSpacing: 0.25 },
  "notification-time": { size: 12, lineHeight: 16, weight: 400, letterSpacing: 0.4 },
});

const iosLight: PlatformPalette = {
  primaryText: "#121216",
  secondaryText: "rgba(38,38,43,0.64)",
  tertiaryText: "rgba(38,38,43,0.46)",
  accent: "#007AFF",
  destructive: "#FF3B30",
  surface: "rgba(248,248,251,0.78)",
  surfaceRaised: "rgba(255,255,255,0.9)",
  separator: "rgba(60,60,67,0.22)",
  keyboardKey: "rgba(255,255,255,0.96)",
  keyboardKeyPressed: "#B7BBC2",
  keyboardSpecialKey: "rgba(171,176,184,0.92)",
  keyboardSpecialKeyPressed: "#FFFFFF",
  keyboardAccentKey: "#007AFF",
  keyboardAccentKeyPressed: "#0062CC",
  notificationCard: "rgba(250,250,252,0.82)",
  notificationCardSecondary: "rgba(238,238,242,0.75)",
  notificationCenterScrim: "rgba(13,15,22,0.5)",
  island: "rgba(2,2,3,0.985)",
};

const iosDark: PlatformPalette = {
  primaryText: "#FFFFFF",
  secondaryText: "rgba(235,235,245,0.68)",
  tertiaryText: "rgba(235,235,245,0.48)",
  accent: "#0A84FF",
  destructive: "#FF453A",
  surface: "rgba(31,31,34,0.78)",
  surfaceRaised: "rgba(55,55,60,0.88)",
  separator: "rgba(235,235,245,0.2)",
  keyboardKey: "rgba(99,99,102,0.96)",
  keyboardKeyPressed: "#8E8E93",
  keyboardSpecialKey: "rgba(58,58,60,0.96)",
  keyboardSpecialKeyPressed: "#636366",
  keyboardAccentKey: "#0A84FF",
  keyboardAccentKeyPressed: "#409CFF",
  notificationCard: "rgba(43,43,48,0.84)",
  notificationCardSecondary: "rgba(59,59,65,0.78)",
  notificationCenterScrim: "rgba(0,0,0,0.7)",
  island: "rgba(1,1,2,0.99)",
};

const androidLight: PlatformPalette = {
  primaryText: "#1B1B1F",
  secondaryText: "#5F6368",
  tertiaryText: "#74777F",
  accent: "#0B57D0",
  destructive: "#B3261E",
  surface: "#F7F8FC",
  surfaceRaised: "#FFFFFF",
  separator: "rgba(60,64,67,0.14)",
  keyboardKey: "#F7F8FC",
  keyboardKeyPressed: "#D7DCE0",
  keyboardSpecialKey: "#DCE1E5",
  keyboardSpecialKeyPressed: "#C8CFD5",
  keyboardAccentKey: "#0B57D0",
  keyboardAccentKeyPressed: "#0842A0",
  notificationCard: "#F7F8FC",
  notificationCardSecondary: "#E8ECF5",
  notificationCenterScrim: "rgba(28,30,36,0.54)",
  island: "#1F1F1F",
};

const androidDark: PlatformPalette = {
  primaryText: "#F1F3F4",
  secondaryText: "#BDC1C6",
  tertiaryText: "#9AA0A6",
  accent: "#A8C7FA",
  destructive: "#F2B8B5",
  surface: "#202124",
  surfaceRaised: "#303134",
  separator: "rgba(232,234,237,0.14)",
  keyboardKey: "#3C4043",
  keyboardKeyPressed: "#5F6368",
  keyboardSpecialKey: "#303134",
  keyboardSpecialKeyPressed: "#5F6368",
  keyboardAccentKey: "#A8C7FA",
  keyboardAccentKeyPressed: "#C2E7FF",
  notificationCard: "#292A2D",
  notificationCardSecondary: "#383A3F",
  notificationCenterScrim: "rgba(0,0,0,0.72)",
  island: "#101010",
};

function iosMaterials(palette: PlatformPalette) {
  return {
    chrome: material(palette.surface, {
      backdropBlur: 28,
      backdropSaturation: 1.55,
      minimumBackdropContrast: 1.35,
      stroke: { width: 0.5, color: "rgba(255,255,255,0.42)" },
    }),
    chromeRaised: material(palette.surfaceRaised, {
      backdropBlur: 34,
      backdropSaturation: 1.45,
      minimumBackdropContrast: 1.55,
      stroke: { width: 0.5, color: "rgba(255,255,255,0.58)" },
      shadows: [{ offsetX: 0, offsetY: 8, blur: 28, spread: -10, color: "rgba(0,0,0,0.32)" }],
    }),
    keyboard: material(palette.surface, {
      backdropBlur: 26,
      backdropSaturation: 1.35,
      minimumBackdropContrast: 1.25,
      stroke: { width: 0.5, color: palette.separator },
    }),
    notification: material(palette.notificationCard, {
      backdropBlur: 38,
      backdropSaturation: 1.45,
      backdropBrightness: 1.04,
      minimumBackdropContrast: 1.7,
      stroke: { width: 0.65, color: "rgba(255,255,255,0.5)" },
      shadows: [{ offsetX: 0, offsetY: 12, blur: 34, spread: -12, color: "rgba(0,0,0,0.4)" }],
    }),
    notificationSecondary: material(palette.notificationCardSecondary, {
      backdropBlur: 30,
      backdropSaturation: 1.3,
      minimumBackdropContrast: 1.45,
      stroke: { width: 0.5, color: palette.separator },
    }),
    island: material(palette.island, {
      backdropBlur: 4,
      minimumBackdropContrast: 2.25,
      stroke: { width: 0.35, color: "rgba(255,255,255,0.12)" },
      shadows: [
        { offsetX: 0, offsetY: 2, blur: 7, spread: 0, color: "rgba(0,0,0,0.72)" },
        { offsetX: 0, offsetY: 0, blur: 0, spread: 1, color: "rgba(255,255,255,0.07)" },
      ],
    }),
  } as const;
}

function androidMaterials(palette: PlatformPalette) {
  return {
    chrome: material(palette.surface, { minimumBackdropContrast: 1.35 }),
    chromeRaised: material(palette.surfaceRaised, {
      minimumBackdropContrast: 1.5,
      shadows: [{ offsetX: 0, offsetY: 4, blur: 14, spread: -5, color: "rgba(0,0,0,0.3)" }],
    }),
    keyboard: material(palette.surface, {
      minimumBackdropContrast: 1.3,
      stroke: { width: 0.5, color: palette.separator },
    }),
    notification: material(palette.notificationCard, {
      minimumBackdropContrast: 1.6,
      stroke: { width: 0.5, color: palette.separator },
      shadows: [{ offsetX: 0, offsetY: 5, blur: 18, spread: -6, color: "rgba(0,0,0,0.34)" }],
    }),
    notificationSecondary: material(palette.notificationCardSecondary, {
      minimumBackdropContrast: 1.45,
    }),
    island: material(palette.island, { minimumBackdropContrast: 2 }),
  } as const;
}

export const IOS_LIQUID_GLASS_PROFILE: PlatformDesignProfile = {
  id: "ios:liquid-glass@1",
  version: 1,
  platform: "ios",
  source: {
    label: "Apple Human Interface Guidelines — Materials and Layout",
    url: "https://developer.apple.com/design/human-interface-guidelines/materials",
    calibratedAt: "2026-07-22",
  },
  typography: {
    primaryFamily: TOKOVO_IOS_UI_FONT_FAMILY,
    primaryFontAssetId: "font:tokovo-ios-ui@1",
    scriptFamilies: {
      Arab: '"Noto Sans Arabic Variable", sans-serif',
      Deva: '"Noto Sans Devanagari Variable", sans-serif',
      Jpan: '"Noto Sans JP Variable", sans-serif',
    },
    roles: iosRoles,
  },
  geometry: {
    minimumContentInsets: { top: 62, right: 0, bottom: 34, left: 0 },
    minimumTouchTarget: 44,
    statusBarHeight: 62,
    homeIndicator: { bottom: 8, width: 135, height: 5, radius: 2.5 },
    keyboard: {
      height: 336,
      candidateHeight: 42,
      keyHeight: 43,
      keyRadius: 6,
      keyGap: 6,
      rowGap: 8,
      horizontalPadding: 5,
      topPadding: 5,
      bottomPadding: 34,
    },
    notification: {
      islandClearance: 12,
      horizontalMargin: 10,
      minimumHeight: 92,
      cardRadius: 26,
      cardPadding: 14,
      iconSize: 24,
      lockScreenTop: 300,
      centerTop: 104,
      stackGap: 12,
      maxLockScreenGroups: 4,
      maxCenterGroups: 6,
    },
  },
  motion: {
    keyboardEnterSeconds: 0.25,
    keyboardExitSeconds: 0.22,
    keyPressSeconds: 0.1,
    keyPreviewSeconds: 0.14,
    notificationBannerEnterFramesAt30: 10,
    notificationBannerExitFramesAt30: 8,
    notificationCardEnterFramesAt30: 9,
    notificationCenterEnterFramesAt30: 12,
    islandMorphFramesAt30: 12,
  },
  appearances: {
    light: { palette: iosLight, materials: iosMaterials(iosLight) },
    dark: { palette: iosDark, materials: iosMaterials(iosDark) },
  },
};

export const ANDROID_MATERIAL3_PROFILE: PlatformDesignProfile = {
  id: "android:material3@1",
  version: 1,
  platform: "android",
  source: {
    label: "Android Material 3 design system",
    url: "https://developer.android.com/develop/ui/compose/designsystems/material3",
    calibratedAt: "2026-07-22",
  },
  typography: {
    primaryFamily: TOKOVO_ANDROID_UI_FONT_FAMILY,
    primaryFontAssetId: "font:tokovo-android-ui@1",
    scriptFamilies: {
      Arab: '"Noto Sans Arabic Variable", sans-serif',
      Deva: '"Noto Sans Devanagari Variable", sans-serif',
      Jpan: '"Noto Sans JP Variable", sans-serif',
    },
    roles: androidRoles,
  },
  geometry: {
    minimumContentInsets: { top: 28, right: 0, bottom: 24, left: 0 },
    minimumTouchTarget: 48,
    statusBarHeight: 28,
    homeIndicator: { bottom: 7, width: 108, height: 4, radius: 2 },
    keyboard: {
      height: 320,
      candidateHeight: 46,
      keyHeight: 46,
      keyRadius: 8,
      keyGap: 5,
      rowGap: 7,
      horizontalPadding: 7,
      topPadding: 5,
      bottomPadding: 20,
    },
    notification: {
      islandClearance: 8,
      horizontalMargin: 12,
      minimumHeight: 100,
      cardRadius: 22,
      cardPadding: 16,
      iconSize: 40,
      lockScreenTop: 280,
      centerTop: 82,
      stackGap: 10,
      maxLockScreenGroups: 5,
      maxCenterGroups: 7,
    },
  },
  motion: {
    keyboardEnterSeconds: 0.2,
    keyboardExitSeconds: 0.18,
    keyPressSeconds: 0.09,
    keyPreviewSeconds: 0.12,
    notificationBannerEnterFramesAt30: 8,
    notificationBannerExitFramesAt30: 7,
    notificationCardEnterFramesAt30: 8,
    notificationCenterEnterFramesAt30: 10,
    islandMorphFramesAt30: 10,
  },
  appearances: {
    light: { palette: androidLight, materials: androidMaterials(androidLight) },
    dark: { palette: androidDark, materials: androidMaterials(androidDark) },
  },
};

export const BUILT_IN_PLATFORM_PROFILES = [
  IOS_LIQUID_GLASS_PROFILE,
  ANDROID_MATERIAL3_PROFILE,
] as const;

export interface HardwareVisualIdentity {
  platform: "ios" | "android";
  platformProfileId: PlatformDesignProfileId;
  systemSurfaces: boolean;
}

const HARDWARE_VISUAL_IDENTITIES = new Map<string, HardwareVisualIdentity>([
  [
    "iphone16",
    {
      platform: "ios",
      platformProfileId: "ios:liquid-glass@1",
      systemSurfaces: true,
    },
  ],
  [
    "pixel",
    {
      platform: "android",
      platformProfileId: "android:material3@1",
      systemSurfaces: true,
    },
  ],
  [
    "canvas",
    {
      platform: "ios",
      platformProfileId: "ios:liquid-glass@1",
      systemSurfaces: false,
    },
  ],
]);

export function registerHardwareVisualIdentity(
  hardwareProfileId: string,
  identity: HardwareVisualIdentity,
): void {
  const existing = HARDWARE_VISUAL_IDENTITIES.get(hardwareProfileId);
  if (existing) {
    if (
      existing.platformProfileId === identity.platformProfileId &&
      existing.platform === identity.platform &&
      existing.systemSurfaces === identity.systemSurfaces
    ) {
      return;
    }
    throw new Error(
      `VISUAL_HARDWARE_PROFILE_COLLISION: hardware profile "${hardwareProfileId}" is already registered with a different visual identity.`,
    );
  }
  HARDWARE_VISUAL_IDENTITIES.set(hardwareProfileId, { ...identity });
}

export function resolveHardwarePlatformProfileId(
  hardwareProfileId: string,
): PlatformDesignProfileId {
  const identity = HARDWARE_VISUAL_IDENTITIES.get(hardwareProfileId);
  if (!identity) {
    throw new Error(
      `VISUAL_HARDWARE_PROFILE_MISSING: hardware profile "${hardwareProfileId}" has no registered platform design profile.`,
    );
  }
  return identity.platformProfileId;
}

export function resolveHardwareVisualIdentity(hardwareProfileId: string): {
  platform: "ios" | "android";
  platformProfileId: PlatformDesignProfileId;
  systemSurfaces: boolean;
} {
  const identity = HARDWARE_VISUAL_IDENTITIES.get(hardwareProfileId);
  if (!identity) {
    throw new Error(
      `VISUAL_HARDWARE_PROFILE_MISSING: hardware profile "${hardwareProfileId}" has no registered platform design profile.`,
    );
  }
  return {
    platform: identity.platform,
    platformProfileId: identity.platformProfileId,
    systemSurfaces: identity.systemSurfaces,
  };
}

export const EDITORIAL_COMPOSITION_PROFILES: Readonly<
  Record<CompositionProfileId, EditorialCompositionProfile>
> = {
  "hero-device": {
    id: "hero-device",
    targetFill: { min: 0.76, preferred: 0.84, max: 0.91 },
    editorialInsets: { top: 52, right: 44, bottom: 52, left: 44 },
    preferredPosition: [0.5, 0.5],
    protectedRegionPadding: 32,
    negativeSpacePreference: "none",
  },
  "content-detail": {
    id: "content-detail",
    targetFill: { min: 0.58, preferred: 0.7, max: 0.82 },
    editorialInsets: { top: 48, right: 40, bottom: 48, left: 40 },
    preferredPosition: [0.5, 0.52],
    protectedRegionPadding: 24,
    negativeSpacePreference: "none",
  },
  "wide-context": {
    id: "wide-context",
    targetFill: { min: 0.64, preferred: 0.74, max: 0.82 },
    editorialInsets: { top: 72, right: 64, bottom: 72, left: 64 },
    preferredPosition: [0.5, 0.5],
    protectedRegionPadding: 38,
    negativeSpacePreference: "none",
  },
  "duo-balanced": {
    id: "duo-balanced",
    targetFill: { min: 0.76, preferred: 0.86, max: 0.92 },
    editorialInsets: { top: 52, right: 44, bottom: 52, left: 44 },
    preferredPosition: [0.5, 0.5],
    protectedRegionPadding: 34,
    negativeSpacePreference: "none",
  },
  "handoff-pip": {
    id: "handoff-pip",
    targetFill: { min: 0.82, preferred: 0.9, max: 0.95 },
    editorialInsets: { top: 10, right: 10, bottom: 10, left: 10 },
    preferredPosition: [0.5, 0.5],
    protectedRegionPadding: 18,
    negativeSpacePreference: "right",
  },
  "notification-focus": {
    id: "notification-focus",
    targetFill: { min: 0.62, preferred: 0.72, max: 0.8 },
    editorialInsets: { top: 48, right: 40, bottom: 48, left: 40 },
    preferredPosition: [0.5, 0.22],
    protectedRegionPadding: 26,
    negativeSpacePreference: "bottom",
  },
  "keyboard-focus": {
    id: "keyboard-focus",
    targetFill: { min: 0.76, preferred: 0.86, max: 0.92 },
    editorialInsets: { top: 48, right: 40, bottom: 48, left: 40 },
    preferredPosition: [0.5, 0.72],
    protectedRegionPadding: 24,
    negativeSpacePreference: "top",
  },
};

export function requireEditorialCompositionProfile(
  id: CompositionProfileId,
): EditorialCompositionProfile {
  const profile = EDITORIAL_COMPOSITION_PROFILES[id];
  if (!profile) {
    throw new Error(
      `VISUAL_COMPOSITION_PROFILE_MISSING: composition profile "${id}" is not registered.`,
    );
  }
  return profile;
}

export const BACKDROP_PROFILES: Readonly<Record<BackdropProfileId, BackdropProfile>> = {
  "studio-quiet-dark": {
    id: "studio-quiet-dark",
    visualEnergy: "quiet",
    orientation: "orientation-free",
    subjectSafeRegions: [{ x: 0.14, y: 0.08, width: 0.72, height: 0.84 }],
    minimumSubjectContrast: 4.5,
    permitsTextOrSignage: false,
    parallaxDepth: 0.04,
    paint: {
      kind: "gradient",
      gradient: "radial-gradient(ellipse at 50% 42%, #20232a 0%, #101217 54%, #07080b 100%)",
    },
  },
  "studio-quiet-light": {
    id: "studio-quiet-light",
    visualEnergy: "quiet",
    orientation: "orientation-free",
    subjectSafeRegions: [{ x: 0.14, y: 0.08, width: 0.72, height: 0.84 }],
    minimumSubjectContrast: 4.5,
    permitsTextOrSignage: false,
    parallaxDepth: 0.03,
    paint: {
      kind: "gradient",
      gradient: "radial-gradient(ellipse at 50% 42%, #f4f4f2 0%, #dcddd9 58%, #c8cac7 100%)",
    },
  },
  "ambient-depth": {
    id: "ambient-depth",
    visualEnergy: "balanced",
    orientation: "orientation-free",
    subjectSafeRegions: [{ x: 0.1, y: 0.06, width: 0.8, height: 0.88 }],
    minimumSubjectContrast: 3.8,
    permitsTextOrSignage: false,
    parallaxDepth: 0.12,
    paint: {
      kind: "gradient",
      gradient:
        "radial-gradient(circle at 22% 20%, rgba(70,91,134,.42), transparent 38%), radial-gradient(circle at 78% 74%, rgba(92,57,112,.32), transparent 42%), linear-gradient(155deg, #10131b 0%, #090b10 100%)",
    },
  },
  "editorial-neon": {
    id: "editorial-neon",
    visualEnergy: "expressive",
    orientation: "orientation-free",
    subjectSafeRegions: [{ x: 0.12, y: 0.08, width: 0.76, height: 0.84 }],
    minimumSubjectContrast: 3.5,
    permitsTextOrSignage: false,
    parallaxDepth: 0.1,
    paint: {
      kind: "gradient",
      gradient:
        "radial-gradient(circle at 14% 68%, rgba(0,194,203,.2), transparent 32%), radial-gradient(circle at 84% 24%, rgba(218,62,143,.18), transparent 34%), linear-gradient(150deg, #110f1d 0%, #0a1018 55%, #100d17 100%)",
    },
  },
  "signal-pop": {
    id: "signal-pop",
    visualEnergy: "expressive",
    orientation: "orientation-free",
    subjectSafeRegions: [{ x: 0.08, y: 0.08, width: 0.84, height: 0.84 }],
    minimumSubjectContrast: 4.2,
    permitsTextOrSignage: false,
    parallaxDepth: 0.14,
    paint: {
      kind: "gradient",
      gradient:
        "radial-gradient(circle at 8% 22%, rgba(22,184,201,.46), transparent 29%), radial-gradient(circle at 91% 18%, rgba(118,80,189,.48), transparent 31%), radial-gradient(circle at 12% 84%, rgba(241,107,79,.36), transparent 30%), radial-gradient(circle at 91% 82%, rgba(229,161,59,.32), transparent 29%), linear-gradient(145deg, #171c31 0%, #101528 52%, #171329 100%)",
    },
  },
};

export function requireBackdropProfile(id: BackdropProfileId): BackdropProfile {
  const profile = BACKDROP_PROFILES[id];
  if (!profile) {
    throw new Error(`VISUAL_BACKDROP_PROFILE_MISSING: backdrop profile "${id}" is not registered.`);
  }
  return profile;
}
