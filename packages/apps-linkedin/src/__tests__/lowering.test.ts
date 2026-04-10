import { describe, expect, it } from "vitest";
import { linkedInLowering } from "../lowering/index.js";

describe("LinkedIn lowering", () => {
  it("emits a device notification when linkedin notifications are added", () => {
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
    } as any);

    expect(events).toHaveLength(2);
    expect(events[1]).toMatchObject({
      kind: "DEVICE",
      type: "SHOW_NOTIFICATION",
      payload: {
        id: "n1",
        appId: "app_linkedin",
        priority: "HIGH",
        threadKey: "t1",
      },
    });
  });

  it("clears and hides the keyboard when navigating back to passive surfaces", () => {
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
    } as any);

    expect(events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: "DEVICE", type: "KEYBOARD_CLEAR" }),
        expect.objectContaining({ kind: "DEVICE", type: "KEYBOARD_HIDE" }),
      ]),
    );
  });
});
