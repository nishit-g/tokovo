import { describe, expect, it } from "vitest";
import type { Notification, DeviceState } from "../types";
import {
  DEFAULT_NOTIFICATION_HEIGHT,
  createNotificationAdapterRegistry,
} from "../notifications/adapter";
import { createNotificationViewRegistry } from "../notifications/registry";
import {
  showNotification,
  updateNotification,
  dismissNotification,
  tapNotification,
  swipeNotification,
  replyToNotification,
  toggleNotificationPanel,
  clearAllNotifications,
  setDynamicIsland,
  notificationDsl,
} from "../notifications/dsl";
import { NotificationScheduler } from "../notifications/scheduler";

const baseNotification: Notification = {
  id: "n1",
  ir: { id: "n1", appId: "app", title: "Title", body: "Body" },
  appId: "app",
  title: "Title",
  body: "Body",
  state: "pending",
  createdAtFrame: 0,
};

describe("notification adapters", () => {
  it("formats using adapter or falls back", () => {
    const adapterRegistry = createNotificationAdapterRegistry();
    const formatted = adapterRegistry.format(baseNotification);
    expect(formatted.title).toBe("Title");
    expect(formatted.body).toBe("Body");

    const adapter = {
      appId: "app",
      format: () => ({ title: "Custom", body: "Custom body" }),
      handleAction: () => [{ at: 1, kind: "APP", type: "OPEN" } as any],
    };
    adapterRegistry.register(adapter);
    const custom = adapterRegistry.format(baseNotification);
    expect(custom.title).toBe("Custom");
    expect(custom.body).toBe("Custom body");
    expect(adapterRegistry.get("app")).toBe(adapter);

    const actionEvents = adapterRegistry.handleAction(
      baseNotification,
      "open",
      { frame: 42 },
    );
    expect(actionEvents[0].kind).toBe("APP");

    adapterRegistry.unregister("app");
  });

  it("falls back to default open action", () => {
    const adapterRegistry = createNotificationAdapterRegistry();
    const events = adapterRegistry.handleAction(baseNotification, "open", {
      frame: 12,
    });
    expect(events[0].kind).toBe("DEVICE");
    expect((events[0] as any).type).toBe("OPEN_APP");
    expect(events[0].at).toBe(12);
  });

  it("exposes default height", () => {
    expect(DEFAULT_NOTIFICATION_HEIGHT).toBeGreaterThan(0);
  });
});

describe("notification registry and dsl", () => {
  it("registers view components", () => {
    const viewRegistry = createNotificationViewRegistry();
    const Component = () => null;
    viewRegistry.register("app", Component);
    expect(viewRegistry.get("app")).toBe(Component);
  });

  it("creates timeline events via DSL helpers", () => {
    const show = showNotification(1, "phone", {
      appId: "app",
      title: "Hi",
      body: "Body",
    });
    expect(show.type).toBe("SHOW_NOTIFICATION");

    const update = updateNotification(2, "phone", "n1", { title: "New" });
    expect(update.type).toBe("UPDATE_NOTIFICATION");

    const dismiss = dismissNotification(3, "phone", { notificationId: "n1" });
    expect(dismiss.type).toBe("DISMISS_NOTIFICATION");

    const tap = tapNotification(4, "phone", "n1", "open");
    expect(tap.type).toBe("TAP_NOTIFICATION");

    const swipe = swipeNotification(5, "phone", "n1", "left", "archive");
    expect(swipe.type).toBe("SWIPE_NOTIFICATION");

    const reply = replyToNotification(6, "phone", "n1", "Hi");
    expect(reply.type).toBe("REPLY_NOTIFICATION");

    const toggle = toggleNotificationPanel(7, "phone", true);
    expect(toggle.type).toBe("TOGGLE_NOTIFICATION_PANEL");

    const clearAll = clearAllNotifications(8, "phone");
    expect(clearAll.type).toBe("CLEAR_ALL_NOTIFICATIONS");

    const island = setDynamicIsland(9, "phone", true, "expanded");
    expect(island.type).toBe("SET_DYNAMIC_ISLAND");

    expect(notificationDsl.show).toBe(showNotification);
    expect(notificationDsl.clearAll).toBe(clearAllNotifications);
  });
});

