/**
 * Layout Engine
 *
 * Pure computation layer that determines:
 * - Which device is active
 * - What view kind to display (CHAT, FEED, LOCKSCREEN, etc.)
 * - Layout positions and scroll state
 *
 * Input: world + time
 * Output: layout blueprint (no JSX)
 *
 * NOTE ON MEMOIZATION:
 * This runs every frame because `world` reference changes on each frame.
 * This is intentional - it's the Update Loop. Keep computations fast,
 * avoid object allocations in loops.
 */

import { useMemo, useRef } from "react";
import {
  WorldState,
  DeviceState,
  LayoutState,
  ViewKind,
  LayoutContext,
  TokovoConfig,
  getAppStateForDevice,
  type TokovoConfigType,
  type LayoutCacheStore,
  createScopedLogger,
} from "@tokovo/core";
import {
  findInputSessionForProjection,
  projectInputSession,
  resolveInputExperience,
  type InputProjection,
  type PreparedInputProgram,
} from "@tokovo/device-keyboard";
import {
  projectNotifications,
  type NotificationDeviceProjection,
  type PreparedNotificationProgram,
} from "@tokovo/device-notifications";
import { computeLayout } from "../layout/index.js";
import {
  projectHomeScreen,
  projectLockscreen,
  projectSystemSurfaceLayout,
  resolveDevicePlatformVisuals,
  resolveDeviceSystemGeometry,
  type DeviceProfile,
  type DeviceRegistries,
  type SystemSurfaceProjection,
} from "@tokovo/devices";
import {
  scaleAppViewportFrame,
  type AppViewportFrame,
  type ResolvedPlatformVisuals,
  type SystemGeometryFrame,
} from "@tokovo/visual-system";
import { useRendererRegistries } from "../RegistryContext.js";
import type { RendererRegistries } from "../RegistryContext.js";

const log = createScopedLogger("renderer");

/** Phone apps and OS chrome must share the device's logical point grid. */
export function resolveAppDesignWidth(profile: DeviceProfile, authoredWidth: number): number {
  return profile.type === "phone" ? profile.display.width / profile.pointScale : authoredWidth;
}

// =============================================================================
// INPUT / OUTPUT TYPES
// =============================================================================

export interface LayoutEngineInput {
  world: WorldState;
  t: number;
  fps?: number;
  focusDeviceId?: string;
  mode?: "preview" | "render";
  config?: TokovoConfigType;
  layoutCache?: LayoutCacheStore;
  inputProgram?: PreparedInputProgram;
  notificationProgram?: PreparedNotificationProgram;
}

export interface LayoutEngineOutput {
  /** Active device ID */
  deviceId: string;
  /** Active device state */
  device: DeviceState;
  /** Foreground app ID (if any) */
  appId: string | undefined;
  /** What type of view to render */
  viewKind: ViewKind;
  /** Computed layout state (discriminated union - use layout.kind to narrow) */
  layout: LayoutState;
  /** Device profile (from device registries) */
  profile: DeviceProfile;
  /** Platform variant */
  variant: "ios" | "android";
  /** App design width before AppSurface maps it onto the physical device. */
  appDesignWidth?: number;
  /** Exact app-logical to device-screen scale used by AppSurface. */
  appLogicalScale: number;
  /** Active conversation (for chat views) */
  activeConversationId?: string;
  /** Active story (for story views) */
  activeStoryId?: string;
  /** Canonical system geometry for this device/frame. */
  systemGeometry: SystemGeometryFrame;
  /** System geometry transformed into the app's registered design coordinates. */
  appViewport: AppViewportFrame;
  /** Fully resolved platform environment shared by apps and system painters. */
  platformVisuals: ResolvedPlatformVisuals;
  /** Canonical keyboard + app-field projection for this device/frame. */
  inputProjection?: InputProjection;
  /** Canonical OS-owned notification projection for this device/frame. */
  notificationProjection?: NotificationDeviceProjection;
  /** Canonical lock/home projection owned by the device package. */
  systemSurfaceProjection?: SystemSurfaceProjection;
}

function resolveProfile(registries: DeviceRegistries, profileId?: string): DeviceProfile {
  if (!profileId) {
    throw new Error("DEVICE_PROFILE_ID_MISSING: Device state has no profileId.");
  }
  const profile = registries.devices.get(profileId);
  if (!profile) {
    throw new Error(`DEVICE_PROFILE_MISSING: Device profile "${profileId}" is not registered.`);
  }
  return profile;
}

