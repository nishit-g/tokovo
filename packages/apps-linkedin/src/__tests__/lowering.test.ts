import { describe, expect, it } from "vitest";
import { linkedInLowering } from "../lowering/index.js";

describe("LinkedIn lowering", () => {
  it("emits a semantic notification when linkedin notifications are added", () => {
    const intents: unknown[] = [];
    const events = linkedInLowering.lower({
      at: 12,
      kind: "APP",
      appId: "app_linkedin",
      type: "NOTIFICATION_ADD",
      payload: {
        id: "n1",
        type: "message",
        actorId: "u2",
        threadId: "t1",
      },
      deviceId: "device-1",
      _declarationOrder: 0,
    } as any, {
      emitNotification: (intent) => intents.push(intent),
      emitNotificationInteraction: () => undefined,
    });

    expect(events).toHaveLength(1);
    expect(intents).toEqual([expect.objectContaining({
      id: "n1",
      appId: "app_linkedin",
      interruption: "timeSensitive",
      threadId: "t1",
    })]);
  });

  it("keeps navigation app-owned", () => {
    const events = linkedInLowering.lower({
      at: 30,
      kind: "APP",
      appId: "app_linkedin",
      type: "NAVIGATE",
      payload: {
        screen: "feed",
      },
      deviceId: "device-1",
      _declarationOrder: 0,
    } as any, {
      emitNotification: () => undefined,
      emitNotificationInteraction: () => undefined,
    });

    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({ kind: "APP", type: "LINKEDIN_SET_SCREEN" });
  });
});
