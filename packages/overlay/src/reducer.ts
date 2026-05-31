import type { FeatureReducer, TimelineEvent, WorldState } from "@tokovo/core";
import {
  OVERLAY_STATE_KEY,
  createInitialOverlayState,
  getDefaultDurationFrames,
  type OverlayItem,
  type OverlayState,
} from "./state.js";

type OverlayEvent = TimelineEvent & {
  kind: "OVERLAY";
  type: "SHOW" | "HIDE" | "CLEAR" | (string & {});
  payload?: unknown;
};

function getOverlayState(draft: WorldState): OverlayState {
  const appState = draft.appState as Record<string, unknown>;
  if (!appState[OVERLAY_STATE_KEY]) {
    appState[OVERLAY_STATE_KEY] = createInitialOverlayState();
  }
  return appState[OVERLAY_STATE_KEY] as OverlayState;
}

function cleanupExpired(state: OverlayState, frame: number): void {
  state.items = state.items.filter((it) => it.endFrame === undefined || it.endFrame > frame);
}

function upsertShow(state: OverlayState, e: OverlayEvent): void {
  const p = (e.payload ?? {}) as {
    id?: string;
    variant?: OverlayItem["variant"];
    lane?: string;
    text?: string;
    mediaSrc?: string;
    durationFrames?: number;
    preset?: OverlayItem["preset"];
    xPct?: number;
    yPct?: number;
    intensity?: number;
  };

  const variant = (p.variant ?? "caption") as OverlayItem["variant"];
  const lane = typeof p.lane === "string" && p.lane.length > 0 ? p.lane : variant;
  const id = typeof p.id === "string" && p.id.length > 0 ? p.id : `ov_${lane}_${e.at}`;
  const duration =
    typeof p.durationFrames === "number" ? p.durationFrames : getDefaultDurationFrames(variant);
  const endFrame = duration > 0 ? e.at + duration : undefined;

  // Replacement policy: one active item per lane (production: deterministic, no accidental stacking).
  state.items = state.items.filter((it) => it.lane !== lane);

  state.items.push({
    id,
    variant,
    lane,
    startFrame: e.at,
    endFrame,
    text: p.text,
    mediaSrc: p.mediaSrc,
    preset: p.preset,
    xPct: p.xPct,
    yPct: p.yPct,
    intensity: p.intensity,
  });
}

function applyHide(state: OverlayState, e: OverlayEvent): void {
  const p = (e.payload ?? {}) as { id?: string; lane?: string; variant?: string };
  if (typeof p.id === "string" && p.id.length > 0) {
    state.items = state.items.filter((it) => it.id !== p.id);
    return;
  }

  const lane =
    typeof p.lane === "string" && p.lane.length > 0
      ? p.lane
      : typeof p.variant === "string" && p.variant.length > 0
        ? p.variant
        : undefined;

  if (lane) {
    state.items = state.items.filter((it) => it.lane !== lane);
  }
}

export const overlayFeatureReducer: FeatureReducer = (draft, event) => {
  if (event.kind !== "OVERLAY") return;
  const e = event as OverlayEvent;
  const state = getOverlayState(draft);

  cleanupExpired(state, e.at);

  switch (e.type) {
    case "SHOW":
      upsertShow(state, e);
      return;
    case "HIDE":
      applyHide(state, e);
      return;
    case "CLEAR":
      state.items = [];
      return;
    default:
      return;
  }
};