// =============================================================================
// INCREMENTAL LAYOUT CACHE
// =============================================================================

interface CachedLayoutResult {
  frame: number;
  worldSignature: string;
  deviceId: string;
  output: LayoutEngineOutput;
}

/** Per-renderer state for deterministic diagnostics and incremental layout reuse. */
export interface LayoutEngineRuntime {
  readonly loggedMissingDevices: Set<string>;
  readonly cachedResults: Map<string, CachedLayoutResult>;
}

export function createLayoutEngineRuntime(): LayoutEngineRuntime {
  return {
    loggedMissingDevices: new Set<string>(),
    cachedResults: new Map<string, CachedLayoutResult>(),
  };
}

/**
 * Compute a signature for the relevant world state parts.
 * Only changes when layout-affecting state changes.
 */
function computeWorldSignature(
  world: WorldState,
  deviceId: string,
  appId: string | undefined,
  _frame: number,
  _fps: number,
): string {
  // Fast path: compute a lightweight signature from state that affects layout
  const device = world.devices[deviceId];
  const appState = appId ? getAppStateForDevice(world, appId, deviceId) : undefined;

  // Hash key components that affect layout
  const parts = [
    deviceId,
    device?.foregroundAppId ?? "",
    device?.isLocked ? "1" : "0",
    appId ?? "",
    device?.os?.locale ?? "",
    device?.os?.appearance ?? "",
    device?.os?.hourCycle ?? "",
    String(device?.os?.clock ?? 0),
    device?.os?.lockScreenWallpaper ?? "",
    device?.homeScreen?.wallpaper ?? "",
    device?.homeScreen
      ? device.homeScreen.pages
          .map((page) =>
            page.apps
              .map((item) =>
                "appId" in item
                  ? `${item.appId}:${item.badge ?? 0}`
                  : `folder:${item.name}:${item.apps.length}`,
              )
              .join(","),
          )
          .join("|")
      : "",
    // For chat apps, include conversation and message count
    (appState as { conversationId?: string } | undefined)?.conversationId ?? "",
    // Include viewMode if present
    (appState as { viewMode?: string } | undefined)?.viewMode ?? "",
    // Static plugin layouts must expose a monotonic invalidation key. Screen
    // is included separately so authored bootstrap state is cache-safe too.
    (appState as { currentScreen?: string } | undefined)?.currentScreen ?? "",
    String((appState as { layoutRevision?: number } | undefined)?.layoutRevision ?? 0),
  ];

  // For chat apps, include message count for layout invalidation
  const conversationId = (appState as { conversationId?: string } | undefined)?.conversationId;
  if (conversationId && appState) {
    const conversations = (appState as { conversations?: Record<string, { messages?: unknown[] }> })
      .conversations;
    const convo = conversations?.[conversationId];
    if (convo?.messages) {
      parts.push(String(convo.messages.length));
    }
  }

  return parts.join("|");
}

// =============================================================================
// LAYOUT ENGINE
// =============================================================================

/**
 * Headless layout projection shared by the React surface and Camera VNext's
 * multi-device stage. It is intentionally callable in a deterministic loop;
 * React hooks remain in the tiny adapter below.
 */
