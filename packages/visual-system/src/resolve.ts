import type {
  AppViewportFrame,
  MaterialRecipe,
  PlatformMotionProfile,
  PlatformPalette,
  PlatformTypographyProfile,
  ResolvedPlatformVisuals,
  SystemGeometryFrame,
  SystemGeometryState,
  SystemRegion,
  VisualEnvironmentIR,
  VisualHardwareProfile,
  VisualInsets,
  VisualRect,
} from "./contract.js";
import { platformDesignRegistry, type PlatformDesignRegistry } from "./registry.js";

function finitePositive(value: number, label: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`VISUAL_GEOMETRY_INVALID: ${label} must be positive.`);
  }
}

function finiteRange(value: number, min: number, max: number, label: string): void {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error(`VISUAL_ENVIRONMENT_INVALID: ${label} must be between ${min} and ${max}.`);
  }
}

function stableHash(input: string): string {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function signature(value: unknown): string {
  return stableHash(JSON.stringify(value));
}

function scaleRect(rect: VisualRect, scale: number): VisualRect {
  return {
    x: rect.x / scale,
    y: rect.y / scale,
    width: rect.width / scale,
    height: rect.height / scale,
  };
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function seededHue(seed: string): number {
  const normalized = seed.trim();
  const hex = /^#?([0-9a-f]{6})$/iu.exec(normalized)?.[1];
  if (hex) {
    const red = Number.parseInt(hex.slice(0, 2), 16) / 255;
    const green = Number.parseInt(hex.slice(2, 4), 16) / 255;
    const blue = Number.parseInt(hex.slice(4, 6), 16) / 255;
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    const delta = max - min;
    if (delta === 0) return 0;
    const hue =
      max === red
        ? ((green - blue) / delta) % 6
        : max === green
          ? (blue - red) / delta + 2
          : (red - green) / delta + 4;
    return Math.round((hue * 60 + 360) % 360);
  }
  return Number.parseInt(stableHash(normalized), 16) % 360;
}

function resolvePalette(
  palette: PlatformPalette,
  platform: ResolvedPlatformVisuals["platform"],
  appearance: ResolvedPlatformVisuals["appearance"],
  contrast: VisualEnvironmentIR["contrast"],
  colorSeed?: string,
): PlatformPalette {
  const increased =
    contrast === "increased"
      ? {
          primaryText: appearance === "dark" ? "#FFFFFF" : "#000000",
          secondaryText: appearance === "dark" ? "#F1F1F5" : "#242428",
          tertiaryText: appearance === "dark" ? "#D8D8DE" : "#3E3E43",
          separator: appearance === "dark" ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.38)",
        }
      : {};
  if (platform !== "android" || !colorSeed?.trim()) {
    return { ...palette, ...increased };
  }
  const hue = seededHue(colorSeed);
  const seeded =
    appearance === "dark"
      ? {
          accent: `hsl(${hue} 72% 82%)`,
          keyboardAccentKey: `hsl(${hue} 56% 78%)`,
          keyboardAccentKeyPressed: `hsl(${hue} 56% 68%)`,
          notificationCardSecondary: `hsl(${hue} 18% 24%)`,
          surfaceRaised: `hsl(${hue} 10% 18%)`,
        }
      : {
          accent: `hsl(${hue} 68% 38%)`,
          keyboardAccentKey: `hsl(${hue} 62% 40%)`,
          keyboardAccentKeyPressed: `hsl(${hue} 62% 31%)`,
          notificationCardSecondary: `hsl(${hue} 34% 91%)`,
          surfaceRaised: `hsl(${hue} 28% 98%)`,
        };
  return { ...palette, ...seeded, ...increased };
}

function withOpaqueAlpha(fill: string, alpha: number): string {
  const rgba = /^rgba\(([^,]+),([^,]+),([^,]+),([^)]+)\)$/u.exec(fill.replaceAll(" ", ""));
  return rgba ? `rgba(${rgba[1]},${rgba[2]},${rgba[3]},${Math.max(Number(rgba[4]), alpha)})` : fill;
}

function resolveMaterial(
  material: MaterialRecipe,
  environment: VisualEnvironmentIR,
): MaterialRecipe {
  const reducedTransparency = environment.transparency === "reduced";
  const preference = environment.materialPreference;
  const clearMultiplier = preference === "clear" ? 1.2 : preference === "regular" ? 0.8 : 1;
  return {
    ...material,
    fill:
      reducedTransparency || environment.contrast === "increased"
        ? withOpaqueAlpha(material.fill, reducedTransparency ? 0.96 : 0.9)
        : material.fill,
    backdropBlur: reducedTransparency
      ? 0
      : Math.round(material.backdropBlur * clearMultiplier * 100) / 100,
    backdropSaturation: reducedTransparency ? 1 : material.backdropSaturation,
    backdropBrightness: reducedTransparency ? 1 : material.backdropBrightness,
    stroke:
      environment.contrast === "increased"
        ? {
            width: Math.max(material.stroke?.width ?? 0, 1),
            color:
              environment.appearance === "dark" ? "rgba(255,255,255,0.42)" : "rgba(0,0,0,0.34)",
          }
        : material.stroke,
    minimumBackdropContrast:
      environment.contrast === "increased"
        ? Math.max(2, material.minimumBackdropContrast)
        : material.minimumBackdropContrast,
  };
}

