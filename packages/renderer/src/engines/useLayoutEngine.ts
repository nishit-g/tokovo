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
  LAYOUT,
  LayoutState,
  ViewKind,
  LayoutContext,
  getKeyboardConfig,
  TokovoConfig,
  type TokovoConfigType,
  type LayoutCacheStore,
} from "@tokovo/core";
import { getKeyboardSlideProgress } from "@tokovo/device-keyboard";
import { computeLayout } from "../layout/index.js";
import type { DeviceProfile, DeviceRegistries } from "@tokovo/devices";
import { useRendererRegistries } from "../RegistryContext.js";

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
  /** Active conversation (for chat views) */
  activeConversationId?: string;
  /** Active story (for story views) */
  activeStoryId?: string;
  /** Viewport height after accounting for header/input */
  effectiveViewportHeight: number;
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
  notifications: [],
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

function resolveProfile(
  registries: DeviceRegistries,
  profileId?: string,
): DeviceProfile {
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
  frame: number,
  fps: number,
): string {
  // Fast path: compute a lightweight signature from state that affects layout
  const device = world.devices[deviceId];
  const appState = appId ? world.appState?.[appId] : undefined;

  // Hash key components that affect layout
  const parts = [
    deviceId,
    device?.foregroundAppId ?? "",
    device?.isLocked ? "1" : "0",
    device?.keyboard
      ? String(
          Math.round(
            getKeyboardSlideProgress(device.keyboard, frame, fps) * 100,
          ),
        )
      : "0",
    appId ?? "",
    // For chat apps, include conversation and message count
    (appState as { conversationId?: string } | undefined)?.conversationId ?? "",
    // Include viewMode if present
    (appState as { viewMode?: string } | undefined)?.viewMode ?? "",
  ];

  // For chat apps, include message count for layout invalidation
  const conversationId = (appState as { conversationId?: string } | undefined)?.conversationId;
  if (conversationId && appState) {
    const conversations = (appState as { conversations?: Record<string, { messages?: unknown[] }> }).conversations;
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
    const deviceId =
      focusDeviceId ||
      world.camera?.activeDeviceId ||
      Object.keys(world.devices)[0];
    const device = world.devices[deviceId];

    // Return safe fallback instead of crashing
    if (!device) {
      if (!loggedMissingDevices.current.has(deviceId)) {
        loggedMissingDevices.current.add(deviceId);
        console.error(
          `[LayoutEngine] Device "${deviceId}" not found. Returning NULL_LAYOUT.`,
        );
      }
      const fallbackProfile = resolveProfile(registries.devices);
      if (mode === "render") {
        throw new Error(
          `LayoutEngine: Device "${deviceId}" not found in render mode.`,
        );
      }
      return buildNullLayoutOutput(fallbackProfile);
    }

    const appId = device.foregroundAppId;

    // INCREMENTAL CACHE CHECK
    // If world signature hasn't changed for this frame, return cached result
    const worldSignature = computeWorldSignature(
      world,
      deviceId,
      appId,
      t,
      effectiveFps,
    );
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
      const appState = world.appState?.[
        appId
      ] as import("@tokovo/core").BaseAppState | undefined;

      if (!appState?.viewMode) {
        if (!loggedMissingViewMode.current.has(appId)) {
          loggedMissingViewMode.current.add(appId);
          console.warn(
            `[LayoutEngine] App "${appId}" missing viewMode. Falling back to ${meta.viewStrategy || "TRANSITION"} in preview.`,
          );
        }
        if (mode === "render") {
          throw new Error(
            `LayoutEngine: App "${appId}" did not provide viewMode in render mode.`,
          );
        }
        viewKind = meta.viewStrategy || "TRANSITION";
      } else {
        viewKind = appState.viewMode;
      }

      if (viewKind === "CHAT") {
        const extendedAppState = appState as typeof appState & { activeConversationId?: string };
        activeConversationId =
          appState?.conversationId || extendedAppState?.activeConversationId;

        if (!activeConversationId && mode !== "render") {
          if (!loggedMissingConversation.current.has(appId)) {
            loggedMissingConversation.current.add(appId);
            console.warn(
              `[LayoutEngine] App "${appId}" missing conversationId for CHAT view. Using first available conversation in preview.`,
            );
          }
          const conversations = (appState as { conversations?: unknown })
            ?.conversations;
          if (conversations) {
            if (Array.isArray(conversations)) {
              activeConversationId = conversations[0]?.id;
            } else {
              activeConversationId = Object.keys(
                conversations as Record<string, unknown>,
              )[0];
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
            console.warn(
              `[LayoutEngine] App "${appId}" missing activeStoryId for STORY view in preview.`,
            );
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
    const variant: "ios" | "android" = profile.platform;

    // 4. Compute keyboard height (for viewport shrink when typing)
    const keyboardConfig = getKeyboardConfig(config, variant);
    const keyboardSlideProgress = device.keyboard
      ? getKeyboardSlideProgress(device.keyboard, t, effectiveFps)
      : 0;
    const keyboardHeight = keyboardConfig.height * keyboardSlideProgress;

    // 5. Compute effective viewport height (shrinks when keyboard visible)
    const effectiveViewportHeight =
      viewKind === "CHAT"
        ? profile.dimensions.height -
        LAYOUT.CHAT_HEADER_HEIGHT -
        LAYOUT.CHAT_INPUT_HEIGHT -
        keyboardHeight
        : profile.dimensions.height;

    // 5. Build layout context and compute layout
    const layoutContext: LayoutContext = {
      world,
      t,
      activeDeviceId: deviceId,
      activeAppId: appId || "",
      viewKind,
      activeConversationId,
      activeStoryId,
      viewportWidth: profile.dimensions.width,
      viewportHeight: effectiveViewportHeight,
      safeAreaInsets: profile.safeArea,
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
      activeConversationId,
      activeStoryId,
      effectiveViewportHeight,
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
  ]);
}
