import type { WorldState } from "../types";

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AnchorFraming {
  anchorPoint: { x: number; y: number };
  paddingPx?: number;
  targetFill?: number;
}

export interface AnchorSnapshot {
  anchors: Record<string, Rect>;
  deviceId: string;
  appId: string;
}

export interface ResolvedAnchor {
  rect: Rect;
  anchor: string;
  isFallback: boolean;
}

export interface AnchorProvider {
  appId: string;
  framing: Record<string, AnchorFraming>;
  getAnchors(world: unknown, layout: unknown, deviceId: string): AnchorSnapshot;
}

export type SemanticAnchorId =
  | "device"
  | "app"
  | "header"
  | "content"
  | "inputArea"
  | "lastMessage"
  | "typingIndicator"
  | "notification"
  | `message:${string}`
  | "lastTweet"
  | "compose"
  | "keyboard"
  | "headsUpNotification"
  | "dynamicIsland"
  | string;

export const DEFAULT_FRAMING: AnchorFraming = {
  anchorPoint: { x: 0.5, y: 0.5 },
  paddingPx: 20,
  targetFill: 0.6,
};

export const EMPTY_SNAPSHOT: AnchorSnapshot = {
  anchors: {},
  deviceId: "",
  appId: "",
};

export type AnchorResolverFn = (
  world: WorldState,
  deviceId: string,
  param?: string,
) => Rect | null;

export type AnchorMap = Record<string, AnchorResolverFn>;
