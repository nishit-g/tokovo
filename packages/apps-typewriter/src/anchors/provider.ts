import type { AnchorProvider, AnchorSnapshot, Rect, WorldState } from "@tokovo/core";
import { DEFAULT_FRAMING } from "@tokovo/core";
import { TYPEWRITER_APP_ID } from "../constants.js";
import { computeTypewriterGeometry } from "./geometry.js";
import type { TypewriterState } from "../runtime/state.js";
import { resolveTypewriterTheme } from "../theme/resolve.js";

function rectAtCursor(input: {
  textArea: Rect;
  state: TypewriterState | undefined;
  charWidthPx: number;
  lineHeightPx: number;
}): Rect {
  const { textArea, state, charWidthPx, lineHeightPx } = input;
  const row = state?.cursor?.row ?? 0;
  const col = state?.cursor?.col ?? 0;
  const scrollLines = state?.scrollLines ?? 0;
  const visibleRow = Math.max(0, row - scrollLines);

  return {
    x: textArea.x + charWidthPx * col,
    y: textArea.y + lineHeightPx * visibleRow,
    width: Math.max(2, charWidthPx * 0.9),
    height: Math.max(2, lineHeightPx * 0.9),
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

    const state = world.appState?.[TYPEWRITER_APP_ID] as TypewriterState | undefined;
    const theme = resolveTypewriterTheme({ config: state?.theme, video: dims });
    const geom = computeTypewriterGeometry(dims, theme);

    const anchors: Record<string, Rect> = {
      desk: geom.desk,
      paper: geom.paper,
      textArea: geom.textArea,
      typewriter: geom.typewriter,
      cursor: rectAtCursor({
        textArea: geom.textArea,
        state,
        charWidthPx: theme.text.charWidthPx,
        lineHeightPx: theme.text.lineHeightPx,
      }),
    };

    return {
      anchors,
      deviceId,
      appId: TYPEWRITER_APP_ID,
    };
  },
};
