export const OVERLAY_STATE_KEY = "sys_overlay";

export type OverlayVariant =
  | "hook"
  | "caption"
  | "receipt"
  | "reactionGif"
  | "cliffhanger";

export type OverlayPlacementPreset =
  | "top"
  | "bottom"
  | "topLeft"
  | "topRight"
  | "bottomLeft"
  | "bottomRight"
  | "center";

export interface OverlayItem {
  id: string;
  variant: OverlayVariant;
  lane: string;
  startFrame: number;
  endFrame?: number;
  text?: string;
  mediaSrc?: string;
  preset?: OverlayPlacementPreset;
  xPct?: number;
  yPct?: number;
  intensity?: number;
}

export interface OverlayState {
  items: OverlayItem[];
}

export function createInitialOverlayState(): OverlayState {
  return { items: [] };
}

export function getDefaultDurationFrames(variant: OverlayVariant): number {
  switch (variant) {
    case "hook":
      return 90; // 3s
    case "caption":
      return 120; // 4s
    case "receipt":
      return 120; // 4s
    case "reactionGif":
      return 90; // 3s
    case "cliffhanger":
      return 150; // 5s
    default:
      return 120;
  }
}

