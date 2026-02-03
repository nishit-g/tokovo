import type { EngineRegistries } from "@tokovo/core";
import { applyNotificationEvent } from "./runtime/reducer";

const DEBUG = process.env.NODE_ENV === "development";
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
    console.warn("[NotificationPlugin] Registered");
  }
}
