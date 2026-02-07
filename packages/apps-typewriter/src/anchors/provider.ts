import type { AnchorProvider, AnchorSnapshot, Rect, WorldState } from "@tokovo/core";
import { DEFAULT_FRAMING } from "@tokovo/core";
import { TYPEWRITER_APP_ID } from "../constants.js";
import { computeTypewriterGeometry } from "./geometry.js";
import type { TypewriterState } from "../runtime/state.js";

function rectAtCursor(input: {
  textArea: Rect;
  state: TypewriterState | undefined;
}): Rect {
  const { textArea, state } = input;
  const row = state?.cursor?.row ?? 0;
  const col = state?.cursor?.col ?? 0;

  // Approximate monospace metrics (deterministic). UI should match close enough.
  const cols = 44;
  const rows = 26;
  const cw = textArea.width / cols;
  const lh = textArea.height / rows;

  return {
    x: textArea.x + cw * col,
    y: textArea.y + lh * row,
    width: Math.max(2, cw * 0.9),
    height: Math.max(2, lh * 0.9),
  };
}

export const TypewriterAnchorProvider: AnchorProvider = {
  appId: TYPEWRITER_APP_ID,
  framing: {
    desk: { ...DEFAULT_FRAMING, paddingPx: 30, targetFill: 0.9 },
    paper: { ...DEFAULT_FRAMING, paddingPx: 40, targetFill: 0.85 },
    textArea: { ...DEFAULT_FRAMING, paddingPx: 30, targetFill: 0.8 },
    cursor: { ...DEFAULT_FRAMING, paddingPx: 80, targetFill: 0.35 },
    typewriter: { ...DEFAULT_FRAMING, paddingPx: 50, targetFill: 0.75 },
  },
  getAnchors: (
    world: WorldState,
    _layout: unknown,
    deviceId: string,
    context,
  ): AnchorSnapshot => {
    const device = world.devices?.[deviceId];
    const dims = context?.getDeviceProfile?.(device?.profileId)?.dimensions ?? {
      width: 1080,
      height: 1920,
    };

    const geom = computeTypewriterGeometry(dims);
    const state = world.appState?.[TYPEWRITER_APP_ID] as TypewriterState | undefined;

    const anchors: Record<string, Rect> = {
      desk: geom.desk,
      paper: geom.paper,
      textArea: geom.textArea,
      typewriter: geom.typewriter,
      cursor: rectAtCursor({ textArea: geom.textArea, state }),
    };

    return {
      anchors,
      deviceId,
      appId: TYPEWRITER_APP_ID,
    };
  },
};

