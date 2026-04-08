import { describe, expect, it } from "vitest";
import { whatsappV2Lowering } from "../lowering/v2/handler.js";

describe("whatsappV2Lowering keyboard flow", () => {
  it("still expands typed sends when a helper event exists on the same frame", () => {
    const ctx = { pluginLowerers: new Map(), fps: 30 };
    const received = {
      at: 120,
      kind: "APP",
      appId: "app_whatsapp",
      type: "MESSAGE_RECEIVED",
      deviceId: "phone",
      conversationId: "dm_kabir",
      payload: {
        conversationId: "dm_kabir",
        from: "kabir",
        text: "bhai uth",
      },
    } as const;

    const typingEnd = {
      at: 180,
      kind: "APP",
      appId: "app_whatsapp",
      type: "TYPING_END",
      deviceId: "phone",
      conversationId: "dm_kabir",
      payload: {
        conversationId: "dm_kabir",
        actor: "me",
      },
    } as const;

    const sent = {
      at: 180,
      kind: "APP",
      appId: "app_whatsapp",
      type: "MESSAGE_SENT",
      deviceId: "phone",
      conversationId: "dm_kabir",
      payload: {
        conversationId: "dm_kabir",
        text: "subah 7 baje kaunsi emergency hoti hai be",
        typed: true,
        charDelay: 3,
      },
    } as const;

    whatsappV2Lowering.lower(received as never, ctx);
    whatsappV2Lowering.lower(typingEnd as never, ctx);
    const lowered = whatsappV2Lowering.lower(sent as never, ctx);

    expect(lowered.map((event) => event.type)).toEqual([
      "KEYBOARD_SHOW",
      "KEYBOARD_TYPE",
      "KEYBOARD_KEY_PRESS",
      "MESSAGE_SENT",
      "KEYBOARD_CLEAR",
      "KEYBOARD_HIDE",
    ]);
    expect(lowered[0]?.at).toBeLessThan(sent.at);
    expect(lowered[1]?.at).toBeLessThan(sent.at);
  });
});
