import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NotificationSurface } from "../ui/index.js";
import { resolveNotificationDeviceContext } from "../contract/device-context.js";
import type { NotificationIntentIR, NotificationInteractionIR } from "@tokovo/ir";
import {
  evaluateNotificationProgram,
  systemCalendarNotificationAdapter,
  getNotificationTheme,
  prepareNotificationProgram,
  projectNotificationAudio,
  projectNotifications,
  type NotificationAppAdapter,
  type NotificationDeviceDescriptor,
  type NotificationPrepareInput,
} from "../index.js";

const adapter: NotificationAppAdapter = {
  appId: "app_chat",
  format: (intent) => ({
    appName: "Chat",
    icon: "/icons/chat.svg",
    accentColor: "#22c55e",
    leadingImage: intent.content.avatar?.src,
    leadingImageAlt: intent.content.avatar?.alt,
    title: intent.content.title,
    body: intent.content.body,
    subtitle: intent.content.subtitle,
  }),
  defaultAction: (intent) => ({
    navigation: {
      route: "thread",
      params: { threadId: intent.threadId },
    },
  }),
};

function device(
  overrides: Partial<NotificationDeviceDescriptor> = {},
): NotificationDeviceDescriptor {
  return {
    id: "phone",
    platform: "ios",
    platformProfileId: "ios:liquid-glass@1",
    appearance: "light",
    locale: "en-US",
    visualPreferences: {
      textScale: 1,
      contrast: "standard",
      motion: "full",
      transparency: "standard",
      materialPreference: "automatic",
    },
    initialLocked: false,
    initialDnd: false,
    initialForegroundAppId: "app_home",
    ...overrides,
  };
}

function intent(
  id: string,
  deliverAtFrame: number,
  overrides: Partial<NotificationIntentIR> = {},
): NotificationIntentIR {
  return {
    id,
    deviceId: "phone",
    appId: "app_chat",
    deliverAtFrame,
    content: { title: `Title ${id}`, body: `Body ${id}` },
    threadId: "thread-1",
    sequence: deliverAtFrame,
    ...overrides,
  };
}

function prepare(overrides: Partial<NotificationPrepareInput> = {}) {
  return prepareNotificationProgram({
    fps: 30,
    durationInFrames: 600,
    intents: [intent("n1", 30)],
    interactions: [],
    devices: [device()],
    adapters: new Map([[adapter.appId, adapter]]),
    ...overrides,
  });
}

const projectionConfig = {
  viewportWidth: 1179,
  viewportHeight: 2556,
  pointScale: 3,
  clockMs: Date.parse("2026-07-22T09:41:00Z"),
} as const;

