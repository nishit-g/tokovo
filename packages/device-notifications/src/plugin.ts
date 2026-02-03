import { ReducerRegistry } from "@tokovo/core";
import { applyNotificationEvent } from "./runtime/reducer";

const DEBUG = process.env.NODE_ENV === "development";
let registered = false;

export function registerNotificationPlugin(): void {
  if (registered) return;
  registered = true;

  ReducerRegistry.registerFeatureReducer(
    "NOTIFICATION",
    (draft, event, _index) => {
      applyNotificationEvent(draft, event);
    },
  );

  if (DEBUG) {
    console.warn("[NotificationPlugin] Registered");
  }
}
