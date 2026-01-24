/**
 * Camera Track Builder - Full manual camera control
 *
 * Provides control over camera position, zoom, and effects.
 * Supports both instant (point) and animated (span) operations.
 */

import type { CameraTrackEvent, EasingType } from "@tokovo/ir";
import { parseTimeToFrames, parseDurationToFrames } from "../../utils/time";

// =============================================================================
// TYPES
// =============================================================================

type GetDeclarationOrder = () => number;

export interface CameraSetOptions {
  x?: number;
  y?: number;
  scale?: number;
  rotation?: number;
  originX?: number;
  originY?: number;
}

export interface CameraAnimateOptions extends CameraSetOptions {
  duration: string | number;
  easing?: EasingType;
}

export interface CameraFocusOptions {
  scale?: number;
  padding?: number;
  duration?: string | number;
  easing?: EasingType;
}

export interface CameraTrackOptions {
  scale?: number;
  lag?: number;
}

export interface CameraShakeOptions {
  intensityX: number;
  intensityY: number;
  frequency?: number;
  decay?: number;
  duration: string | number;
}

export interface CameraResetOptions {
  duration?: string | number;
  easing?: EasingType;
  spring?: string;
}

export interface CameraPunchZoomOptions {
  intensity?: number;
  direction?: "in" | "out";
  duration?: string | number;
  spring?: string;
}

export interface CameraDutchTiltOptions {
  angle: number;
  duration?: string | number;
  spring?: string;
}

export interface CameraFlashOptions {
  color?: string;
  intensity?: number;
  duration?: string | number;
}

export interface CameraWhipPanOptions {
  direction: "left" | "right" | "up" | "down";
  blur?: number;
  duration?: string | number;
}

// =============================================================================
// POINT BUILDER (at)
// =============================================================================

export class CameraPointBuilder {
  private readonly frame: number;
  private readonly fps: number;
  private readonly events: CameraTrackEvent[];
  private readonly getOrder: GetDeclarationOrder;

  constructor(
    frame: number,
    fps: number,
    events: CameraTrackEvent[],
    getOrder: GetDeclarationOrder,
  ) {
    this.frame = frame;
    this.fps = fps;
    this.events = events;
    this.getOrder = getOrder;
  }

  /**
   * Set camera state instantly.
   */
  set(options: CameraSetOptions): void {
    const event: CameraTrackEvent = {
      at: this.frame,
      kind: "CAMERA",
      type: "SET",
      payload: {
        x: options.x,
        y: options.y,
        scale: options.scale,
        rotation: options.rotation,
        originX: options.originX,
        originY: options.originY,
      },
      _declarationOrder: this.getOrder(),
    };
    this.events.push(event);
  }

  /**
   * Animate camera to new state.
   */
  animate(options: CameraAnimateOptions): void {
    const duration = parseDurationToFrames(options.duration, this.fps);

    const startEvent: CameraTrackEvent = {
      at: this.frame,
      duration,
      kind: "CAMERA",
      type: "ANIMATE_START",
      payload: {
        x: options.x,
        y: options.y,
        scale: options.scale,
        rotation: options.rotation,
        originX: options.originX,
        originY: options.originY,
        easing: options.easing ?? "linear",
      },
      _declarationOrder: this.getOrder(),
    };

    const endEvent: CameraTrackEvent = {
      at: this.frame + duration,
      kind: "CAMERA",
      type: "ANIMATE_END",
      payload: {},
      _declarationOrder: this.getOrder(),
    };

    this.events.push(startEvent, endEvent);
  }

  /**
   * Reset camera to default state.
   */
  reset(options: CameraResetOptions = {}): void {
    const duration =
      options.duration !== undefined
        ? parseDurationToFrames(options.duration, this.fps)
        : 30;

    const event: CameraTrackEvent = {
      at: this.frame,
      duration,
      kind: "CAMERA",
      type: "RESET",
      payload: {
        easing: options.easing ?? "easeOut",
        spring: options.spring,
      },
      _declarationOrder: this.getOrder(),
    };
    this.events.push(event);
  }

  /**
   * Quick zoom punch with spring bounce back.
   */
  punchZoom(options: CameraPunchZoomOptions = {}): void {
    const duration =
      options.duration !== undefined
        ? parseDurationToFrames(options.duration, this.fps)
        : 15;

    const event: CameraTrackEvent = {
      at: this.frame,
      duration,
      kind: "CAMERA",
      type: "PUNCH_ZOOM",
      payload: {
        intensity: options.intensity ?? 0.15,
        direction: options.direction ?? "in",
        spring: options.spring ?? "punch",
      },
      _declarationOrder: this.getOrder(),
    };
    this.events.push(event);
  }

