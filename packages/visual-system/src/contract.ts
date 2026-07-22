export type VisualPlatform = "ios" | "android";
export type VisualAppearance = "light" | "dark";
export type VisualDirection = "ltr" | "rtl";

export interface VisualPoint {
  x: number;
  y: number;
}

export interface VisualSize {
  width: number;
  height: number;
}

export interface VisualRect extends VisualPoint, VisualSize {}

export interface VisualInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export type VisualCoordinateSpace =
  | "device-physical"
  | "platform-logical"
  | "app-logical"
  | "stage-world"
  | "output-pixel";

export type HardwareRegionKind =
  | "sensor-housing"
  | "camera-cutout"
  | "display-curve"
  | "hinge";

export interface HardwareRegion {
  id: string;
  kind: HardwareRegionKind;
  /** Device-display physical pixels. */
  rect: VisualRect;
}

export interface VisualHardwareProfile {
  id: string;
  name: string;
  platform: VisualPlatform;
  type: "phone" | "tablet" | "desktop" | "watch";
  dimensions: VisualSize & { depth?: number };
  display: VisualRect & {
    ppi: number;
    cornerRadius: number;
  };
  /** Physical display pixels per platform logical point/dp. */
  pointScale: number;
  platformProfileId: PlatformDesignProfileId;
  /** Frameless canvases opt out; physical devices always enable platform chrome. */
  systemSurfaces: boolean;
  hardwareRegions: readonly HardwareRegion[];
}

export interface VisualShadow {
  offsetX: number;
  offsetY: number;
  blur: number;
  spread: number;
  color: string;
}

export interface VisualStroke {
  width: number;
  color: string;
}

/** Structured and inspectable material data. Painters own CSS serialization. */
export interface MaterialRecipe {
  fill: string;
  backdropBlur: number;
  backdropSaturation: number;
  backdropBrightness: number;
  stroke?: VisualStroke;
  shadows: readonly VisualShadow[];
  /** Minimum contrast requested against content immediately behind the material. */
  minimumBackdropContrast: number;
}

export interface TypographyStyle {
  family: string;
  fontAssetId: string;
  size: number;
  lineHeight: number;
  weight: 400 | 500 | 600 | 700;
  letterSpacing: number;
}

export type TypographyRole =
  | "caption"
  | "body"
  | "body-strong"
  | "title"
  | "large-title"
  | "keyboard-key"
  | "keyboard-special"
  | "notification-app"
  | "notification-title"
  | "notification-body"
  | "notification-time";

export interface PlatformTypographyProfile {
  primaryFamily: string;
  primaryFontAssetId: string;
  scriptFamilies: Readonly<Record<string, string>>;
  roles: Readonly<Record<TypographyRole, TypographyStyle>>;
}

export interface PlatformPalette {
  primaryText: string;
  secondaryText: string;
  tertiaryText: string;
  accent: string;
  destructive: string;
  surface: string;
  surfaceRaised: string;
  separator: string;
  keyboardKey: string;
  keyboardKeyPressed: string;
  keyboardSpecialKey: string;
  keyboardSpecialKeyPressed: string;
  keyboardAccentKey: string;
  keyboardAccentKeyPressed: string;
  notificationCard: string;
  notificationCardSecondary: string;
  notificationCenterScrim: string;
  island: string;
}

export interface PlatformGeometryProfile {
  minimumContentInsets: VisualInsets;
  minimumTouchTarget: number;
  statusBarHeight: number;
  homeIndicator: {
    bottom: number;
    width: number;
    height: number;
    radius: number;
  };
  keyboard: {
    height: number;
    candidateHeight: number;
    keyHeight: number;
    keyRadius: number;
    keyGap: number;
    rowGap: number;
    horizontalPadding: number;
    topPadding: number;
    bottomPadding: number;
  };
  notification: {
    islandClearance: number;
    horizontalMargin: number;
    minimumHeight: number;
    cardRadius: number;
    cardPadding: number;
    iconSize: number;
    lockScreenTop: number;
    centerTop: number;
    stackGap: number;
    maxLockScreenGroups: number;
    maxCenterGroups: number;
  };
}

