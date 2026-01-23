/**
 * Camera Event Factories
 *
 * Low-level event creators for camera movements.
 */

import type {
  CameraAnchorFocusEvent,
  CameraAnchorTrackEvent,
  CameraHoldEvent,
  CameraPanEvent,
  CameraResetEvent,
  CameraRuntimeEvent,
  CameraShakeEvent,
  CameraZoomEvent,
} from "@tokovo/core";

export interface ZoomOptions {
  originX?: number;
  originY?: number;
  easing?: string;
}

export interface PanOptions {
  easing?: string;
}

export interface ShakeOptions {
  frequency?: number;
  decay?: number;
}

/**
 * Camera event factories
 */
export const camera = {
  focus: (
    at: number,
    options: { target: string; zoom?: number; duration?: number },
  ): CameraAnchorFocusEvent => ({
    at,
    kind: "CAMERA",
    type: "ANCHOR_FOCUS",
    anchor: options.target,
    preset: "message",
    shake: 0,
    duration: options.duration ?? 30,
    easing: "ease-out",
  }),

  track: (
    at: number,
    options: { target: string; zoom?: number; duration?: number },
  ): CameraAnchorTrackEvent => ({
    at,
    kind: "CAMERA",
    type: "ANCHOR_TRACK",
    anchor: options.target,
    preset: "operatorFollow",
    duration: options.duration ?? 35,
    smoothing: 0.18,
    easing: "ease-out",
    zoom: options.zoom,
  }),

  zoom: (
    at: number,
    scale: number,
    duration: number,
    opts: ZoomOptions = {},
  ): CameraZoomEvent => ({
    at,
    kind: "CAMERA",
    type: "ZOOM",
    scale,
    duration,
    originX: opts.originX ?? 0.5,
    originY: opts.originY ?? 0.5,
    easing: opts.easing ?? "ease-out",
  }),

  pan: (
    at: number,
    translateX: number,
    translateY: number,
    duration: number,
    opts: PanOptions = {},
  ): CameraPanEvent => ({
    at,
    kind: "CAMERA",
    type: "PAN",
    translateX,
    translateY,
    duration,
    easing: opts.easing ?? "ease-out",
  }),

  shake: (
    at: number,
    intensity: number,
    duration: number,
    opts: ShakeOptions = {},
  ): CameraShakeEvent => ({
    at,
    kind: "CAMERA",
    type: "SHAKE",
    intensity,
    duration,
    frequency: opts.frequency ?? 18,
    decay: opts.decay ?? 0.5,
  }),

  reset: (
    at: number,
    duration: number,
    easing = "ease-out",
  ): CameraResetEvent => ({
    at,
    kind: "CAMERA",
    type: "RESET",
    duration,
    easing,
  }),

  // =========================================================================
  // SEMANTIC ANCHOR CAMERA
  // =========================================================================

  anchorFocus: (
    at: number,
    anchor: string,
    preset = "message",
    shake = 0,
  ): CameraAnchorFocusEvent => ({
    at,
    kind: "CAMERA",
    type: "ANCHOR_FOCUS",
    anchor,
    preset,
    shake,
    duration: getPresetDuration(preset),
    easing: "ease-out",
  }),

  anchorTrack: (
    at: number,
    anchor: string,
    duration = 35,
    smoothing = 0.18,
    preset?: string,
  ): CameraAnchorTrackEvent => ({
    at,
    kind: "CAMERA",
    type: "ANCHOR_TRACK",
    anchor,
    duration,
    smoothing,
    preset: preset ?? "operatorFollow",
    easing: "ease-out",
  }),

  hold: (at: number, duration = 18): CameraHoldEvent => ({
    at,
    kind: "CAMERA",
    type: "HOLD",
    duration,
  }),

  punchGlide: (at: number, anchor: string): CameraRuntimeEvent[] => {
    return [
      {
        at,
        kind: "CAMERA",
        type: "ANCHOR_FOCUS",
        anchor,
        preset: "impactPunch",
        shake: 3,
        duration: 10,
        easing: "ease-out",
      },
      {
        at: at + 10,
        kind: "CAMERA",
        type: "ANCHOR_TRACK",
        anchor,
        duration: 35,
        smoothing: 0.18,
        preset: "operatorFollow",
        easing: "ease-out",
      },
    ];
  },
};

function getPresetDuration(preset: string): number {
  switch (preset) {
    case "message":
      return 22;
    case "subtle":
      return 30;
    case "impact":
      return 14;
    case "snap":
      return 8;
    case "operatorFollow":
      return 40;
    case "punchGlide":
      return 40;
    case "interrupt":
      return 10;
    case "takeover":
      return 20;
    case "reset":
      return 20;
    case "establish":
      return 30;
    case "suspenseHold":
      return 50;
    case "voyeur":
      return 40;
    case "isolation":
      return 35;
    case "whipSnap":
      return 6;
    case "floatFollow":
      return 60;
    case "panic":
      return 12;
    case "collapse":
      return 40;
    case "impactPunch":
      return 10;
    default:
      return 22;
  }
}