function resolveTypography(
  typography: PlatformTypographyProfile,
  textScale: number,
): PlatformTypographyProfile {
  return {
    ...typography,
    roles: Object.fromEntries(
      Object.entries(typography.roles).map(([role, style]) => [
        role,
        {
          ...style,
          size: Math.round(style.size * textScale * 100) / 100,
          lineHeight: Math.round(style.lineHeight * textScale * 100) / 100,
        },
      ]),
    ) as PlatformTypographyProfile["roles"],
  };
}

function resolveMotion(
  motion: PlatformMotionProfile,
  preference: VisualEnvironmentIR["motion"],
): PlatformMotionProfile {
  if (preference === "full") return motion;
  return Object.fromEntries(
    Object.keys(motion).map((key) => [key, 0]),
  ) as unknown as PlatformMotionProfile;
}

/** Creates a complete app viewport for focused tests and non-device canvases. */
export function createAppViewportFrame(input: {
  width: number;
  height: number;
  interactiveInsets?: Partial<VisualInsets>;
  occlusions?: readonly SystemRegion[];
}): AppViewportFrame {
  finitePositive(input.width, "app viewport width");
  finitePositive(input.height, "app viewport height");
  const interactiveInsets: VisualInsets = {
    top: input.interactiveInsets?.top ?? 0,
    right: input.interactiveInsets?.right ?? 0,
    bottom: input.interactiveInsets?.bottom ?? 0,
    left: input.interactiveInsets?.left ?? 0,
  };
  const viewport = { x: 0, y: 0, width: input.width, height: input.height };
  const interactiveRect = {
    x: interactiveInsets.left,
    y: interactiveInsets.top,
    width: Math.max(0, input.width - interactiveInsets.left - interactiveInsets.right),
    height: Math.max(0, input.height - interactiveInsets.top - interactiveInsets.bottom),
  };
  const data = {
    coordinateSpace: "platform-logical" as const,
    viewport,
    interactiveRect,
    interactiveInsets,
    occlusions: input.occlusions ?? [],
  };
  return { ...data, signature: signature(data) };
}

export function resolvePlatformVisuals(
  environment: VisualEnvironmentIR,
  registry: PlatformDesignRegistry = platformDesignRegistry,
): ResolvedPlatformVisuals {
  finitePositive(environment.textScale, "textScale");
  finiteRange(environment.textScale, 0.75, 2, "textScale");
  const profile = registry.require(environment.platformProfileId);
  const appearance = profile.appearances[environment.appearance];
  const palette = resolvePalette(
    appearance.palette,
    profile.platform,
    environment.appearance,
    environment.contrast,
    environment.colorSeed,
  );
  const materials = Object.fromEntries(
    Object.entries(appearance.materials).map(([name, recipe]) => [
      name,
      resolveMaterial(
        {
          ...recipe,
          fill:
            recipe.fill === appearance.palette.notificationCardSecondary
              ? palette.notificationCardSecondary
              : recipe.fill === appearance.palette.surfaceRaised
                ? palette.surfaceRaised
                : recipe.fill,
        },
        environment,
      ),
    ]),
  ) as ResolvedPlatformVisuals["materials"];
  const resolved = {
    profileId: profile.id,
    version: profile.version,
    platform: profile.platform,
    appearance: environment.appearance,
    locale: environment.locale,
    direction: environment.direction,
    textScale: environment.textScale,
    contrast: environment.contrast,
    motion: environment.motion,
    transparency: environment.transparency,
    materialPreference: environment.materialPreference,
    colorSeed: environment.colorSeed,
    typography: resolveTypography(profile.typography, environment.textScale),
    geometry: profile.geometry,
    palette,
    materials,
    motionProfile: resolveMotion(profile.motion, environment.motion),
  } as const;
  return { ...resolved, signature: signature(resolved) };
}

