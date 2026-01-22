/**
 * Handler Types - Contracts for event handlers
 *
 * @description Defines the interface all handlers must implement.
 */

import type { WorldState, TimelineEvent } from "../../types";

// =============================================================================
// HANDLER CONTEXT
// =============================================================================

/**
 * Context passed to each handler during event processing.
 */
export interface HandlerContext {
  /** Current frame being processed */
  frame: number;
  /** Index of this event in the sorted events array */
  eventIndex: number;
  /** Mode affects error handling (preview = continue, render = throw) */
  mode: "preview" | "render";
}

// =============================================================================
// HANDLER INTERFACE
// =============================================================================

/**
 * EventHandler - Contract for all event handlers.
 *
 * Each handler processes events of a specific kind.
 */
export interface EventHandler<K extends string = string> {
  /** The event kind this handler processes (e.g., "CAMERA", "AUDIO") */
  kind: K;

  /**
   * Process an event and mutate the draft world state.
   *
   * @param draft - Immer draft of WorldState (mutable)
   * @param event - The event to process
   * @param ctx - Processing context
   */
  handle(draft: WorldState, event: TimelineEvent, ctx: HandlerContext): void;
}

// =============================================================================
// TYPE ALIASES
// =============================================================================

/** Camera event with typed kind */
export type CameraEvent = TimelineEvent & { kind: "CAMERA" };

/** Audio event with typed kind */
export type AudioEvent = TimelineEvent & { kind: "AUDIO" };

/** OS event with typed kind */
export type OSEvent = TimelineEvent & { kind: "OS" };

/** Device event with typed kind */
export type DeviceEvent = TimelineEvent & { kind: "DEVICE" };

/** Call event with typed kind */
export type CallEvent = TimelineEvent & { kind: "CALL" };

/** Keyboard event with typed kind */
export type KeyboardEvent = TimelineEvent & { kind: "KEYBOARD" };
