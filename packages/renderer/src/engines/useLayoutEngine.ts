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

import { useMemo } from "react";
import {
  WorldState,
  DeviceState,
  LAYOUT,
  LayoutState,
  ViewKind,
  LayoutContext,
  getKeyboardConfig,
} from "@tokovo/core";
import { computeLayout } from "../layout";
import type { DeviceProfile, DeviceRegistries } from "@tokovo/devices";
import { useRendererRegistries } from "../RegistryContext";

// =============================================================================
// INPUT / OUTPUT TYPES
// =============================================================================

export interface LayoutEngineInput {
  world: WorldState;
  t: number;
  focusDeviceId?: string;
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
// LAYOUT ENGINE HOOK
// =============================================================================

export function useLayoutEngine(input: LayoutEngineInput): LayoutEngineOutput {
  const { world, t, focusDeviceId } = input;
  const registries = useRendererRegistries();

  return useMemo(() => {
    // 1. Determine active device
    const deviceId =
      focusDeviceId ||
      world.camera?.activeDeviceId ||
      Object.keys(world.devices)[0];
    const device = world.devices[deviceId];

    // Return safe fallback instead of crashing
    if (!device) {
      console.error(
        `[LayoutEngine] Device "${deviceId}" not found. Returning NULL_LAYOUT.`,
      );
      const fallbackProfile = resolveProfile(registries.devices);
      return buildNullLayoutOutput(fallbackProfile);
    }

    const appId = device.foregroundAppId;

    // 2. Determine ViewKind
    let viewKind: ViewKind = "TRANSITION";
    let activeConversationId: string | undefined;
    let activeStoryId: string | undefined;

    if (device.isLocked) {
      viewKind = "LOCKSCREEN";
    } else if (appId) {
      const meta = registries.plugins.metadata.get(appId);
      viewKind = meta.viewStrategy || "TRANSITION";

      // 2. Check Dynamic App State for overrides via STANDARD CONTRACT
      // Apps MUST implement `BaseAppState` to dynamically switch layouts.
      // Heuristics have been removed for architectural purity.
      const appState = world.appState?.[
        appId
      ] as import("@tokovo/core").BaseAppState;

      if (appState && appState.viewMode) {
        viewKind = appState.viewMode;

        // Extract Standard Context
        if (viewKind === "CHAT") {
          // Prefer explicit conversationId, fallback to first one (Legacy behavior preserved for now)
          activeConversationId =
            appState.conversationId ||
            (() => {
              const conversations = (appState as { conversations?: unknown })
                .conversations;
              if (!conversations) return undefined;
              if (Array.isArray(conversations)) {
                return conversations[0]?.id;
              }
              return Object.keys(conversations as Record<string, unknown>)[0];
            })();
        } else if (viewKind === "STORY") {
          activeStoryId = appState.activeStoryId;
        }
      }

      // 3. Twitter Special Case (Implicit Feed if not set)
      // TODO: Move this to Twitter App Reducer in next sprint
      if (appId === "app_twitter" && !viewKind) viewKind = "FEED";
    } else {
      // No app open, show home screen
      viewKind = "HOMESCREEN";
    }

    // 3. Get device profile
    const profile = resolveProfile(registries.devices, device.profileId);
    const variant: "ios" | "android" = profile.platform;

    // 4. Compute keyboard height (for viewport shrink when typing)
    const keyboardConfig = getKeyboardConfig(variant);
    const keyboardHeight = device.keyboard?.visible
      ? keyboardConfig.height
      : 0;

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
    };

    const layout = computeLayout(layoutContext, registries.plugins.layouts);

    return {
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
  }, [world, t, focusDeviceId, registries]);
}