export function resolveSystemGeometry(
  hardware: VisualHardwareProfile,
  visuals: ResolvedPlatformVisuals,
  state: SystemGeometryState = {},
): SystemGeometryFrame {
  finitePositive(hardware.pointScale, "hardware.pointScale");
  finitePositive(hardware.display.width, "hardware.display.width");
  finitePositive(hardware.display.height, "hardware.display.height");
  if (hardware.platform !== visuals.platform) {
    throw new Error(
      `VISUAL_PLATFORM_MISMATCH: hardware ${hardware.id} is ${hardware.platform} but profile ${visuals.profileId} is ${visuals.platform}.`,
    );
  }
  if (hardware.platformProfileId !== visuals.profileId) {
    throw new Error(
      `VISUAL_PROFILE_MISMATCH: hardware ${hardware.id} requires ${hardware.platformProfileId}, received ${visuals.profileId}.`,
    );
  }

  const viewport: VisualRect = {
    x: 0,
    y: 0,
    width: hardware.display.width / hardware.pointScale,
    height: hardware.display.height / hardware.pointScale,
  };
  const base: VisualInsets = hardware.systemSurfaces
    ? visuals.geometry.minimumContentInsets
    : { top: 0, right: 0, bottom: 0, left: 0 };
  const regions: SystemRegion[] = hardware.hardwareRegions.map((region) => ({
    id: region.id,
    kind: "hardware",
    rect: scaleRect(region.rect, hardware.pointScale),
    behavior: "blocks-interaction",
    zIndex: 100,
  }));
  if (hardware.systemSurfaces) {
    regions.push({
      id: "system.status-bar",
      kind: "status-bar",
      rect: { x: 0, y: 0, width: viewport.width, height: base.top },
      behavior: "overlays-content",
      zIndex: 80,
    });
    regions.push({
      id: "system.home-gesture",
      kind: "home-gesture",
      rect: {
        x: 0,
        y: viewport.height - base.bottom,
        width: viewport.width,
        height: base.bottom,
      },
      behavior: "overlays-content",
      zIndex: 80,
    });
  }

  const keyboardProgress = clamp01(state.keyboard?.progress ?? 0);
  const keyboardHeight = state.keyboard?.visible
    ? (state.keyboard.height ?? visuals.geometry.keyboard.height) * keyboardProgress
    : 0;
  if (keyboardHeight > 0) {
    regions.push({
      id: "system.keyboard",
      kind: "keyboard",
      rect: {
        x: 0,
        y: viewport.height - keyboardHeight,
        width: viewport.width,
        height: keyboardHeight,
      },
      behavior: "blocks-interaction",
      zIndex: 200,
    });
  }

  if (state.notification?.bannerVisible) {
    const height = state.notification.bannerHeight ?? visuals.geometry.notification.minimumHeight;
    const top = base.top + visuals.geometry.notification.islandClearance;
    const margin = visuals.geometry.notification.horizontalMargin;
    regions.push({
      id: "system.notification-banner",
      kind: "notification",
      rect: {
        x: margin,
        y: top,
        width: viewport.width - margin * 2,
        height,
      },
      behavior: "overlays-content",
      zIndex: 300,
    });
  }

  if (state.activity?.visible) {
    regions.push({
      id: "system.activity",
      kind: "activity",
      rect: state.activity.rect,
      behavior: "overlays-content",
      zIndex: 350,
    });
  }

  const interactiveInsets: VisualInsets = {
    ...base,
    bottom: Math.max(base.bottom, keyboardHeight),
  };
  const interactiveRect: VisualRect = {
    x: interactiveInsets.left,
    y: interactiveInsets.top,
    width: Math.max(0, viewport.width - interactiveInsets.left - interactiveInsets.right),
    height: Math.max(0, viewport.height - interactiveInsets.top - interactiveInsets.bottom),
  };
  const occlusions = regions.filter((region) => region.behavior !== "protects-editorial");
  const appFrameData = {
    coordinateSpace: "platform-logical" as const,
    viewport,
    interactiveRect,
    interactiveInsets,
    occlusions,
  };
  const appViewport: AppViewportFrame = {
    ...appFrameData,
    signature: signature(appFrameData),
  };
  const frameData = {
    coordinateSpace: "platform-logical" as const,
    viewport,
    pointScale: hardware.pointScale,
    regions,
    appViewport,
  };
  return { ...frameData, signature: signature(frameData) };
}

export function scaleAppViewportFrame(frame: AppViewportFrame, scale: number): AppViewportFrame {
  finitePositive(scale, "app viewport scale");
  const rect = (value: VisualRect): VisualRect => ({
    x: value.x / scale,
    y: value.y / scale,
    width: value.width / scale,
    height: value.height / scale,
  });
  const insets = (value: VisualInsets): VisualInsets => ({
    top: value.top / scale,
    right: value.right / scale,
    bottom: value.bottom / scale,
    left: value.left / scale,
  });
  const scaled = {
    coordinateSpace: frame.coordinateSpace,
    viewport: rect(frame.viewport),
    interactiveRect: rect(frame.interactiveRect),
    interactiveInsets: insets(frame.interactiveInsets),
    occlusions: frame.occlusions.map((region) => ({
      ...region,
      rect: rect(region.rect),
    })),
  };
  return { ...scaled, signature: signature(scaled) };
}
