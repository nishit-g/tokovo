import { keyboardReducer } from "./runtime/reducer";
import type { KeyboardState } from "@tokovo/core";
import { ReducerRegistry } from "@tokovo/core";

const DEBUG = process.env.NODE_ENV === "development";

let registered = false;

export function registerKeyboardPlugin(): void {
  if (registered) return;
  registered = true;

  ReducerRegistry.registerFeatureReducer(
    "KEYBOARD",
    (draft, event, _index, ctx) => {
      const deviceId = (event as { deviceId?: string }).deviceId;
      if (!deviceId) return;

      const device = draft.devices[deviceId];
      if (!device) return;

      const kbEvent = {
        kind: "DEVICE" as const,
        type: (event as { type?: string }).type || "",
        deviceId,
        at: event.at,
        payload: (event as { payload?: Record<string, unknown> }).payload,
      };

      const currentFrame = ctx?.frame ?? event.at;

      device.keyboard = keyboardReducer(
        device.keyboard as KeyboardState | undefined,
        kbEvent,
        currentFrame,
      );
    },
  );

  if (DEBUG) {
    console.warn("[KeyboardPlugin] Registered");
  }
}
