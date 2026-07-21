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
  type DeviceProfile,
  type DeviceRegistries,
  type SystemSurfaceProjection,
} from "@tokovo/devices";
import { useRendererRegistries } from "../RegistryContext.js";

const log = createScopedLogger("renderer");

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
  /** Viewport height after accounting for header/input */
  effectiveViewportHeight: number;
  /** Canonical keyboard + app-field projection for this device/frame. */
  inputProjection?: InputProjection;
  /** Canonical OS-owned notification projection for this device/frame. */
  notificationProjection?: NotificationDeviceProjection;
  /** Canonical lock/home projection owned by the device package. */
  systemSurfaceProjection?: SystemSurfaceProjection;
  /** Whether this is a fallback/error state */
  isError: boolean;
}

// =============================================================================
// NULL LAYOUT (safe fallback when device not found)
// =============================================================================

const NULL_DEVICE: DeviceState = {
  id: "__null__",
  profileId: "iphone16",
  isLocked: true,
};

const NULL_LAYOUT: LayoutState = {
  kind: "TRANSITION",
  deviceTranslateX: 0,
  deviceTranslateY: 0,
  deviceScale: 1,
  deviceRotation: 0,
  overlayOpacity: 0,
  meta: {},
};

const FALLBACK_PROFILE: DeviceProfile = {
  id: "fallback",
  name: "Fallback Device",
  type: "phone",
  platform: "ios",
  dimensions: { width: 393, height: 852 },
  screen: { width: 393, height: 852, ppi: 460, cornerRadius: 0 },
  pixelDensity: 3,
  safeArea: { top: 0, bottom: 0, left: 0, right: 0 },
};

function resolveProfile(registries: DeviceRegistries, profileId?: string): DeviceProfile {
  if (profileId) {
    const profile = registries.devices.get(profileId);
    if (profile) return profile;
  }

  if (registries.devices.has("iphone16")) {
    const profile = registries.devices.get("iphone16");
    if (profile) return profile;
  }

  const firstId = registries.devices.list()[0];
  if (firstId) {
    const profile = registries.devices.get(firstId);
    if (profile) return profile;
  }

  return FALLBACK_PROFILE;
}