describe("canonical notification program", () => {
  it("keeps every older group accessible in native history without changing cinematic limits", () => {
    for (const notificationUX of ["native", "cinematic"] as const) {
      const program = prepare({ devices: [device({ notificationUX, initialLocked: true })],
        intents: Array.from({ length: 20 }, (_, index) => intent(`history-${index}`, index, { groupId: `g-${index}` })),
        interactions: [{ deviceId: "phone", atFrame: 30, type: "openCenter", sequence: 0 }],
      });
      const projection = projectNotifications(program, "phone", 100, projectionConfig);
      expect(projection.center.groups).toHaveLength(notificationUX === "native" ? 20 : projection.theme.geometry.maxCenterGroups);
      if (notificationUX === "native") expect(projection.center.groups.at(-1)?.items[0].id).toBe("history-0");
    }
  });
  it("projects large histories deterministically within a bounded CPU budget", () => {
    const program = prepare({ devices: [device({ notificationUX: "native", initialLocked: true })],
      intents: Array.from({ length: 2000 }, (_, index) => intent(`bulk-${index}`, 1, { groupId: `group-${index}` })),
      interactions: [{ deviceId: "phone", atFrame: 30, type: "openCenter", sequence: 0 }],
    });
    const start = process.threadCpuUsage();
    const expected = projectNotifications(program, "phone", 100, projectionConfig);
    for (const frame of [20, 150, 80, 1, 200]) projectNotifications(program, "phone", frame, projectionConfig);
    expect(projectNotifications(program, "phone", 100, projectionConfig)).toEqual(expected);
    expect(expected.center.groups).toHaveLength(2000);
    const elapsed = process.threadCpuUsage(start);
    expect((elapsed.user + elapsed.system) / 1000).toBeLessThan(1500);
  });
  it("retains the previous group slot while a newer message promotes that group", () => {
    const program = prepare({ devices: [device({ notificationUX: "native", initialLocked: true })], intents: [
      intent("old-a", 1, { groupId: "a" }), intent("b", 20, { groupId: "b" }), intent("new-a", 60, { groupId: "a" }),
    ] });
    const start = projectNotifications(program, "phone", 60, projectionConfig).lockScreenGroups;
    expect(start[0].progress).toBe(0);
    expect(start.at(-1)?.key).toContain(":outgoing:");
    expect(start.at(-1)?.progress).toBe(1);
    const settled = projectNotifications(program, "phone", 100, projectionConfig).lockScreenGroups;
    expect(settled).toHaveLength(2);
    expect(settled[0].items[0].id).toBe("new-a");
    expect(projectNotifications(program, "phone", 60, projectionConfig).lockScreenGroups).toEqual(start);
  });
  it("validates and replays normalized history scrolling without marking notifications read", () => {
    for (const scrollPosition of [-1, 2, NaN, Infinity]) expect(() => prepare({ interactions: [
      { deviceId: "phone", atFrame: 40, type: "scrollHistory", scrollPosition },
    ] })).toThrow("NOTIFICATION_SCROLL_INVALID");
    const program = prepare({ devices: [device({ notificationUX: "native", initialLocked: true })], interactions: [
      { deviceId: "phone", atFrame: 40, type: "openCenter" },
      { deviceId: "phone", atFrame: 50, type: "scrollHistory", scrollPosition: 1 },
      { deviceId: "phone", atFrame: 80, type: "scrollHistory", scrollPosition: 0 },
    ] });
    expect(projectNotifications(program, "phone", 70, projectionConfig).center.scrollPosition).toBe(1);
    expect(projectNotifications(program, "phone", 110, projectionConfig).center.scrollPosition).toBe(0);
    expect(projectNotifications(program, "phone", 70, projectionConfig).center.scrollPosition).toBe(1);
    expect(evaluateNotificationProgram(program, "phone", 110).records.n1.readAtFrame).toBeUndefined();
  });
  it("reverses group and swipe motion from their current position, including reverse seeking", () => {
    const program = prepare({ devices: [device({ notificationUX: "native", initialLocked: true })],
      intents: [intent("n1", 1), intent("n2", 2)], interactions: [
        { deviceId: "phone", atFrame: 40, type: "expandGroup", notificationId: "n1" },
        { deviceId: "phone", atFrame: 40, type: "swipeLeft", notificationId: "n1" },
        { deviceId: "phone", atFrame: 42, type: "collapseGroup", notificationId: "n1" },
        { deviceId: "phone", atFrame: 42, type: "swipeRight", notificationId: "n1" },
      ] });
    const before = projectNotifications(program, "phone", 41.999, projectionConfig);
    const reversed = projectNotifications(program, "phone", 42, projectionConfig);
    expect(reversed.lockScreenGroups[0].expansionProgress).toBeCloseTo(before.lockScreenGroups[0].expansionProgress!, 3);
    expect(reversed.lockScreenGroups[0].items.find((item) => item.id === "n1")?.swipeProgress).toBeCloseTo(before.lockScreenGroups[0].items.find((item) => item.id === "n1")!.swipeProgress!, 3);
    expect(projectNotifications(program, "phone", 80, projectionConfig).lockScreenGroups[0].expansionProgress).toBe(0);
    expect(projectNotifications(program, "phone", 42, projectionConfig)).toEqual(reversed);
  });
  it("does not restart expansion when the reply keyboard takes ownership", () => {
    const program = prepare({ devices: [device({ notificationUX: "native" })],
      intents: [intent("n1", 1, { reply: { actionId: "reply", target: { appEvent: { type: "SEND" } } } })],
      interactions: [
        { deviceId: "phone", atFrame: 30, type: "expand", notificationId: "n1" },
        { deviceId: "phone", atFrame: 60, type: "beginReply", notificationId: "n1", inputSessionId: "input" },
        { deviceId: "phone", atFrame: 90, type: "collapse", notificationId: "n1" },
      ] });
    expect(projectNotifications(program, "phone", 60, projectionConfig).expanded?.progress).toBe(1);
    expect(projectNotifications(program, "phone", 91, projectionConfig).expanded?.progress).toBeGreaterThan(0);
    expect(projectNotifications(program, "phone", 91, projectionConfig).expanded?.inputSessionId).toBeUndefined();
    expect(projectNotifications(program, "phone", 120, projectionConfig).expanded).toBeUndefined();
  });
  it("keeps native images thumbnail-sized until expansion", () => {
    const program = prepare({ devices: [device({ notificationUX: "native", initialLocked: true })],
      intents: [intent("photo", 30, { content: { title: "Photo", body: "Take a look", media: { kind: "image", src: "/photo.png", aspectRatio: 1 } } })],
      interactions: [{ deviceId: "phone", atFrame: 70, type: "expand", notificationId: "photo" }],
    });
    const markup = (frame: number) => renderToStaticMarkup(createElement(NotificationSurface, {
      projection: projectNotifications(program, "phone", frame, projectionConfig), pointScale: 3,
    }));
    expect(markup(50)).toContain("width:132px;height:132px");
    expect(markup(50)).not.toContain("aspect-ratio:1");
    expect(markup(90)).toContain("aspect-ratio:1");
  });
  it("uses a native reply composer without changing cinematic reply presentation", () => {
    for (const notificationUX of ["native", "cinematic"] as const) {
      const program = prepare({ devices: [device({ notificationUX })],
        intents: [intent("n1", 30, { reply: { actionId: "reply", target: { appEvent: { type: "SEND" } } } })],
        interactions: [{ deviceId: "phone", atFrame: 40, type: "beginReply", notificationId: "n1", inputSessionId: "reply-input" }],
      });
      const projection = projectNotifications(program, "phone", 60, projectionConfig);
      const html = renderToStaticMarkup(createElement(NotificationSurface, { projection, pointScale: 3 }));
      expect(html.includes("data-notification-reply-composer")).toBe(notificationUX === "native");
      expect(html).toContain("data-notification-reply-draft");
      expect(html.includes("text-transform:uppercase")).toBe(notificationUX === "cinematic");
    }
  });
  it("shows native group hierarchy and keeps count presentation compact", () => {
    const program = prepare({ devices: [device({ notificationUX: "native", initialLocked: true })],
      intents: [intent("n1", 30), intent("n2", 35)], interactions: [
        { deviceId: "phone", atFrame: 40, type: "expandGroup", notificationId: "n1" },
        { deviceId: "phone", atFrame: 80, type: "setDisplay", display: "count" },
      ] });
    const markup = (frame: number) => renderToStaticMarkup(createElement(NotificationSurface, {
      projection: projectNotifications(program, "phone", frame, projectionConfig), pointScale: 3,
    }));
    expect(markup(60)).toContain("data-notification-group-heading");
    expect(markup(90)).toContain("align-self:center");
    expect(markup(90)).not.toContain("data-notification-id");
  });
  it("applies bounded visual tokens without changing delivery policy", () => {
    const program = prepare({ devices: [device({ notificationTokens: { card: "#fff7e9", text: "#343b32", radius: 24, padding: 16 } })] });
    const result = projectNotifications(program, "phone", 45, projectionConfig);
    expect(result.theme.materials.card.fill).toBe("#fff7e9");
    expect(result.theme.geometry.cardRadius).toBe(24);
    expect(result.banner?.id).toBe("n1");
    expect(() => prepare({ devices: [device({ notificationTokens: { padding: -1 } })] })).toThrow("NOTIFICATION_TOKENS_INVALID");
  });
  it("holds a locked tap until authored authentication and preserves its preview through handoff", () => {
    const program = prepare({ devices: [device({ initialLocked: true, notificationUX: "native" })], interactions: [
      { deviceId: "phone", atFrame: 40, type: "tap", notificationId: "n1" },
      { deviceId: "phone", atFrame: 70, type: "authenticate", notificationId: "n1" },
    ] });
    expect(program.actionEffects[0]).toMatchObject({ at: 70, requestedAtFrame: 40, authenticated: true });
    expect(evaluateNotificationProgram(program, "phone", 60).records.n1.lifecycle).toBe("delivered");
    expect(projectNotifications(program, "phone", 60, projectionConfig).expanded).toBeUndefined();
    expect(projectNotifications(program, "phone", 60, projectionConfig).lockScreenGroups[0].items[0].id).toBe("n1");
    const handoff = projectNotifications(program, "phone", 70, projectionConfig);
    expect(handoff.deviceContext.isLocked).toBe(false);
    expect(handoff.handoffProgress).toBe(0);
    expect(projectNotifications(program, "phone", 72, projectionConfig).handoffProgress).toBeGreaterThan(0);
    expect(projectNotifications(program, "phone", 100, projectionConfig).handoffProgress).toBeUndefined();
    expect(handoff.lockScreenGroups[0].progress).toBe(1);
    expect(projectNotifications(program, "phone", 100, projectionConfig).expanded).toBeUndefined();
    expect(projectNotifications(program, "phone", 60, projectionConfig).deviceContext.isLocked).toBe(true);
  });
  it("preserves the cinematic strategy as the backwards-compatible default", () => {
    const program = prepare({ devices: [device({ initialLocked: true })], interactions: [
      { deviceId: "phone", atFrame: 40, type: "tap", notificationId: "n1" },
    ] });
    const projection = projectNotifications(program, "phone", 60, projectionConfig);
    expect(projection.notificationUX).toBe("cinematic");
    expect(projection.expanded?.item.id).toBe("n1");
  });
  it("anchors only the native iPhone strategy at the bottom", () => {
    for (const notificationUX of ["cinematic", "native"] as const) {
      const program = prepare({ devices: [device({ initialLocked: true, notificationUX })] });
      const projection = projectNotifications(program, "phone", 60, projectionConfig);
      const markup = renderToStaticMarkup(createElement(NotificationSurface, { projection, pointScale: 3 }));
      expect(markup).toContain(`data-notification-ux="${notificationUX}"`);
      expect(markup.includes("bottom:312px")).toBe(notificationUX === "native");
    }
  });
  it("reveals previews after authentication without navigating and resets on relock", () => {
    const program = prepare({ devices: [device({ initialLocked: true })],
      intents: [intent("n1", 30, { privacy: "private" })],
      interactions: [{ deviceId: "phone", atFrame: 50, type: "authenticate" }],
      deviceOperations: [{ deviceId: "phone", at: 90, sequence: 0, type: "lock" }],
    });
    const authenticated = projectNotifications(program, "phone", 60, projectionConfig);
    expect(authenticated.deviceContext).toMatchObject({ isLocked: true, isAuthenticated: true });
    expect(authenticated.lockScreenGroups[0].items[0].body).toBe("Body n1");
    expect(program.actionEffects).toEqual([]);
    expect(projectNotifications(program, "phone", 100, projectionConfig).lockScreenGroups[0].items[0].body).toBe("New notification");
  });
  it("unfolds groups and reveals swipe actions without changing read or destination state", () => {
    const program = prepare({ devices: [device({ initialLocked: true })], intents: [intent("n1", 30), intent("n2", 35)],
      interactions: [
        { deviceId: "phone", atFrame: 40, type: "setDisplay", display: "count" },
        { deviceId: "phone", atFrame: 60, type: "setDisplay", display: "stack" },
        { deviceId: "phone", atFrame: 70, type: "expandGroup", notificationId: "n1" },
        { deviceId: "phone", atFrame: 90, type: "swipeLeft", notificationId: "n1" },
      ],
    });
    expect(projectNotifications(program, "phone", 50, projectionConfig).displayAs).toBe("count");
    const expanded = projectNotifications(program, "phone", 110, projectionConfig);
    expect(expanded.lockScreenGroups[0].expansionProgress).toBe(1);
    expect(expanded.lockScreenGroups[0].items.find((item) => item.id === "n1")?.swipeProgress).toBe(1);
    expect(program.actionEffects).toEqual([]);
    expect(evaluateNotificationProgram(program, "phone", 110).records.n1.readAtFrame).toBeUndefined();
  });
  it("never opens an unauthenticated or cancelled locked destination", () => {
    for (const cancelled of [false, true]) {
      const program = prepare({ devices: [device({ initialLocked: true })], interactions: [
        { deviceId: "phone", atFrame: 40, type: "tap", notificationId: "n1" },
        ...(cancelled ? [
          { deviceId: "phone", atFrame: 50, type: "dismiss" as const, notificationId: "n1" },
          { deviceId: "phone", atFrame: 70, type: "authenticate" as const, notificationId: "n1" },
        ] : []),
      ] });
      expect(program.actionEffects).toEqual([]);
      expect(resolveNotificationDeviceContext(program.devices.phone, 100, program.actionEffects).isLocked).toBe(true);
    }
  });
  it("projects reply ownership and releases it on collapse", () => {
    const program = prepare({ intents: [intent("n1", 30, { reply: { actionId: "reply", target: { appEvent: { type: "SEND" } } } })],
      interactions: [
        { deviceId: "phone", atFrame: 40, type: "beginReply", notificationId: "n1", inputSessionId: "reply-input" },
        { deviceId: "phone", atFrame: 80, type: "collapse", notificationId: "n1" },
      ] });
    expect(projectNotifications(program, "phone", 60, projectionConfig).expanded?.inputSessionId).toBe("reply-input");
    expect(projectNotifications(program, "phone", 90, projectionConfig).expanded).toBeUndefined();
  });
  it("keeps outgoing groups in layout until their removal motion finishes", () => {
    const program = prepare({ devices: [device({ initialLocked: true })],
      interactions: [{ deviceId: "phone", atFrame: 60, type: "dismiss", notificationId: "n1" }] });
    expect(projectNotifications(program, "phone", 60, projectionConfig).lockScreenGroups[0].progress).toBe(1);
    expect(projectNotifications(program, "phone", 63, projectionConfig).lockScreenGroups[0].progress).toBeLessThan(1);
    expect(projectNotifications(program, "phone", 100, projectionConfig).lockScreenGroups).toEqual([]);
  });
  it("keeps dismissal separate from explicit app read acknowledgement and badge state", () => {
    const program = prepare({ interactions: [
      { deviceId: "phone", atFrame: 40, type: "dismiss", notificationId: "n1" },
      { deviceId: "phone", atFrame: 50, type: "markRead", notificationId: "n1", badgeCount: 2,
        readTarget: { type: "MESSAGE_READ", payload: { messageId: "m1" } } },
    ] });
    expect(evaluateNotificationProgram(program, "phone", 45).records.n1).toMatchObject({ lifecycle: "dismissed" });
    expect(evaluateNotificationProgram(program, "phone", 45).records.n1.readAtFrame).toBeUndefined();
    expect(evaluateNotificationProgram(program, "phone", 55).records.n1).toMatchObject({ lifecycle: "dismissed", readAtFrame: 50 });
    expect(program.actionEffects).toMatchObject([{ at: 50, interactionType: "markRead", badgeCount: 2,
      target: { appEvent: { appId: "app_chat", type: "MESSAGE_READ" } } }]);
    expect(evaluateNotificationProgram(program, "phone", 35).records.n1.readAtFrame).toBeUndefined();
  });
  it("rejects read acknowledgement without an authoritative count and app event", () => {
    expect(() => prepare({ interactions: [{ deviceId: "phone", atFrame: 50, type: "markRead", notificationId: "n1" }] })).toThrow("NOTIFICATION_CONTRACT_INVALID");
    expect(() => prepare({ interactions: [{ deviceId: "phone", atFrame: 50, type: "dismiss", notificationId: "n1", badgeCount: 0 }] })).toThrow("NOTIFICATION_READ_FIELDS_INVALID");
  });
  it("cancels stale queued banners without deleting notification history", () => {
    for (const operation of [
      { type: "lock" as const },
      { type: "setDnd" as const, enabled: true },
      { type: "openApp" as const, appId: "app_chat" },
    ]) {
      const program = prepare({
        intents: [intent("first", 30, { bannerDurationFrames: 60 }), intent("queued", 40)],
        deviceOperations: [{ ...operation, deviceId: "phone", at: 60, sequence: 0 }],
      });
      expect(program.records[0].delivery.bannerEndFrame).toBe(60);
      expect(program.records[1].delivery.bannerStartFrame).toBeUndefined();
      expect(evaluateNotificationProgram(program, "phone", 100).records.queued.lifecycle).toBe("delivered");
      expect(projectNotifications(program, "phone", 100, projectionConfig).banner).toBeUndefined();
    }
  });
  it("keeps explicit foreground presentation and urgent DND overrides", () => {
    const program = prepare({
      intents: [intent("urgent", 30, { interruption: "critical", foregroundBehavior: "present" })],
      deviceOperations: [
        { type: "setDnd", enabled: true, deviceId: "phone", at: 40, sequence: 0 },
        { type: "openApp", appId: "app_chat", deviceId: "phone", at: 50, sequence: 1 },
      ],
    });
    expect(projectNotifications(program, "phone", 60, projectionConfig).banner?.id).toBe("urgent");
  });
  it("seeks a long context timeline in arbitrary order without leaking cached mutations", () => {
    const program = prepare({ intents: [], durationInFrames: 6000,
      deviceOperations: Array.from({ length: 5000 }, (_, at) => ({
        deviceId: "phone", at, sequence: at, type: at % 2 ? "unlock" as const : "lock" as const,
      })),
    });
    for (let index = 0; index < 10000; index++) {
      const frame = (index * 7919) % 5000;
      const context = resolveNotificationDeviceContext(program.devices.phone, frame, program.actionEffects);
      expect(context.isLocked).toBe(frame % 2 === 0);
      context.isLocked = !context.isLocked;
    }
    expect(resolveNotificationDeviceContext(program.devices.phone, 0, program.actionEffects).isLocked).toBe(true);
  });
  it("formats OS-owned Calendar notifications without an app plugin", () => {
    const calendarIntent = intent("calendar", 30, {
      appId: "system_calendar",
      content: {
        title: "Teal accepted",
        body: "Discuss Teal's performance",
      },
    });
    const program = prepare({
      intents: [calendarIntent],
      adapters: new Map([
        [systemCalendarNotificationAdapter.appId, systemCalendarNotificationAdapter],
      ]),
    });

    expect(program.records[0]).toMatchObject({
      appId: "system_calendar",
      presentation: {
        appName: "Calendar",
        icon: "31",
        accentColor: "#ff3b30",
        title: "Teal accepted",
        body: "Discuss Teal's performance",
      },
      defaultAction: {
        navigation: {
          appId: "system_calendar",
          route: "today",
        },
      },
    });
  });

  it("queues same-frame banners by authored sequence and projects audio", () => {
    const program = prepare({
      intents: [
        intent("second", 30, { sequence: 2, bannerDurationFrames: 30 }),
        intent("first", 30, { sequence: 1, bannerDurationFrames: 30 }),
      ],
    });

    expect(program.records.map((record) => record.id)).toEqual(["first", "second"]);
    expect(program.records[0].delivery).toMatchObject({
      bannerStartFrame: 30,
      bannerEndFrame: 60,
      soundAtFrame: 30,
    });
    expect(program.records[1].delivery.bannerStartFrame).toBe(66);
    expect(projectNotificationAudio(program).map((cue) => cue.id)).toEqual([
      "notification:first",
    ]);
  });

  it("coalesces default bursts per device without swallowing custom or critical cues", () => {
    const program = prepare({
      devices: [device(), device({ id: "other" })],
      intents: [
        intent("first", 30),
        intent("burst", 35),
        intent("custom", 35, { sound: { soundId: "authored", volume: 0.4 } }),
        intent("critical", 35, { interruption: "critical" }),
        intent("other", 35, { deviceId: "other" }),
        intent("later", 41),
      ],
    });
    const cues = projectNotificationAudio(program);
    expect(cues.map((cue) => cue.id)).toEqual([
      "notification:first", "notification:critical", "notification:custom",
      "notification:other", "notification:later",
    ]);
    expect(cues.find((cue) => cue.id === "notification:custom")).toMatchObject({ soundId: "authored", volume: 0.4 });
    expect(projectNotificationAudio(program)).toEqual(cues);
  });

  it("keeps focused and foreground notifications in center while suppressing alerts", () => {
    const focused = prepare({
      devices: [device({ initialDnd: true })],
      intents: [
        intent("active", 30, { interruption: "active" }),
        intent("urgent", 60, { interruption: "timeSensitive" }),
      ],
    });

    expect(focused.records[0].delivery).toMatchObject({
      outcome: "delivered",
      alertSuppressionReason: "focus",
      centerEligible: true,
    });
    expect(focused.records[0].delivery.bannerStartFrame).toBeUndefined();
    expect(focused.records[0].delivery.soundAtFrame).toBeUndefined();
    expect(focused.records[1].delivery.bannerStartFrame).toBe(60);
    expect(focused.records[1].delivery.soundAtFrame).toBe(60);

    const foreground = prepare({
      devices: [device({ initialForegroundAppId: "app_chat" })],
    });
    expect(foreground.records[0].delivery).toMatchObject({
      outcome: "delivered",
      alertSuppressionReason: "foreground",
      centerEligible: true,
    });
  });

  it("treats passive, active, time-sensitive, and critical policy distinctly", () => {
    const program = prepare({
      devices: [device({ initialDnd: true })],
      intents: [
        intent("passive", 30, { interruption: "passive" }),
        intent("active", 60, { interruption: "active" }),
        intent("time", 90, { interruption: "timeSensitive" }),
        intent("critical", 120, { interruption: "critical" }),
      ],
    });

    const byId = Object.fromEntries(program.records.map((record) => [record.id, record]));
    expect(byId.passive.delivery.bannerStartFrame).toBeUndefined();
    expect(byId.passive.delivery.soundAtFrame).toBeUndefined();
    expect(byId.active.delivery.alertSuppressionReason).toBe("focus");
    expect(byId.time.delivery.bannerStartFrame).toBe(90);
    expect(byId.critical.delivery.soundAtFrame).toBe(120);
    expect(
      projectNotificationAudio(program).find((cue) => cue.id.endsWith("critical")),
    ).toMatchObject({ critical: true });
  });

  it("is random-access deterministic and clear-all never erases future delivery", () => {
    const interactions: NotificationInteractionIR[] = [
      { deviceId: "phone", atFrame: 10, type: "clearAll", sequence: 0 },
      {
        deviceId: "phone",
        atFrame: 70,
        type: "dismiss",
        notificationId: "future",
        sequence: 1,
      },
    ];
    const program = prepare({
      intents: [intent("future", 30, { retentionUntilFrame: 100 })],
      interactions,
    });

    const frame60First = evaluateNotificationProgram(program, "phone", 60);
    evaluateNotificationProgram(program, "phone", 200);
    const frame60Again = evaluateNotificationProgram(program, "phone", 60);
    expect(frame60Again).toEqual(frame60First);
    expect(frame60First.records.future.lifecycle).toBe("delivered");
    expect(evaluateNotificationProgram(program, "phone", 80).records.future).toMatchObject({
      lifecycle: "dismissed",
      dismissedAtFrame: 70,
    });
  });

  it("preserves an action that occurs before expiry", () => {
    const program = prepare({
      intents: [
        intent("replyable", 30, {
          retentionUntilFrame: 100,
          reply: {
            actionId: "reply",
            textPayloadKey: "text",
            target: {
              appEvent: {
                type: "MESSAGE_SEND",
                payload: { threadId: "thread-1" },
              },
            },
          },
        }),
      ],
      interactions: [
        {
          deviceId: "phone",
          atFrame: 60,
          type: "reply",
          notificationId: "replyable",
          replyText: "नमस्ते 👋🏽",
          sequence: 0,
        },
      ],
    });

    expect(evaluateNotificationProgram(program, "phone", 200).records.replyable).toMatchObject({
      lifecycle: "acted",
      actedAtFrame: 60,
      actionId: "reply",
      replyText: "नमस्ते 👋🏽",
    });
    expect(program.actionEffects).toMatchObject([
      {
        interactionType: "reply",
        replyText: "नमस्ते 👋🏽",
        replyTextField: "text",
        target: {
          appEvent: { appId: "app_chat", type: "MESSAGE_SEND" },
        },
      },
    ]);
  });

  it("isolates devices", () => {
    const program = prepare({
      devices: [
        device(),
        device({
          id: "tablet",
          platform: "android",
          platformProfileId: "android:material3@1",
        }),
      ],
      intents: [intent("phone-only", 30), intent("tablet-only", 30, { deviceId: "tablet" })],
      interactions: [
        {
          deviceId: "tablet",
          atFrame: 60,
          type: "dismiss",
          notificationId: "tablet-only",
        },
      ],
    });
    expect(evaluateNotificationProgram(program, "phone", 90).orderedIds).toEqual(["phone-only"]);
    expect(
      evaluateNotificationProgram(program, "tablet", 90).records["tablet-only"].lifecycle,
    ).toBe("dismissed");
  });
});