  /**
   * Dutch tilt (Z-axis rotation) for tension/unease.
   */
  dutchTilt(options: CameraDutchTiltOptions): void {
    const duration =
      options.duration !== undefined
        ? parseDurationToFrames(options.duration, this.fps)
        : 30;

    const event: CameraTrackEvent = {
      at: this.frame,
      duration,
      kind: "CAMERA",
      type: "DUTCH_TILT",
      payload: {
        angle: options.angle,
        spring: options.spring ?? "dramatic",
      },
      _declarationOrder: this.getOrder(),
    };
    this.events.push(event);
  }

  /**
   * Flash overlay effect.
   */
  flash(options: CameraFlashOptions = {}): void {
    const duration =
      options.duration !== undefined
        ? parseDurationToFrames(options.duration, this.fps)
        : 6;

    const event: CameraTrackEvent = {
      at: this.frame,
      duration,
      kind: "CAMERA",
      type: "FLASH",
      payload: {
        color: options.color ?? "white",
        intensity: options.intensity ?? 1,
      },
      _declarationOrder: this.getOrder(),
    };
    this.events.push(event);
  }

  shake(options: CameraShakeOptions): void {
    const duration = parseDurationToFrames(options.duration, this.fps);

    const event: CameraTrackEvent = {
      at: this.frame,
      duration,
      kind: "CAMERA",
      type: "SHAKE",
      payload: {
        intensityX: options.intensityX,
        intensityY: options.intensityY,
        frequency: options.frequency,
        decay: options.decay,
      },
      _declarationOrder: this.getOrder(),
    };
    this.events.push(event);
  }

  focus(anchorId: string, options: CameraFocusOptions = {}): void {
    const duration =
      options.duration !== undefined
        ? parseDurationToFrames(options.duration, this.fps)
        : 30;

    const event: CameraTrackEvent = {
      at: this.frame,
      duration,
      kind: "CAMERA",
      type: "FOCUS",
      payload: {
        anchorId,
        scale: options.scale,
        padding: options.padding,
        easing: options.easing ?? "easeOut",
      },
      _declarationOrder: this.getOrder(),
    };
    this.events.push(event);
  }
}

// =============================================================================
// SPAN BUILDER (span)
// =============================================================================

export class CameraSpanBuilder {
  private readonly startFrame: number;
  private readonly endFrame: number;
  private readonly fps: number;
  private readonly events: CameraTrackEvent[];
  private readonly getOrder: GetDeclarationOrder;

  constructor(
    startFrame: number,
    endFrame: number,
    fps: number,
    events: CameraTrackEvent[],
    getOrder: GetDeclarationOrder,
  ) {
    this.startFrame = startFrame;
    this.endFrame = endFrame;
    this.fps = fps;
    this.events = events;
    this.getOrder = getOrder;
  }

  /**
   * Track an anchor continuously.
   */
  track(anchorId: string, options: CameraTrackOptions = {}): void {
    const startEvent: CameraTrackEvent = {
      at: this.startFrame,
      duration: this.endFrame - this.startFrame,
      kind: "CAMERA",
      type: "TRACK_START",
      payload: {
        anchorId,
        scale: options.scale,
        lag: options.lag,
      },
      _declarationOrder: this.getOrder(),
    };

    const endEvent: CameraTrackEvent = {
      at: this.endFrame,
      kind: "CAMERA",
      type: "TRACK_END",
      payload: {},
      _declarationOrder: this.getOrder(),
    };

    this.events.push(startEvent, endEvent);
  }
}

// =============================================================================
// CAMERA TRACK BUILDER
// =============================================================================

export class CameraTrackBuilder {
  readonly _events: CameraTrackEvent[] = [];
  private readonly fps: number;
  private readonly getOrder: GetDeclarationOrder;

  constructor(fps: number, getOrder: GetDeclarationOrder) {
    this.fps = fps;
    this.getOrder = getOrder;
  }

  /**
   * Create a point (instant) operation at a specific time.
   */
  at(time: string | number): CameraPointBuilder {
    const frame = parseTimeToFrames(time, this.fps);
    return new CameraPointBuilder(frame, this.fps, this._events, this.getOrder);
  }

  /**
   * Create a span (duration) operation between two times.
   */
  span(start: string | number, end: string | number): CameraSpanBuilder {
    const startFrame = parseTimeToFrames(start, this.fps);
    const endFrame = parseTimeToFrames(end, this.fps);
    return new CameraSpanBuilder(
      startFrame,
      endFrame,
      this.fps,
      this._events,
      this.getOrder,
    );
  }
}