function buildNullLayoutOutput(profile: DeviceProfile): LayoutEngineOutput {
  return {
    deviceId: "__null__",
    device: { ...NULL_DEVICE, profileId: profile.id },
    appId: undefined,
    viewKind: "TRANSITION",
    layout: NULL_LAYOUT,
    profile,
    variant: profile.platform,
    appLogicalScale: 1,
    effectiveViewportHeight: profile.dimensions.height,
    isError: true,
  };
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
          .map((page) => page.apps.map((item) => "appId" in item ? `${item.appId}:${item.badge ?? 0}` : `folder:${item.name}:${item.apps.length}`).join(","))
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
// LAYOUT ENGINE HOOK
// =============================================================================

export function useLayoutEngine(input: LayoutEngineInput): LayoutEngineOutput {
  const { world, t, fps, focusDeviceId } = input;
  const registries = useRendererRegistries();
  const loggedMissingDevices = useRef(new Set<string>());
  const loggedMissingViewMode = useRef(new Set<string>());
  const loggedMissingConversation = useRef(new Set<string>());
  const loggedMissingStory = useRef(new Set<string>());
  const cachedResult = useRef<CachedLayoutResult | null>(null);

  return useMemo(() => {
    const mode = input.mode ?? "preview";
    const config = input.config ?? TokovoConfig;
    const effectiveFps = fps ?? config.rendering.defaultFps;

    // 1. Determine active device
    const deviceId = focusDeviceId || world.camera?.activeDeviceId || Object.keys(world.devices)[0];
    const device = world.devices[deviceId];

    // Return safe fallback instead of crashing
    if (!device) {
      if (!loggedMissingDevices.current.has(deviceId)) {
        loggedMissingDevices.current.add(deviceId);
        log.error(`Layout engine could not resolve device ${deviceId}`, undefined, {
          event: "renderer.layout.device_missing",
          deviceId,
          mode,
        });
      }
      const fallbackProfile = resolveProfile(registries.devices);
      if (mode === "render") {
        throw new Error(`LayoutEngine: Device "${deviceId}" not found in render mode.`);
      }
      return buildNullLayoutOutput(fallbackProfile);
    }

    const appId = device.foregroundAppId;
    const projectedInputSession = input.inputProgram
      ? findInputSessionForProjection(
          input.inputProgram,
          deviceId,
          t,
          effectiveFps,
        )
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
    const cached = cachedResult.current;
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
      const meta = registries.plugins.metadata.get(appId);
      const appState = getAppStateForDevice<import("@tokovo/core").BaseAppState>(
        world,
        appId,
        deviceId,
      );

      if (!appState?.viewMode) {
        if (!loggedMissingViewMode.current.has(appId)) {
          loggedMissingViewMode.current.add(appId);
          log.warn(`App ${appId} is missing viewMode; using preview fallback`, {
            event: "renderer.layout.view_mode_missing",
            appId,
            fallbackViewKind: meta.viewStrategy || "TRANSITION",
          });
        }
        if (mode === "render") {
          throw new Error(`LayoutEngine: App "${appId}" did not provide viewMode in render mode.`);
        }
        viewKind = meta.viewStrategy || "TRANSITION";
      } else {
        viewKind = appState.viewMode;
      }

      if (viewKind === "CHAT") {
        const extendedAppState = appState as typeof appState & { activeConversationId?: string };
        activeConversationId = appState?.conversationId || extendedAppState?.activeConversationId;

        if (!activeConversationId && mode !== "render") {
          if (!loggedMissingConversation.current.has(appId)) {
            loggedMissingConversation.current.add(appId);
            log.warn(
              `App ${appId} is missing conversationId for CHAT view; using preview fallback`,
              {
                event: "renderer.layout.conversation_missing",
                appId,
              },
            );
          }
          const conversations = (appState as { conversations?: unknown })?.conversations;
          if (conversations) {
            if (Array.isArray(conversations)) {
              activeConversationId = conversations[0]?.id;
            } else {
              activeConversationId = Object.keys(conversations as Record<string, unknown>)[0];
            }
          }
        }

        if (!activeConversationId && mode === "render") {
          throw new Error(
            `LayoutEngine: App "${appId}" missing conversationId for CHAT view in render mode.`,
          );
        }
      } else if (viewKind === "STORY") {
        activeStoryId = appState?.activeStoryId;
        if (!activeStoryId && mode !== "render") {
          if (!loggedMissingStory.current.has(appId)) {
            loggedMissingStory.current.add(appId);
            log.warn(`App ${appId} is missing activeStoryId for STORY view`, {
              event: "renderer.layout.story_missing",
              appId,
            });
          }
        }
        if (!activeStoryId && mode === "render") {
          throw new Error(
            `LayoutEngine: App "${appId}" missing activeStoryId for STORY view in render mode.`,
          );
        }
      }
    } else {
      // No app open, show home screen
      viewKind = "HOMESCREEN";
    }

    // 3. Get device profile
    const profile = resolveProfile(registries.devices, device.profileId);
    const pointScale = profile.pixelDensity || 1;
    const appDesignWidth = appId
      ? (registries.plugins.metadata.get(appId).designWidth ?? 393)
      : undefined;
    const appLogicalScale = appDesignWidth
      ? profile.dimensions.width / appDesignWidth
      : 1;
    const notificationProjection = input.notificationProgram
      ? projectNotifications(input.notificationProgram, deviceId, t, {
          viewportWidth: profile.dimensions.width,
          viewportHeight: profile.dimensions.height,
          pointScale,
          safeAreaTop:
            (profile.safeArea?.top ?? profile.camera?.safeAreaTop ?? 0) /
            pointScale,
        })
      : undefined;
    const variant: "ios" | "android" = profile.platform;
    const systemSurfaceProjection = device.isLocked
      ? projectLockscreen({
          profile,
          os: device.os,
          fallbackWallpaper: device.homeScreen?.wallpaper,
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
          themeId: projectedInputSession.keyboard.themeId,
        })
      : undefined;
    const inputProjection = projectedInputSession && inputExperience
      ? projectInputSession(projectedInputSession, t, {
          fps: effectiveFps,
          viewportWidth: profile.dimensions.width,
          viewportHeight: profile.dimensions.height,
          keyboardHeight:
            inputExperience.theme.geometry.height *
            (profile.pixelDensity || 1),
        })
      : undefined;
    const keyboardHeight = inputProjection?.surface.viewportInset ?? 0;

    // 5. Compute effective viewport height (shrinks when keyboard visible)
    const effectiveViewportHeight =
      profile.dimensions.height / appLogicalScale -
      keyboardHeight / appLogicalScale;
    const logicalSafeAreaInsets = {
      top: (profile.safeArea?.top ?? 0) / appLogicalScale,
      bottom: (profile.safeArea?.bottom ?? 0) / appLogicalScale,
      left: (profile.safeArea?.left ?? 0) / appLogicalScale,
      right: (profile.safeArea?.right ?? 0) / appLogicalScale,
    };

    // 5. Build layout context and compute layout
    const layoutContext: LayoutContext = {
      world,
      t,
      activeDeviceId: deviceId,
      activeAppId: appId || "",
      viewKind,
      activeConversationId,
      activeStoryId,
      viewportWidth: profile.dimensions.width / appLogicalScale,
      viewportHeight: effectiveViewportHeight,
      safeAreaInsets: logicalSafeAreaInsets,
      layoutCache: input.layoutCache,
    };

    const layout = computeLayout(layoutContext, registries.plugins.layouts);

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
      effectiveViewportHeight,
      inputProjection,
      notificationProjection,
      systemSurfaceProjection,
      isError: false,
    };

    // Store in cache for incremental optimization
    cachedResult.current = {
      frame: t,
      worldSignature,
      deviceId,
      output,
    };

    return output;
  }, [
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
  ]);
}
