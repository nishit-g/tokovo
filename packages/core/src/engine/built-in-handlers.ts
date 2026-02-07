import type { TimelineEvent, WorldState } from "../types.js";
import type { ReducerRegistryClass } from "./registry.js";
import {
  processCameraEvent,
  processAudioEvent,
  processOSEvent,
  processCallEvent,
  processVoiceEvent,
  HandlerContext,
} from "./handlers/index.js";

export type BuiltInHandler = (
  draft: WorldState,
  event: TimelineEvent,
  index: number,
  handlerCtx: HandlerContext,
) => void;

const builtInHandlersByRegistry = new WeakMap<
  ReducerRegistryClass,
  Map<string, BuiltInHandler>
>();

function createBuiltInHandlers(
  registry: ReducerRegistryClass,
): Map<string, BuiltInHandler> {
  const handlers = new Map<string, BuiltInHandler>();

  const registerBuiltInHandler = (
    kind: string,
    handler: BuiltInHandler,
  ): void => {
    handlers.set(kind, handler);
  };

  registerBuiltInHandler("DEVICE", (draft, event, index, _ctx) => {
    if (registry.deviceReducer) {
      draft.devices = registry.deviceReducer(draft.devices, event);
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
        const notifReducer = registry.getFeatureReducer("NOTIFICATION");
        if (notifReducer) {
          notifReducer(draft, event, index, _ctx);
        }
      }

      if (devType.startsWith("KEYBOARD_")) {
        const kbReducer = registry.getFeatureReducer("KEYBOARD");
        if (kbReducer) {
          kbReducer(draft, event, index, _ctx);
        }
      }
    }
  });

  registerBuiltInHandler("CAMERA", (draft, event, _index, ctx) => {
    processCameraEvent(
      draft,
      event as Parameters<typeof processCameraEvent>[1],
      ctx,
      registry,
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
    const kbReducer = registry.getFeatureReducer("KEYBOARD");
    if (kbReducer) {
      kbReducer(draft, event, index, _ctx);
    }
  });

  registerBuiltInHandler("OVERLAY", (draft, event, index, ctx) => {
    const overlayReducer = registry.getFeatureReducer("OVERLAY");
    if (overlayReducer) {
      overlayReducer(draft, event, index, ctx);
    }
  });

  registerBuiltInHandler("OS", (draft, event, _index, ctx) => {
    processOSEvent(draft, event as Parameters<typeof processOSEvent>[1], ctx);
  });

  registerBuiltInHandler("CALL", (draft, event, _index, ctx) => {
    processCallEvent(
      draft,
      event as Parameters<typeof processCallEvent>[1],
      ctx,
    );
  });

  registerBuiltInHandler("VOICE", (draft, event, _index, _ctx) => {
    const result = processVoiceEvent(
      event as Parameters<typeof processVoiceEvent>[0],
      draft,
    );
    draft.audio = result.audio;
  });

  return handlers;
}

function getBuiltInHandlers(
  registry: ReducerRegistryClass,
): Map<string, BuiltInHandler> {
  let handlers = builtInHandlersByRegistry.get(registry);
  if (!handlers) {
    handlers = createBuiltInHandlers(registry);
    builtInHandlersByRegistry.set(registry, handlers);
  }
  return handlers;
}

export function hasBuiltInHandler(
  kind: string,
  registry: ReducerRegistryClass,
): boolean {
  return getBuiltInHandlers(registry).has(kind);
}

export function getBuiltInHandler(
  kind: string,
  registry: ReducerRegistryClass,
): BuiltInHandler | undefined {
  return getBuiltInHandlers(registry).get(kind);
}
