import type { TimelineEvent, WorldState } from "../types";
import { ReducerRegistry } from "./registry";
import {
  processCameraEvent,
  processAudioEvent,
  processOSEvent,
  processCallEvent,
  HandlerContext,
} from "./handlers";

export type BuiltInHandler = (
  draft: WorldState,
  event: TimelineEvent,
  index: number,
  handlerCtx: HandlerContext,
) => void;

const builtInHandlers = new Map<string, BuiltInHandler>();

function registerBuiltInHandler(kind: string, handler: BuiltInHandler): void {
  builtInHandlers.set(kind, handler);
}

export function hasBuiltInHandler(kind: string): boolean {
  return builtInHandlers.has(kind);
}

export function getBuiltInHandler(kind: string): BuiltInHandler | undefined {
  return builtInHandlers.get(kind);
}

registerBuiltInHandler("DEVICE", (draft, event, index, _ctx) => {
  if (ReducerRegistry.deviceReducer) {
    draft.devices = ReducerRegistry.deviceReducer(draft.devices, event);
  }
  const devEvent = event as TimelineEvent & { type?: string };
  const devType = devEvent.type;
  if (devType) {
    if (
      devType.includes("NOTIFICATION") ||
      devType.startsWith("SHOW_") ||
      devType.startsWith("DISMISS_") ||
      devType.startsWith("TAP_") ||
      devType.startsWith("SWIPE_") ||
      devType.startsWith("CLEAR_ALL") ||
      devType.includes("DYNAMIC_ISLAND")
    ) {
      const notifReducer = ReducerRegistry.getFeatureReducer(devType);
      if (notifReducer) {
        notifReducer(draft, event, index);
      }
    }

    if (devType.startsWith("KEYBOARD_")) {
      const kbReducer = ReducerRegistry.getFeatureReducer("KEYBOARD");
      if (kbReducer) {
        kbReducer(draft, event, index);
      }
    }
  }
});

registerBuiltInHandler("CAMERA", (draft, event, _index, ctx) => {
  processCameraEvent(
    draft,
    event as Parameters<typeof processCameraEvent>[1],
    ctx,
  );
});

registerBuiltInHandler("AUDIO", (draft, event, _index, ctx) => {
  processAudioEvent(
    draft,
    event as Parameters<typeof processAudioEvent>[1],
    ctx,
  );
});

registerBuiltInHandler("KEYBOARD", (draft, event, index, _ctx) => {
  const kbReducer = ReducerRegistry.getFeatureReducer("KEYBOARD");
  if (kbReducer) {
    kbReducer(draft, event, index);
  }
});

registerBuiltInHandler("OS", (draft, event, _index, ctx) => {
  processOSEvent(draft, event as Parameters<typeof processOSEvent>[1], ctx);
});

registerBuiltInHandler("CALL", (draft, event, _index, ctx) => {
  processCallEvent(draft, event as Parameters<typeof processCallEvent>[1], ctx);
});
