/**
 * Device V2 Lowering Handler
 *
 * Transforms DSL IR events into runtime timeline operations.
 */

import type { TrackEvent } from "@tokovo/ir";
import type { DeviceTrackEvent } from "../ir/device-event";

type TimelineOp = TrackEvent;

// =============================================================================
// LOWERING HANDLER
// =============================================================================

/**
 * Lower device DSL events to runtime events
 * Device events are 1:1 mappings (no expansion needed)
 */
export function deviceV2Lowering(
  event: DeviceTrackEvent,
  _ctx: { fps: number },
): TimelineOp[] {
  const { at, kind, deviceId, type, ...rest } = event;
  return [
    {
      at,
      kind: "DEVICE",
      deviceId,
      type,
      ...rest,
    } as unknown as TimelineOp,
  ];
}

// =============================================================================
// EVENT TYPES FOR REGISTRATION
// =============================================================================

export const DEVICE_EVENT_TYPES = [
  "LOCK",
  "UNLOCK",
  "OPEN_APP",
  "CLOSE_APP",
  "GO_HOME",
  "SET_BADGE",
  "SET_BATTERY",
  "SET_NETWORK",
  "SET_DND",
  "SET_DYNAMIC_ISLAND",
  "INCOMING_CALL",
  "CALL_ANSWERED",
  "CALL_ENDED",
  "START_BACKGROUND_APP",
  "STOP_BACKGROUND_APP",
] as const;
