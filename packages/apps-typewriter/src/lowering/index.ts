import type { TrackEvent } from "@tokovo/ir";
import type { RuntimeEvent } from "@tokovo/core";
import { TYPEWRITER_APP_ID } from "../constants.js";
import type { TypewriterTrackEvent } from "../types/index.js";

export interface TypewriterLoweringHandler {
  lower: (event: TrackEvent, ctx: { fps: number }) => RuntimeEvent[];
}

function isTypewriterTrackEvent(event: TrackEvent): event is TypewriterTrackEvent {
  return (
    (event as { kind?: string }).kind === "APP" &&
    (event as { appId?: string }).appId === TYPEWRITER_APP_ID
  );
}

function createRuntimeEvent(
  at: number,
  deviceId: string | undefined,
  type: string,
  payload: unknown,
): RuntimeEvent {
  return {
    at,
    kind: "APP",
    appId: TYPEWRITER_APP_ID,
    type,
    payload,
    deviceId,
  } as unknown as RuntimeEvent;
}

function expandTypeText(input: {
  event: TypewriterTrackEvent;
  fps: number;
}): RuntimeEvent[] {
  const { event, fps } = input;
  const deviceId = (event as { deviceId?: string }).deviceId;
  const payload = (event.payload ?? {}) as { text?: string; cps?: number; fit?: string };
  const text = typeof payload.text === "string" ? payload.text : "";

  const durationFrames = typeof event.duration === "number" ? Math.max(0, event.duration) : undefined;
  const glyphCount = Math.max(1, text.length);

  const stepFrames = (() => {
    if (durationFrames !== undefined) {
      return Math.max(1, Math.floor(durationFrames / glyphCount));
    }
    const cps = typeof payload.cps === "number" && payload.cps > 0 ? payload.cps : 12;
    return Math.max(1, Math.round(fps / cps));
  })();

  const out: RuntimeEvent[] = [];
  let t = event.at;
  for (const ch of text) {
    if (ch === "\n") {
      out.push(createRuntimeEvent(t, deviceId, "TYPEWRITER_NEWLINE", {}));
    } else {
      out.push(createRuntimeEvent(t, deviceId, "TYPEWRITER_KEY", { ch }));
    }
    t += stepFrames;
  }
  return out;
}

export const typewriterLowering: TypewriterLoweringHandler = {
  lower: (event: TrackEvent, ctx: { fps: number }): RuntimeEvent[] => {
    if (!isTypewriterTrackEvent(event)) return [];
    const deviceId = (event as { deviceId?: string }).deviceId;

    switch (event.type) {
      case "TYPEWRITER_TYPE_TEXT":
        return expandTypeText({ event, fps: ctx.fps });
      case "TYPEWRITER_INIT_LETTER":
      case "TYPEWRITER_KEY":
      case "TYPEWRITER_NEWLINE":
      case "TYPEWRITER_BACKSPACE":
      case "TYPEWRITER_SET_CURSOR":
      case "TYPEWRITER_SCROLL":
        return [createRuntimeEvent(event.at, deviceId, event.type, event.payload ?? {})];
      default:
        return [];
    }
  },
};

