/**
 * WhatsApp Director - Semantic Camera Decisions
 *
 * The Director layer translates app-level events into camera choices.
 * It decides WHICH camera primitive to use, never HOW to compute transforms.
 *
 * DESIGN PRINCIPLE:
 * - Director chooses primitives (follow, push-in, snap)
 * - Camera controller handles math
 * - Layout provides geometry
 *
 * These three concerns NEVER mix.
 */

import {
  CameraPreset,
  getPreset,
  CameraTimeline,
  composeTimeline,
  TimelineStep,
  CameraTarget,
} from "@tokovo/device-camera";
import type { ChatLayoutState, ChatMessageLayout } from "@tokovo/core";
import { WhatsAppMessage } from "../types";

// =============================================================================
// DIRECTOR TYPES
// =============================================================================

/**
 * Camera primitive recommendation from director
 */
export interface CameraPrimitiveRecommendation {
  type: "FOLLOW" | "PUSH_IN" | "PULL_OUT" | "SNAP" | "HOLD" | "SHAKE";

  /** Target for camera focus */
  target?: CameraTarget;

  /** Intensity/scale for the effect */
  intensity?: number;

  /** Duration in frames */
  duration?: number;

  /** Priority (higher = more important, wins arbitration) */
  priority: number;

  /** Source signal that triggered this recommendation */
  trigger: string;
}

/**
 * Director context for making decisions
 */
export interface DirectorContext {
  /** Current frame */
  t: number;

  /** Chat layout state */
  layout: ChatLayoutState;

  /** Active preset */
  preset: CameraPreset;

  /** Device viewport dimensions */
  viewport: { width: number; height: number };

  /** Who owns this device (their messages appear on right) */
  ownerName: string;
}

// =============================================================================
// WHATSAPP DIRECTOR
// =============================================================================

/**
 * WhatsApp Director
 *
 * Translates WhatsApp-specific events into camera primitive recommendations.
 * Uses preset values to scale intensity/timing.
 */
export class WhatsAppDirector {
  private preset: CameraPreset;
  private lastCameraMoveFrame: number = -Infinity;

  constructor(presetName: string = "calm-chat") {
    this.preset = getPreset(presetName);
  }

  /**
   * Change the active preset
   */
  setPreset(presetName: string): void {
    this.preset = getPreset(presetName);
  }

  /**
   * Get current preset
   */
  getPreset(): CameraPreset {
    return this.preset;
  }

  // =========================================================================
  // EVENT HANDLERS
  // =========================================================================

  /**
   * Called when a new message arrives
   *
   * Decision logic:
   * - If from me: subtle follow (I know what I wrote)
   * - If from them: push-in to emphasize received message
   * - If rapid exchange: fast follow with less zoom
   */
  onNewMessage(
    msg: WhatsAppMessage,
    context: DirectorContext,
  ): CameraPrimitiveRecommendation | null {
    // Check cooldown
    if (!this.checkCooldown(context.t)) {
      return null;
    }

    const msgLayout = context.layout.messageLayouts[msg.id];
    if (!msgLayout?.rect) return null;

    const isFromMe = msg.from === context.ownerName;
    const target = this.rectToTarget(msgLayout.rect, context.viewport);

    if (isFromMe) {
      // Subtle follow for my messages
      return {
        type: "FOLLOW",
        target,
        intensity: this.preset.pushInIntensity * 0.5, // Less intense for own messages
        duration: Math.round(30 / this.preset.panSpeed),
        priority: 50,
        trigger: "new-message-sent",
      };
    } else {
      // Push-in for received messages
      return {
        type: "PUSH_IN",
        target,
        intensity: this.preset.pushInIntensity,
        duration: Math.round(40 / this.preset.panSpeed),
        priority: 70,
        trigger: "new-message-received",
      };
    }
  }

  /**
   * Called when typing indicator starts
   *
   * Decision logic:
   * - Subtle push toward input area
   * - Creates anticipation
   */
  onTypingStart(
    from: string,
    context: DirectorContext,
  ): CameraPrimitiveRecommendation | null {
    if (!this.checkCooldown(context.t)) return null;
    if (!context.layout.typingLayout?.rect) return null;

    const isMe = from === context.ownerName;
    if (isMe) return null; // Don't react to own typing

    const target = this.rectToTarget(
      context.layout.typingLayout.rect,
      context.viewport,
    );

    return {
      type: "PUSH_IN",
      target,
      intensity: this.preset.pushInIntensity * 0.3, // Very subtle
      duration: 45,
      priority: 30,
      trigger: "typing-start",
    };
  }