describe("notification projection, locale, privacy, and themes", () => {
  it("paints compact two-line banners without autoplaying expanded media across platforms", () => {
    for (const platform of ["ios", "android"] as const) for (const appearance of ["light", "dark"] as const) {
      const program = prepare({
        devices: [device({ platform, appearance, locale: "ar", platformProfileId: platform === "ios" ? "ios:liquid-glass@1" : "android:material3@1" })],
        intents: [intent("media", 30, { content: { title: "رسالة جديدة", body: "مرحبا بالعالم", media: { kind: "video", src: "/video.mp4" } } })],
      });
      const projection = projectNotifications(program, "phone", 45, projectionConfig);
      const html = renderToStaticMarkup(createElement(NotificationSurface, { projection, pointScale: 3 }));
      expect(html).toContain('data-notification-surface-kind="banner"');
      expect(html).toContain("-webkit-line-clamp:2");
      expect(html).toContain("direction:rtl");
      expect(html).not.toContain("/video.mp4");
      expect(html).toContain(`height:${projection.cinematicSubjects.banner?.height}px`);
    }
  });
  it("completes entrance and exit even for a short banner lifetime", () => {
    const program = prepare({ intents: [intent("short", 30, { bannerDurationFrames: 6 })] });
    const progress = (frame: number) => projectNotifications(program, "phone", frame, projectionConfig).banner?.animation;
    expect(progress(30)?.progress).toBe(0);
    expect(progress(33)?.progress).toBe(1);
    expect(progress(35)?.phase).toBe("exiting");
    expect(progress(35)?.progress).toBeLessThan(0.2);
    expect(progress(36)).toBeUndefined();
  });
  it("dismisses at the authored frame and retains only outgoing paint afterward", () => {
    const program = prepare({ interactions: [{ deviceId: "phone", notificationId: "n1", type: "dismiss", atFrame: 60, sequence: 1 }] });
    expect(projectNotifications(program, "phone", 59, projectionConfig).banner?.animation.progress).toBe(1);
    expect(evaluateNotificationProgram(program, "phone", 60).records.n1.lifecycle).toBe("dismissed");
    expect(projectNotifications(program, "phone", 60, projectionConfig).banner?.animation).toEqual({ phase: "exiting", progress: 1 });
    expect(projectNotifications(program, "phone", 62, projectionConfig).banner?.animation.progress).toBeLessThan(1);
    expect(projectNotifications(program, "phone", 90, projectionConfig).banner).toBeUndefined();
  });
  it("animates center closure without changing the runtime open state", () => {
    const program = prepare({ interactions: [
      { deviceId: "phone", type: "openCenter", atFrame: 50, sequence: 1 },
      { deviceId: "phone", type: "closeCenter", atFrame: 90, sequence: 2 },
    ] });
    expect(evaluateNotificationProgram(program, "phone", 90).centerOpen).toBe(false);
    expect(projectNotifications(program, "phone", 91, projectionConfig).center.progress).toBeGreaterThan(0);
    expect(projectNotifications(program, "phone", 120, projectionConfig).center.open).toBe(false);
  });
  it("honors reduced motion and reserves the complete banner text height", () => {
    const base = device();
    const program = prepare({ devices: [device({ visualPreferences: { ...base.visualPreferences, motion: "reduced", textScale: 1.4 } })] });
    const projection = projectNotifications(program, "phone", 30, projectionConfig);
    expect(projection.banner?.animation.progress).toBe(1);
    expect(projection.theme.motion.reduced).toBe(true);
    expect(projection.cinematicSubjects.banner?.height).toBeGreaterThan(projection.theme.geometry.bannerMinHeight * 3);
    expect(projection.clockLabel).toContain("9:41");
  });
  it("localizes Arabic OS chrome and redacts private content while locked", () => {
    const program = prepare({
      devices: [device({ initialLocked: true, locale: "ar-SA", appearance: "dark" })],
      intents: [
        intent("arabic", 30, {
          content: { title: "ليلى", body: "الاجتماع الساعة الثامنة" },
          privacy: "private",
        }),
      ],
      interactions: [{ deviceId: "phone", atFrame: 60, type: "openCenter", sequence: 0 }],
    });

    const locked = projectNotifications(program, "phone", 45, projectionConfig);
    const item = locked.lockScreenGroups[0].items[0];
    expect(locked).toMatchObject({
      locale: "ar-SA",
      direction: "rtl",
      strings: { centerTitle: "الإشعارات", newNotification: "إشعار جديد" },
    });
    expect(item).toMatchObject({
      title: "Chat",
      body: "إشعار جديد",
      direction: "rtl",
      ageLabel: "الآن",
    });
    expect(item.actions).toEqual([]);

    const center = projectNotifications(program, "phone", 75, projectionConfig);
    expect(center.center.open).toBe(true);
    expect(center.center.groups[0].items[0].body).toBe("إشعار جديد");
  });

  it("preserves Hindi, Japanese, emoji and grapheme content exactly", () => {
    const content = "नमस्ते — こんにちは — परिवार 👨‍👩‍👧‍👦 — e\u0301";
    const program = prepare({
      devices: [device({ locale: "hi-IN" })],
      intents: [intent("unicode", 30, { content: { title: "अद्यतन", body: content } })],
    });
    const projection = projectNotifications(program, "phone", 45, projectionConfig);
    expect(projection.banner?.body).toBe(content);
    expect(projection.banner?.ageLabel).toBe("अभी");
  });

  it("projects communication avatars without replacing app identity", () => {
    const program = prepare({
      intents: [
        intent("avatar", 30, {
          content: {
            title: "Ava",
            body: "Ready to review",
            avatar: { src: "/avatars/ava.jpg", alt: "Ava" },
          },
        }),
      ],
    });
    expect(projectNotifications(program, "phone", 45, projectionConfig).banner).toMatchObject({
      icon: "/icons/chat.svg",
      leadingImage: "/avatars/ava.jpg",
      leadingImageAlt: "Ava",
    });
  });

  it("redacts communication avatars together with private lock-screen previews", () => {
    const program = prepare({
      devices: [device({ initialLocked: true })],
      intents: [
        intent("private-avatar", 30, {
          privacy: "private",
          content: {
            title: "Ava",
            body: "Private message",
            avatar: { src: "/avatars/ava.jpg", alt: "Ava" },
          },
        }),
      ],
    });
    const item = projectNotifications(program, "phone", 45, projectionConfig).lockScreenGroups[0]
      .items[0];
    expect(item.leadingImage).toBeUndefined();
    expect(item.leadingImageAlt).toBeUndefined();
  });

  it.each([
    ["ios", "light"],
    ["ios", "dark"],
    ["android", "light"],
    ["android", "dark"],
  ] as const)("resolves a real %s/%s system theme", (platform, appearance) => {
    const platformProfileId = platform === "ios" ? "ios:liquid-glass@1" : "android:material3@1";
    const theme = getNotificationTheme(platform, appearance, platformProfileId);
    expect(theme.id).toBe(`${platformProfileId}:${appearance}:notifications`);
    expect(theme.platform).toBe(platform);
    expect(theme.appearance).toBe(appearance);
    expect(theme.colors.card).toBeTruthy();
    expect(theme.geometry.cardRadius).toBeGreaterThan(0);
  });

  it("projects grouped center cards, exact subjects, and Android status icons", () => {
    const program = prepare({
      devices: [
        device({
          platform: "android",
          platformProfileId: "android:material3@1",
        }),
      ],
      intents: [
        intent("one", 30, { groupId: "thread-a" }),
        intent("two", 60, { groupId: "thread-a" }),
      ],
      interactions: [{ deviceId: "phone", atFrame: 90, type: "openCenter", sequence: 0 }],
    });
    const projection = projectNotifications(program, "phone", 100, projectionConfig);
    expect(projection.center.groups).toMatchObject([
      { count: 2, items: [{ id: "two" }, { id: "one" }] },
    ]);
    expect(projection.cinematicSubjects.center).toEqual({
      x: 0,
      y: 0,
      width: 1179,
      height: 2556,
    });
    expect(projection.statusBarIcons).toEqual([
      { appId: "app_chat", icon: "/icons/chat.svg", count: 2 },
    ]);
  });
});

