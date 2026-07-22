import type {
  AppViewportFrame,
  ResolvedPlatformVisuals,
  SystemGeometryFrame,
  SystemGeometryState,
  SystemRegion,
  VisualEnvironmentIR,
  VisualHardwareProfile,
  VisualInsets,
  VisualRect,
} from "./contract.js";
import {
  platformDesignRegistry,
  type PlatformDesignRegistry,
} from "./registry.js";

function finitePositive(value: number, label: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`VISUAL_GEOMETRY_INVALID: ${label} must be positive.`);
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

/** Creates a complete app viewport for focused tests and non-device canvases. */
export function createAppViewportFrame(input: {
  width: number;
  height: number;
  contentInsets?: Partial<VisualInsets>;
  occlusions?: readonly SystemRegion[];
}): AppViewportFrame {
  finitePositive(input.width, "app viewport width");
  finitePositive(input.height, "app viewport height");
  const contentInsets: VisualInsets = {
    top: input.contentInsets?.top ?? 0,
    right: input.contentInsets?.right ?? 0,
    bottom: input.contentInsets?.bottom ?? 0,
    left: input.contentInsets?.left ?? 0,
  };
  const viewport = { x: 0, y: 0, width: input.width, height: input.height };
  const contentRect = {
    x: contentInsets.left,
    y: contentInsets.top,
    width: Math.max(0, input.width - contentInsets.left - contentInsets.right),
    height: Math.max(0, input.height - contentInsets.top - contentInsets.bottom),
  };
  const data = {
    coordinateSpace: "platform-logical" as const,
    viewport,
    contentRect,
    contentInsets,
    occlusions: input.occlusions ?? [],
  };
  return { ...data, signature: signature(data) };
}

export function resolvePlatformVisuals(
  environment: VisualEnvironmentIR,
  registry: PlatformDesignRegistry = platformDesignRegistry,
): ResolvedPlatformVisuals {
  finitePositive(environment.textScale, "textScale");
  const profile = registry.require(environment.platformProfileId);
  const appearance = profile.appearances[environment.appearance];
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
    typography: profile.typography,
    geometry: profile.geometry,
    palette: appearance.palette,
    materials: appearance.materials,
    motionProfile: profile.motion,
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
    behavior: "blocks-content",
    zIndex: 100,
  }));
  if (hardware.systemSurfaces) {
    regions.push({
      id: "system.status-bar",
      kind: "status-bar",
      rect: { x: 0, y: 0, width: viewport.width, height: base.top },
      behavior: "blocks-content",
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
      behavior: "blocks-content",
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
      behavior: "blocks-content",
      zIndex: 200,
    });
  }

  if (state.notification?.bannerVisible) {
    const height =
      state.notification.bannerHeight ?? visuals.geometry.notification.minimumHeight;
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

  const contentInsets: VisualInsets = {
    ...base,
    bottom: Math.max(base.bottom, keyboardHeight),
  };
  const contentRect: VisualRect = {
    x: contentInsets.left,
    y: contentInsets.top,
    width: Math.max(0, viewport.width - contentInsets.left - contentInsets.right),
    height: Math.max(0, viewport.height - contentInsets.top - contentInsets.bottom),
  };
  const occlusions = regions.filter(
    (region) => region.behavior !== "protects-editorial",
  );
  const appFrameData = {
    coordinateSpace: "platform-logical" as const,
    viewport,
    contentRect,
    contentInsets,
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

export function scaleAppViewportFrame(
  frame: AppViewportFrame,
  scale: number,
): AppViewportFrame {
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
    contentRect: rect(frame.contentRect),
    contentInsets: insets(frame.contentInsets),
    occlusions: frame.occlusions.map((region) => ({
      ...region,
      rect: rect(region.rect),
    })),
  };
  return { ...scaled, signature: signature(scaled) };
}
