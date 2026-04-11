import { createScopedLogger, type EngineRegistries } from "@tokovo/core";
import { applyNotificationEvent } from "./runtime/reducer.js";

const DEBUG = process.env.NODE_ENV === "development";
const log = createScopedLogger("notification");
const registeredEngines = new WeakSet<EngineRegistries>();

export function registerNotificationPlugin(
  registries: EngineRegistries,
): void {
  if (registeredEngines.has(registries)) return;
  registeredEngines.add(registries);

  registries.reducers.registerFeatureReducer(
    "NOTIFICATION",
    (draft, event, _index) => {
      applyNotificationEvent(draft, event);
    },
  );

  if (DEBUG) {
    log.debug("Registered notification plugin", {
      event: "notification.plugin_registered",
    });
  }
}

export const notificationRuntimeEntry = {
  id: "@tokovo/device-notifications",
  scope: "engine" as const,
  register(input: { tokovoRegistries: { engine: EngineRegistries } }): void {
    registerNotificationPlugin(input.tokovoRegistries.engine);
  },
};