export function computeLayoutEngine(
  input: LayoutEngineInput,
  registries: RendererRegistries,
  runtime: LayoutEngineRuntime,
): LayoutEngineOutput {
  const { world, t, fps, focusDeviceId } = input;
  const mode = input.mode ?? "preview";
  const config = input.config ?? TokovoConfig;
  const effectiveFps = fps ?? config.rendering.defaultFps;

  const deviceIds = Object.keys(world.devices);
  if (!focusDeviceId && deviceIds.length !== 1) {
    throw new Error(
      `DEVICE_LAYOUT_FOCUS_REQUIRED: expected focusDeviceId for ${deviceIds.length} devices.`,
    );
  }
  const deviceId = focusDeviceId ?? deviceIds[0];
  const device = world.devices[deviceId];

  if (!device) {
    if (!runtime.loggedMissingDevices.has(deviceId)) {
      runtime.loggedMissingDevices.add(deviceId);
      log.error(`Layout engine could not resolve device ${deviceId}`, undefined, {
        event: "renderer.layout.device_missing",
        deviceId,
        mode,
      });
    }
    throw new Error(`DEVICE_LAYOUT_MISSING: Device "${deviceId}" is absent from world state.`);
  }

  const appId = device.foregroundAppId;
  let projectedInputSession = input.inputProgram
    ? findInputSessionForProjection(input.inputProgram, deviceId, t, effectiveFps)
    : undefined;
  // INCREMENTAL CACHE CHECK
  // If world signature hasn't changed for this frame, return cached result
  const worldSignature = `${computeWorldSignature(
    world,
    deviceId,
    appId,
    t,
    effectiveFps,
  )}|${projectedInputSession ? `${projectedInputSession.id}:${t}` : "no-input"}|${
    input.notificationProgram ? `notifications:${t}` : "no-notifications"
  }`;
  const cached = runtime.cachedResults.get(deviceId);
  if (
    cached &&
    cached.deviceId === deviceId &&
    cached.worldSignature === worldSignature &&
    (cached.frame === t || cached.output.layout.cacheHint === "static")
  ) {
    return cached.output;
  }

  // 2. Determine ViewKind
  let viewKind: ViewKind = "TRANSITION";
  let activeConversationId: string | undefined;
  let activeStoryId: string | undefined;

  if (device.isLocked) {
    viewKind = "LOCKSCREEN";
  } else if (appId) {
    const appState = getAppStateForDevice<import("@tokovo/core").BaseAppState>(
      world,
      appId,
      deviceId,
    );

    if (!appState?.viewMode) {
      throw new Error(`APP_VIEW_MODE_MISSING: app "${appId}" did not project viewMode.`);
    } else {
      viewKind = appState.viewMode;
    }

    if (viewKind === "CHAT") {
      const extendedAppState = appState as typeof appState & {
        activeConversationId?: string;
      };
      activeConversationId = appState?.conversationId || extendedAppState?.activeConversationId;

      if (!activeConversationId) {
        throw new Error(
          `APP_CONVERSATION_MISSING: app "${appId}" is in CHAT without a conversation id.`,
        );
      }
    } else if (viewKind === "STORY") {
      activeStoryId = appState?.activeStoryId;
      if (!activeStoryId) {
        throw new Error(
          `APP_STORY_MISSING: app "${appId}" is in STORY without an active story id.`,
        );
      }
    }
  } else {
    // No app open, show home screen
    viewKind = "HOMESCREEN";
  }

  // 3. Get device profile
  const profile = resolveProfile(registries.devices, device.profileId);
  const pointScale = profile.pointScale;
  const os = device.os;
  if (!os) {
    throw new Error(`DEVICE_OS_STATE_MISSING: Device "${deviceId}" has no OS environment.`);
  }
  const osAppearance = os.appearance;
  const osLocale = os.locale;
  const visualPreferences = {
    textScale: os.textScale,
    contrast: os.contrast,
    motion: os.motion,
    transparency: os.transparency,
    materialPreference: os.materialPreference,
    colorSeed: os.colorSeed,
  };
  const platformVisuals = resolveDevicePlatformVisuals(
    profile,
    osAppearance,
    osLocale,
    visualPreferences,
  );
  const authoredWidth = appId ? registries.plugins.metadata.get(appId).designWidth : undefined;
  if (appId && authoredWidth === undefined) {
    throw new Error(`APP_DESIGN_WIDTH_MISSING: App "${appId}" must register assets.designWidth.`);
  }
  const appDesignWidth =
    authoredWidth === undefined ? undefined : resolveAppDesignWidth(profile, authoredWidth);
  const appLogicalScale = appDesignWidth ? profile.display.width / appDesignWidth : 1;
  const notificationProjection = input.notificationProgram
    ? projectNotifications(input.notificationProgram, deviceId, t, {
        viewportWidth: profile.display.width,
        viewportHeight: profile.display.height,
        pointScale,
        clockMs: os.clock,
      })
    : undefined;
  const variant: "ios" | "android" = profile.platform;
  const notificationInputId = notificationProjection?.expanded?.inputSessionId;
  const notificationOwnsInput = Boolean(notificationInputId);
  if (notificationInputId) {
    projectedInputSession = input.inputProgram?.sessions.find((session) => session.id === notificationInputId && session.deviceId === deviceId);
  } else if (input.notificationProgram?.interactions.some((interaction) =>
    interaction.type === "beginReply" && interaction.inputSessionId === projectedInputSession?.id)) {
    projectedInputSession = undefined;
  }
  const systemSurfaceProjection = device.isLocked
    ? projectLockscreen({
        notificationUX: notificationProjection?.notificationUX,
        authenticated: notificationProjection?.notificationUX === "native" && notificationProjection.deviceContext.isAuthenticated,
        profile,
        os: device.os,
        homeWallpaper: device.homeScreen?.wallpaper,
      })
    : !appId && device.homeScreen
      ? projectHomeScreen({ profile, os: device.os, config: device.homeScreen })
      : undefined;

  // 4. Compute keyboard height (for viewport shrink when typing)
  const inputExperience = projectedInputSession
    ? resolveInputExperience({
        platform: projectedInputSession.keyboard.platform,
        appearance: projectedInputSession.keyboard.appearance,
        locale: projectedInputSession.keyboard.locale.tag,
        platformProfileId: projectedInputSession.keyboard.platformProfileId,
        preferences: projectedInputSession.keyboard.visualPreferences,
      })
    : undefined;
  const inputProjection =
    projectedInputSession && inputExperience
      ? projectInputSession(projectedInputSession, t, {
          fps: effectiveFps,
          viewportWidth: profile.display.width,
          viewportHeight: profile.display.height,
          keyboardHeight: platformVisuals.geometry.keyboard.height * pointScale,
        })
      : undefined;
  if (notificationProjection?.expanded && notificationOwnsInput && inputProjection) {
    notificationProjection.expanded.draft = inputProjection.displayDraft;
    notificationProjection.expanded.keyboardInset = inputProjection.surface.viewportInset;
  }
  const systemGeometry = resolveDeviceSystemGeometry(profile, {
    appearance: osAppearance,
    locale: osLocale,
    preferences: visualPreferences,
    state: {
      keyboard: inputProjection && !notificationOwnsInput
        ? {
            visible: inputProjection.surface.visible,
            progress: inputProjection.surface.progress,
            height: platformVisuals.geometry.keyboard.height,
          }
        : undefined,
      notification: {
        bannerVisible: Boolean(notificationProjection?.banner),
        bannerHeight: platformVisuals.geometry.notification.minimumHeight,
      },
    },
  });
  const platformToAppScale = appLogicalScale / pointScale;
  const appViewport = scaleAppViewportFrame(systemGeometry.appViewport, platformToAppScale);

  // 5. Build layout context and compute layout
  const layoutContext: LayoutContext = {
    world,
    t,
    activeDeviceId: deviceId,
    activeAppId: appId || "",
    platform: variant,
    viewKind,
    activeConversationId,
    activeStoryId,
    viewportWidth: appViewport.viewport.width,
    viewportHeight: appViewport.viewport.height,
    appViewport,
    inputValues: inputProjection && !notificationOwnsInput ? { [inputProjection.fieldId]: inputProjection.displayDraft } : undefined,
    layoutCache: input.layoutCache,
  };

  const layout = systemSurfaceProjection
    ? projectSystemSurfaceLayout(systemSurfaceProjection)
    : computeLayout(layoutContext, registries.plugins.layouts);

  const output: LayoutEngineOutput = {
    deviceId,
    device,
    appId,
    viewKind,
    layout,
    profile,
    variant,
    appDesignWidth,
    appLogicalScale,
    activeConversationId,
    activeStoryId,
    systemGeometry,
    appViewport,
    platformVisuals,
    inputProjection,
    notificationProjection,
    systemSurfaceProjection,
  };

  // Store in cache for incremental optimization
  runtime.cachedResults.set(deviceId, {
    frame: t,
    worldSignature,
    deviceId,
    output,
  });

  return output;
}

// =============================================================================
// REACT ADAPTER
// =============================================================================

export function useLayoutEngine(input: LayoutEngineInput): LayoutEngineOutput {
  const { world, t, fps, focusDeviceId } = input;
  const registries = useRendererRegistries();
  const runtime = useRef<LayoutEngineRuntime | null>(null);
  const layoutRuntime = runtime.current ?? createLayoutEngineRuntime();
  runtime.current = layoutRuntime;

  return useMemo(
    () => computeLayoutEngine(input, registries, layoutRuntime),
    [
      world,
      t,
      focusDeviceId,
      fps,
      registries,
      input.mode,
      input.config,
      input.layoutCache,
      input.inputProgram,
      input.notificationProgram,
      layoutRuntime,
    ],
  );
}
