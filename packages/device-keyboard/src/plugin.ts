import { keyboardReducer } from "./runtime/reducer";
import type { KeyboardState } from "@tokovo/core";

const DEBUG = process.env.NODE_ENV === "development";

let registered = false;

export function registerKeyboardPlugin(): void {
  if (registered) return;
  registered = true;

  import("@tokovo/core").then(({ ReducerRegistry }) => {
    ReducerRegistry.registerFeatureReducer(
      "KEYBOARD",
      (draft, event, _index) => {
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

        device.keyboard = keyboardReducer(
          device.keyboard as KeyboardState | undefined,
          kbEvent,
          event.at,
        );
      },
    );

    if (DEBUG) {
      console.warn("[KeyboardPlugin] Registered");
    }
  });
}