export interface PlatformMotionProfile {
  keyboardEnterSeconds: number;
  keyboardExitSeconds: number;
  keyPressSeconds: number;
  keyPreviewSeconds: number;
  notificationBannerEnterFramesAt30: number;
  notificationBannerExitFramesAt30: number;
  notificationCardEnterFramesAt30: number;
  notificationCenterEnterFramesAt30: number;
  islandMorphFramesAt30: number;
}

export type PlatformDesignProfileId =
  | "ios:liquid-glass@1"
  | "android:material3@1";

export interface PlatformDesignProfile {
  id: PlatformDesignProfileId;
  version: 1;
  platform: VisualPlatform;
  source: {
    label: string;
    url: string;
    calibratedAt: string;
  };
  typography: PlatformTypographyProfile;
  geometry: PlatformGeometryProfile;
  motion: PlatformMotionProfile;
  appearances: Readonly<
    Record<
      VisualAppearance,
      {
        palette: PlatformPalette;
        materials: {
          chrome: MaterialRecipe;
          chromeRaised: MaterialRecipe;
          keyboard: MaterialRecipe;
          notification: MaterialRecipe;
          notificationSecondary: MaterialRecipe;
          island: MaterialRecipe;
        };
      }
    >
  >;
}

export interface VisualEnvironmentIR {
  platformProfileId: PlatformDesignProfileId;
  appearance: VisualAppearance;
  locale: string;
  direction: VisualDirection;
  textScale: number;
  contrast: "standard" | "increased";
  motion: "full" | "reduced";
  /** Deterministic color seed for platform profiles that support environment color. */
  colorSeed?: string;
}

export interface ResolvedPlatformVisuals {
  profileId: PlatformDesignProfileId;
  version: 1;
  platform: VisualPlatform;
  appearance: VisualAppearance;
  locale: string;
  direction: VisualDirection;
  textScale: number;
  contrast: "standard" | "increased";
  motion: "full" | "reduced";
  typography: PlatformTypographyProfile;
  geometry: PlatformGeometryProfile;
  palette: PlatformPalette;
  materials: PlatformDesignProfile["appearances"][VisualAppearance]["materials"];
  motionProfile: PlatformMotionProfile;
  signature: string;
}

export type SystemRegionKind =
  | "hardware"
  | "status-bar"
  | "home-gesture"
  | "keyboard"
  | "notification"
  | "activity";

export interface SystemRegion {
  id: string;
  kind: SystemRegionKind;
  rect: VisualRect;
  behavior: "blocks-content" | "overlays-content" | "protects-editorial";
  zIndex: number;
}

export interface SystemGeometryState {
  keyboard?: {
    visible: boolean;
    progress: number;
    height?: number;
  };
  notification?: {
    bannerVisible: boolean;
    bannerHeight?: number;
  };
  activity?: {
    visible: boolean;
    rect: VisualRect;
  };
}

export interface AppViewportFrame {
  coordinateSpace: "platform-logical";
  viewport: VisualRect;
  contentRect: VisualRect;
  contentInsets: VisualInsets;
  occlusions: readonly SystemRegion[];
  signature: string;
}

export interface SystemGeometryFrame {
  coordinateSpace: "platform-logical";
  viewport: VisualRect;
  pointScale: number;
  regions: readonly SystemRegion[];
  appViewport: AppViewportFrame;
  signature: string;
}

export type CompositionProfileId =
  | "hero-device"
  | "content-detail"
  | "wide-context"
  | "duo-balanced"
  | "handoff-pip"
  | "notification-focus"
  | "keyboard-focus";

export interface EditorialCompositionProfile {
  id: CompositionProfileId;
  targetFill: { min: number; preferred: number; max: number };
  editorialInsets: VisualInsets;
  preferredPosition: readonly [number, number];
  protectedRegionPadding: number;
  negativeSpacePreference:
    | "none"
    | "left"
    | "right"
    | "top"
    | "bottom";
}

export type BackdropProfileId =
  | "studio-quiet-dark"
  | "studio-quiet-light"
  | "ambient-depth"
  | "editorial-neon";

export interface BackdropProfile {
  id: BackdropProfileId;
  visualEnergy: "quiet" | "balanced" | "expressive";
  orientation: "upright" | "orientation-free";
  subjectSafeRegions: readonly VisualRect[];
  minimumSubjectContrast: number;
  permitsTextOrSignage: boolean;
  parallaxDepth: number;
  paint:
    | { kind: "solid"; color: string }
    | { kind: "gradient"; gradient: string };
}
