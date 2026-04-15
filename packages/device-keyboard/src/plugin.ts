import { keyboardReducer } from "./runtime/reducer.js";
import {
  createScopedLogger,
  type KeyboardState,
  type EngineRegistries,
} from "@tokovo/core";

const DEBUG = process.env.NODE_ENV === "development";
const log = createScopedLogger("keyboard");

const registeredEngines = new WeakSet<EngineRegistries>();

export function registerKeyboardPlugin(registries: EngineRegistries): void {
  if (registeredEngines.has(registries)) return;
  registeredEngines.add(registries);

  registries.reducers.registerFeatureReducer(
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
    log.debug("Registered keyboard plugin", {
      event: "keyboard.plugin_registered",
    });
  }
}

export const keyboardRuntimeEntry = {
  id: "@tokovo/device-keyboard",
  scope: "engine" as const,
  register(input: { tokovoRegistries: { engine: EngineRegistries } }): void {
    registerKeyboardPlugin(input.tokovoRegistries.engine);
  },
};

export const tokovoRuntimeManifest = [keyboardRuntimeEntry] as const;
