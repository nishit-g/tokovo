import { describe, expect, it } from "vitest";
import type { DeviceState, WorldState } from "@tokovo/core";
import { applyNotificationEvent } from "../runtime/reducer.js";

function baseWorld(): WorldState {
  return {
    apps: {},
    devices: {
      phone: {
        id: "phone",
        profileId: "iphone16",
        isLocked: false,
        foregroundAppId: "app_whatsapp",
        notifications: [],
      } as DeviceState,
    },
  } as unknown as WorldState;
}

describe("notification panel reducer", () => {
  it("opens and closes the notification panel explicitly", () => {
    const world = baseWorld();

    applyNotificationEvent(world as any, {
      at: 30,
      type: "TOGGLE_NOTIFICATION_PANEL",
      deviceId: "phone",
      payload: { open: true },
    });

    expect((world.devices.phone.notificationCenter as any)?.isOpen).toBe(true);
    expect((world.devices.phone.notificationCenter as any)?.openedAtFrame).toBe(30);

    applyNotificationEvent(world as any, {
      at: 90,
      type: "TOGGLE_NOTIFICATION_PANEL",
      deviceId: "phone",
      payload: { open: false },
    });

    expect((world.devices.phone.notificationCenter as any)?.isOpen).toBe(false);
    expect((world.devices.phone.notificationCenter as any)?.openedAtFrame).toBeNull();
  });

  it("closes the panel and opens the app when tapping a notification", () => {
    const world = baseWorld();

    applyNotificationEvent(world as any, {
      at: 0,
      type: "SHOW_NOTIFICATION",
      deviceId: "phone",
      payload: {
        kind: "show",
        id: "notif_1",
        appId: "app_instagram",
        title: "Instagram",
        body: "New comment storm",
      },
    });

    applyNotificationEvent(world as any, {
      at: 15,
      type: "TOGGLE_NOTIFICATION_PANEL",
      deviceId: "phone",
      payload: { open: true },
    });

    applyNotificationEvent(world as any, {
      at: 45,
      type: "TAP_NOTIFICATION",
      deviceId: "phone",
      payload: { kind: "tap", id: "notif_1" },
    });

    expect(world.devices.phone.foregroundAppId).toBe("app_instagram");
    expect((world.devices.phone.notificationCenter as any)?.isOpen).toBe(false);
  });
});
