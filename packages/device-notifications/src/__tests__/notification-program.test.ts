import { describe, expect, it } from "vitest";
import type {
  NotificationIntentIR,
  NotificationInteractionIR,
} from "@tokovo/ir";
import {
  evaluateNotificationProgram,
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
    appearance: "light",
    locale: "en-US",
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
  safeAreaTop: 59,
} as const;

describe("canonical notification program", () => {
  it("queues same-frame banners by authored sequence and projects audio", () => {
    const program = prepare({
      intents: [
        intent("second", 30, { sequence: 2, bannerDurationFrames: 30 }),
        intent("first", 30, { sequence: 1, bannerDurationFrames: 30 }),
      ],
    });

    expect(program.records.map((record) => record.id)).toEqual([
      "first",
      "second",
    ]);
    expect(program.records[0].delivery).toMatchObject({
      bannerStartFrame: 30,
      bannerEndFrame: 60,
      soundAtFrame: 30,
    });
    expect(program.records[1].delivery.bannerStartFrame).toBe(66);
    expect(projectNotificationAudio(program).map((cue) => cue.id)).toEqual([
      "notification:first",
      "notification:second",
    ]);
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

    const byId = Object.fromEntries(
      program.records.map((record) => [record.id, record]),
    );
    expect(byId.passive.delivery.bannerStartFrame).toBeUndefined();
    expect(byId.passive.delivery.soundAtFrame).toBeUndefined();
    expect(byId.active.delivery.alertSuppressionReason).toBe("focus");
    expect(byId.time.delivery.bannerStartFrame).toBe(90);
    expect(byId.critical.delivery.soundAtFrame).toBe(120);
    expect(
      projectNotificationAudio(program).find((cue) =>
        cue.id.endsWith("critical"),
      ),
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
    expect(
      evaluateNotificationProgram(program, "phone", 80).records.future,
    ).toMatchObject({ lifecycle: "dismissed", dismissedAtFrame: 70 });
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

    expect(
      evaluateNotificationProgram(program, "phone", 200).records.replyable,
    ).toMatchObject({
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
      devices: [device(), device({ id: "tablet", platform: "android" })],
      intents: [
        intent("phone-only", 30),
        intent("tablet-only", 30, { deviceId: "tablet" }),
      ],
      interactions: [
        {
          deviceId: "tablet",
          atFrame: 60,
          type: "dismiss",
          notificationId: "tablet-only",
        },
      ],
    });
    expect(
      evaluateNotificationProgram(program, "phone", 90).orderedIds,
    ).toEqual(["phone-only"]);
    expect(
      evaluateNotificationProgram(program, "tablet", 90).records["tablet-only"]
        .lifecycle,
    ).toBe("dismissed");
  });
});

describe("notification projection, locale, privacy, and themes", () => {
  it("localizes Arabic OS chrome and redacts private content while locked", () => {
    const program = prepare({
      devices: [
        device({ initialLocked: true, locale: "ar-SA", appearance: "dark" }),
      ],
      intents: [
        intent("arabic", 30, {
          content: { title: "ليلى", body: "الاجتماع الساعة الثامنة" },
          privacy: "private",
        }),
      ],
      interactions: [
        { deviceId: "phone", atFrame: 60, type: "openCenter", sequence: 0 },
      ],
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
      intents: [
        intent("unicode", 30, { content: { title: "अद्यतन", body: content } }),
      ],
    });
    const projection = projectNotifications(
      program,
      "phone",
      45,
      projectionConfig,
    );
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
    expect(
      projectNotifications(program, "phone", 45, projectionConfig).banner,
    ).toMatchObject({
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
    const item = projectNotifications(program, "phone", 45, projectionConfig)
      .lockScreenGroups[0].items[0];
    expect(item.leadingImage).toBeUndefined();
    expect(item.leadingImageAlt).toBeUndefined();
  });

  it.each([
    ["ios", "light"],
    ["ios", "dark"],
    ["android", "light"],
    ["android", "dark"],
  ] as const)("resolves a real %s/%s system theme", (platform, appearance) => {
    const theme = getNotificationTheme(platform, appearance);
    expect(theme.id).toBe(`system:${platform}:${appearance}`);
    expect(theme.platform).toBe(platform);
    expect(theme.appearance).toBe(appearance);
    expect(theme.colors.card).toBeTruthy();
    expect(theme.geometry.cardRadius).toBeGreaterThan(0);
  });

  it("projects grouped center cards, exact subjects, and Android status icons", () => {
    const program = prepare({
      devices: [device({ platform: "android" })],
      intents: [
        intent("one", 30, { groupId: "thread-a" }),
        intent("two", 60, { groupId: "thread-a" }),
      ],
      interactions: [
        { deviceId: "phone", atFrame: 90, type: "openCenter", sequence: 0 },
      ],
    });
    const projection = projectNotifications(
      program,
      "phone",
      100,
      projectionConfig,
    );
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
    expect(() => prepare({ adapters: new Map() })).toThrow(
      "NOTIFICATION_ADAPTER_MISSING",
    );
    expect(() =>
      prepare({
        interactions: [
          { deviceId: "phone", atFrame: 60, type: "tap", sequence: 0 },
        ],
      }),
    ).toThrow("NOTIFICATION_INTERACTION_TARGET_MISSING");
  });

  it("rejects actions against conditionally undelivered notifications", () => {
    expect(() =>
      prepare({
        intents: [
          intent("locked-only", 30, { deliveryCondition: "onlyWhenLocked" }),
        ],
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