describe("notification scheduler", () => {
  it("returns null when no notifications or DND", () => {
    const emptyDevice = { notificationCenter: { items: [] } } as DeviceState;
    expect(NotificationScheduler.schedule(emptyDevice, 0).headsUp).toBeNull();

    const dndDevice = {
      notificationCenter: { items: [baseNotification] },
      os: { dnd: true },
    } as DeviceState;
    expect(NotificationScheduler.schedule(dndDevice, 0).headsUp).toBeNull();
  });

  it("handles missing notification storage", () => {
    const device = {} as DeviceState;
    expect(NotificationScheduler.schedule(device, 0).headsUp).toBeNull();
  });

  it("filters and schedules heads-up notifications", () => {
    const notif1: Notification = { ...baseNotification, id: "n1" };
    const notif2: Notification = {
      ...baseNotification,
      id: "n2",
      createdAtFrame: 100,
    };
    const device = {
      notificationCenter: { items: [notif1, notif2] },
      os: { dnd: false },
    } as DeviceState;

    const first = NotificationScheduler.schedule(device, 0).headsUp;
    expect(first?.id).toBe("n1");
    expect(first?.shownAtFrame).toBe(0);

    const second = NotificationScheduler.schedule(device, 170).headsUp;
    expect(second?.id).toBe("n2");
    expect(second?.shownAtFrame).toBe(160);
  });

  it("handles legacy notification storage and dismissed filtering", () => {
    const legacy: Notification = {
      ...baseNotification,
      id: "legacy",
      createdAtFrame: 0,
      state: "dismissed",
      dismissedAt: 1,
    };

    const device = {
      os: {
        dnd: false,
        notifications: [legacy],
      },
    } as DeviceState;

    expect(NotificationScheduler.schedule(device, 10).headsUp).toBeNull();
  });

  it("orders legacy notifications by delivered timestamps", () => {
    const first: Notification = {
      ...baseNotification,
      id: "first",
      createdAtFrame: undefined,
    } as Notification;
    (first as any).deliveredAt = 5;

    const second: Notification = {
      ...baseNotification,
      id: "second",
      createdAtFrame: undefined,
    } as Notification;
    (second as any).at = 1;

    const device = {
      os: { notifications: [first, second], dnd: false },
    } as DeviceState;

    const headsUp = NotificationScheduler.schedule(device, 1).headsUp;
    expect(headsUp?.id).toBe("second");
  });

  it("defaults legacy timestamps when missing", () => {
    const legacy: Notification = {
      ...baseNotification,
      id: "missing",
      createdAtFrame: undefined,
    } as Notification;

    const device = {
      os: { notifications: [legacy], dnd: false },
    } as DeviceState;

    const headsUp = NotificationScheduler.schedule(device, 0).headsUp;
    expect(headsUp?.id).toBe("missing");
    expect(headsUp?.shownAtFrame).toBe(0);
  });

  it("orders notifications with missing timestamps using fallbacks", () => {
    const first: Notification = {
      ...baseNotification,
      id: "first-zero",
      createdAtFrame: undefined,
    } as Notification;
    const second: Notification = {
      ...baseNotification,
      id: "second-zero",
      createdAtFrame: undefined,
    } as Notification;

    const device = {
      os: { notifications: [first, second], dnd: false },
    } as DeviceState;

    const headsUp = NotificationScheduler.schedule(device, 0).headsUp;
    expect(headsUp?.id).toBe("first-zero");
  });

  it("skips lockscreen-only notifications", () => {
    const lockscreen: Notification = {
      ...baseNotification,
      id: "lock",
      mode: "lockscreen",
      createdAtFrame: 0,
    } as Notification;

    const device = {
      notificationCenter: { items: [lockscreen] },
      os: { dnd: false },
    } as DeviceState;

    expect(NotificationScheduler.schedule(device, 1).headsUp).toBeNull();
  });
});