  /**
   * Called when typing indicator ends
   *
   * Decision logic:
   * - Slight pullback if no message follows
   * - Reset anticipation
   */
  onTypingEnd(
    _from: string,
    context: DirectorContext,
  ): CameraPrimitiveRecommendation | null {
    // Light pullback
    return {
      type: "PULL_OUT",
      intensity: 0.02,
      duration: 30,
      priority: 10,
      trigger: "typing-end",
    };
  }

  /**
   * Called when a reaction is added
   *
   * Decision logic:
   * - Quick snap to the reacted message
   * - Optional shake for emphasis
   */
  onReaction(
    messageId: string,
    _emoji: string,
    context: DirectorContext,
  ): CameraPrimitiveRecommendation | null {
    if (!this.checkCooldown(context.t)) return null;

    const msgLayout = context.layout.messageLayouts[messageId];
    if (!msgLayout?.rect) return null;

    const target = this.rectToTarget(msgLayout.rect, context.viewport);

    // If shake is enabled in preset, return shake
    if (this.preset.shakeIntensity > 0) {
      return {
        type: "SHAKE",
        target,
        intensity: this.preset.shakeIntensity * 0.5,
        duration: 15,
        priority: 80,
        trigger: "reaction-added",
      };
    }

    // Otherwise, quick snap
    return {
      type: "SNAP",
      target,
      intensity: this.preset.pushInIntensity,
      duration: 10,
      priority: 80,
      trigger: "reaction-added",
    };
  }

  /**
   * Called when a message is read
   *
   * Decision logic:
   * - Light pullback for context
   * - Only if we're zoomed in
   */
  onMessageRead(
    _messageId: string,
    _context: DirectorContext,
  ): CameraPrimitiveRecommendation | null {
    return {
      type: "PULL_OUT",
      intensity: 0.01,
      duration: 20,
      priority: 5,
      trigger: "message-read",
    };
  }

  /**
   * Called when message is deleted
   *
   * Decision logic:
   * - Shake for drama
   */
  onMessageDeleted(
    context: DirectorContext,
  ): CameraPrimitiveRecommendation | null {
    if (this.preset.shakeIntensity === 0) return null;

    return {
      type: "SHAKE",
      intensity: this.preset.shakeIntensity,
      duration: 20,
      priority: 60,
      trigger: "message-deleted",
    };
  }

  // =========================================================================
  // HELPERS
  // =========================================================================

  /**
   * Check if enough time has passed since last camera move
   */
  private checkCooldown(t: number): boolean {
    if (t - this.lastCameraMoveFrame < this.preset.cooldownFrames) {
      return false;
    }
    this.lastCameraMoveFrame = t;
    return true;
  }

  /**
   * Convert a layout rect to a normalized camera target
   */
  private rectToTarget(
    rect: { x: number; y: number; width: number; height: number },
    viewport: { width: number; height: number },
  ): CameraTarget {
    return {
      rect,
      point: {
        x: (rect.x + rect.width / 2) / viewport.width,
        y: (rect.y + rect.height / 2) / viewport.height,
      },
    };
  }

  /**
   * Build a timeline from a recommendation
   */
  recommendationToTimeline(rec: CameraPrimitiveRecommendation): CameraTimeline {
    const step: TimelineStep = {
      primitive:
        rec.type === "SHAKE" ? "HOLD" : (rec.type as TimelineStep["primitive"]),
      duration: rec.duration ?? 30,
      target: rec.target,
      scale:
        rec.type === "PUSH_IN"
          ? 1 + (rec.intensity ?? 0.05)
          : rec.type === "PULL_OUT"
            ? 1 - (rec.intensity ?? 0.02)
            : undefined,
      easing: this.preset.easing as TimelineStep["easing"],
    };

    return composeTimeline(`director-${rec.trigger}`, [step]);
  }
}

// =============================================================================
// FACTORY
// =============================================================================

/**
 * Create a WhatsApp director with a specific preset
 */
export function createWhatsAppDirector(
  presetName: string = "calm-chat",
): WhatsAppDirector {
  return new WhatsAppDirector(presetName);
}