describe("notification contract failures", () => {
  it("fails loudly for unknown apps and invalid interactions", () => {
    expect(() => prepare({ adapters: new Map() })).toThrow("NOTIFICATION_ADAPTER_MISSING");
    expect(() =>
      prepare({
        interactions: [{ deviceId: "phone", atFrame: 60, type: "tap", sequence: 0 }],
      }),
    ).toThrow("NOTIFICATION_INTERACTION_TARGET_MISSING");
  });

  it("rejects actions against conditionally undelivered notifications", () => {
    expect(() =>
      prepare({
        intents: [intent("locked-only", 30, { deliveryCondition: "onlyWhenLocked" })],
        interactions: [
          {
            deviceId: "phone",
            atFrame: 60,
            type: "tap",
            notificationId: "locked-only",
            sequence: 0,
          },
        ],
      }),
    ).toThrow("NOTIFICATION_INTERACTION_TARGET_UNDELIVERED");
  });

  it("rejects interactions after retention expiry", () => {
    expect(() =>
      prepare({
        intents: [intent("short", 30, { retentionUntilFrame: 60 })],
        interactions: [
          {
            deviceId: "phone",
            atFrame: 60,
            type: "dismiss",
            notificationId: "short",
            sequence: 0,
          },
        ],
      }),
    ).toThrow("NOTIFICATION_INTERACTION_AFTER_EXPIRY");
  });
});
