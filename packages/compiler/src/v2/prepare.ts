/**
 * Prepare Track Episode - Converts TrackEpisodeIR to engine-ready format
 *
 * @description The glue between v2 DSL and the runtime engine.
 * Takes TrackEpisodeIR from episode().build() and produces
 * a CompiledEpisode ready for runEpisode().
 *
 * @see docs-v2/DSL_REVAMP.md
 */

import type { TrackEpisodeIR } from "@tokovo/ir";
import { safeValidateTrackEpisodeIR } from "@tokovo/ir";
import type {
  RuntimeEvent,
  WorldState,
  TokovoPlugin,
  DeviceState,
  TokovoConfigType,
} from "@tokovo/core";
import { DEFAULT_CAMERA_STATE, DEFAULT_AUDIO_STATE } from "@tokovo/core";
import {
  compareEvents,
  createEventIndex,
  createKeyframedEventIndex,
  computeEventSignature,
  TokovoConfig,
} from "@tokovo/core";
import { lowerEpisode } from "./lowering";

// =============================================================================
// TYPES
// =============================================================================

export interface PreparedTrackEpisode {
  id: string;
  fps: number;
  durationInFrames: number;
  events: RuntimeEvent[];
  eventIndex?: ReturnType<typeof createEventIndex>;
  keyframedEventIndex?: ReturnType<typeof createKeyframedEventIndex>;
  keyframeInterval?: number;
  eventSignature?: string;
  initialWorld: WorldState;
  plugins: TokovoPlugin[];
  metadata: {
    title?: string;
    description?: string;
    markers: Array<{ id: string; frame: number }>;
    sections: Array<{ id: string; start: number; end: number }>;
  };
}

// =============================================================================
// PREPARE FUNCTION
// =============================================================================

/**
 * Prepare a v2 TrackEpisodeIR for the runtime engine.
 *
 * @param ir - TrackEpisodeIR from episode().build()
 * @param plugins - Array of plugins to use
 * @returns PreparedTrackEpisode ready for runEpisode()
 */
export function prepareTrackEpisode(
  ir: TrackEpisodeIR,
  plugins: TokovoPlugin[],
  options: {
    config?: TokovoConfigType;
    validate?: boolean;
    log?: boolean;
  } = {},
): PreparedTrackEpisode {
  const config = options.config ?? TokovoConfig;
  const shouldValidate = options.validate ?? true;
  const shouldLog = options.log ?? true;
  if (shouldValidate) {
    const validation = safeValidateTrackEpisodeIR(ir);
    if (!validation.success) {
      console.error(
        "[prepareTrackEpisode] IR validation failed:",
        validation.error.format(),
      );
      throw new Error(`Invalid TrackEpisodeIR: ${validation.error.message}`);
    }
  }

  const runtimeEvents = lowerEpisode(ir, plugins) as RuntimeEvent[];
  const sortedEvents = runtimeEvents
    .map((event, index) => ({ event, index }))
    .sort((a, b) => compareEvents(a.event, b.event, a.index, b.index))
    .map((entry) => entry.event);

  // Build initial world state from device configs
  const initialWorld = buildInitialWorld(ir);

  // Build metadata
  const metadata = {
    title: ir.title,
    description: ir.description,
    markers: ir.markers.map((m) => ({ id: m.id, frame: m.frame })),
    sections: ir.sections.map((s) => ({
      id: s.id,
      start: s.startFrame,
      end: s.endFrame,
    })),
  };

  if (shouldLog) {
    console.log("[prepareTrackEpisode] Prepared episode:", {
      id: ir.id,
      trackEvents: ir.events.length,
      runtimeEvents: runtimeEvents.length,
      devices: ir.devices.length,
      conversations: ir.devices.flatMap((d) => d.conversations || []).length,
    });
  }

  const eventSignature = computeEventSignature(sortedEvents);
  const keyframeInterval = config.rendering.cacheKeyframeInterval;

  return {
    id: ir.id,
    fps: ir.fps,
    durationInFrames: ir.durationInFrames,
    events: sortedEvents,
    eventIndex: createEventIndex(sortedEvents),
    keyframedEventIndex: createKeyframedEventIndex(
      sortedEvents,
      keyframeInterval,
    ),
    keyframeInterval,
    eventSignature,
    initialWorld,
    plugins,
    metadata,
  };
}

// =============================================================================
// WORLD BUILDER
// =============================================================================

/**
 * Build initial WorldState from TrackEpisodeIR device configs.
 */
function buildInitialWorld(ir: TrackEpisodeIR): WorldState {
  const devices: Record<string, DeviceState> = {};
  for (const device of ir.devices) {
    devices[device.id] = {
      id: device.id,
      profileId: device.profile,
      foregroundAppId: device.app,
      isLocked: false,
      platform: device.profile.includes("pixel") ? "android" : "ios",
      appTheme: device.theme,
      notifications: [],
      keyboard: {
        visible: false,
        showFrame: null,
        hideFrame: null,
        inputText: "",
        cursorPosition: 0,
        activeKeyPresses: [],
        keyboardType: "default",
        returnKeyType: "return",
        suggestions: [],
        activeSuggestionIndex: null,
      },
    } as DeviceState;
  }

  const firstDeviceId = ir.devices[0]?.id || "main_phone";
  const camera = { ...DEFAULT_CAMERA_STATE, activeDeviceId: firstDeviceId };
  const audio = { ...DEFAULT_AUDIO_STATE };

  const appState: Record<string, unknown> = {};
  for (const device of ir.devices) {
    if (device.app) {
      const hasConversations =
        device.conversations && device.conversations.length > 0;
      const firstConversation = device.conversations?.[0];

      // Build conversations for this app
      const conversations: Record<string, unknown> = {};
      for (const conv of device.conversations || []) {
        conversations[conv.id] = {
          id: conv.id,
          name: conv.name,
          avatar: conv.avatar || "",
          type: conv.type || "dm",
          participants: conv.participants || [],
          messages: conv.initialMessages || [],
          typing: null,
          unreadCount: conv.unreadCount ?? 0,
          isMuted: conv.isMuted ?? false,
          isPinned: conv.isPinned ?? false,
          hasStatus: conv.hasStatus ?? false,
        };
      }

      appState[device.app] = {
        viewMode: hasConversations ? "CHAT" : "FEED",
        conversationId: firstConversation?.id,
        conversations,
      };
    }
  }

  const worldState: WorldState = {
    devices,
    appState,
    camera,
    audio,
  };

  return worldState;
}
