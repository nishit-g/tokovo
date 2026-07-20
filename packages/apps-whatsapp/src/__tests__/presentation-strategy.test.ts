import { describe, expect, it } from "vitest";
import { whatsappBootstrap } from "../bootstrap.js";
import { createWhatsAppInitialState } from "../runtime/initial-state.js";
import {
  getWhatsAppPresentationStrategy,
  resolveWhatsAppScreenId,
} from "../presentation/strategy.js";
import type { WhatsAppState } from "../types/index.js";

describe("WhatsApp presentation strategies", () => {
  it("accepts only canonical screen IDs", () => {
    expect(resolveWhatsAppScreenId(undefined)).toBe("chats");
    expect(resolveWhatsAppScreenId("updates")).toBe("updates");
    expect(() => resolveWhatsAppScreenId("status")).toThrow(
      'Unsupported WhatsApp screen "status"',
    );
    expect(() => resolveWhatsAppScreenId("made-up-screen")).toThrow(
      'Unsupported WhatsApp screen "made-up-screen"',
    );
  });

  it("keeps platform navigation and composer policies explicit", () => {
    const ios = getWhatsAppPresentationStrategy("ios");
    const android = getWhatsAppPresentationStrategy("android");

    expect(ios.navigation.tabs).toContain("settings");
    expect(android.navigation.tabs).not.toContain("settings");
    expect(ios.conversation.composerLeadingAction).toBe("add");
    expect(android.conversation.composerLeadingAction).toBe("emoji");
  });

  it("preserves canonical semantic group members", () => {
    const state = whatsappBootstrap.hydrate({
      appId: "app_whatsapp",
      deviceId: "phone",
      device: {
        id: "phone",
        app: "app_whatsapp",
        profile: "iphone16",
      } as never,
      ir: { id: "test", devices: [], timeline: [] } as never,
      baseState: createWhatsAppInitialState(),
      snapshot: {
        appId: "app_whatsapp",
        deviceId: "phone",
        snapshotVersion: 1,
        snapshot: {
          conversations: [
            {
              id: "launch",
              name: "Launch Room",
              type: "group",
              members: [
                { id: "me", name: "You" },
                { id: "ava", name: "Ava" },
                { id: "noor", name: "Noor" },
              ],
            },
          ],
        },
      },
    });

    const conversation = (state as WhatsAppState).conversations?.launch as {
      members?: Array<{ id: string; name: string }>;
    };
    expect(conversation.members).toEqual([
      { id: "me", name: "You" },
      { id: "ava", name: "Ava" },
      { id: "noor", name: "Noor" },
    ]);
  });
});
