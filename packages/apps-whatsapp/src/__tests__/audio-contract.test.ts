import { describe, expect, it } from "vitest";

import { whatsappAudioRules } from "../assets/audio-rules.js";
import { WhatsAppPluginV2 } from "../plugin.js";

describe("WhatsApp audio contract", () => {
  it("targets only registered canonical APP events", () => {
    const eventTypes = new Set(WhatsAppPluginV2.eventKinds ?? []);
    for (const rule of whatsappAudioRules) {
      expect(rule.match.kind).toBe("APP");
      expect(rule.match.appId).toBe("app_whatsapp");
      expect(eventTypes.has(rule.match.type as never)).toBe(true);
    }
  });

  it("uses payload fields in deterministic typing loop IDs", () => {
    const typingRules = whatsappAudioRules.filter((rule) =>
      String(rule.match.type).startsWith("TYPING_"),
    );
    expect(typingRules).toHaveLength(2);
    expect(typingRules.map((rule) => rule.idTemplate ?? rule.stopId)).toEqual([
      "typing_{conversationId}_{actor}",
      "typing_{conversationId}_{actor}",
    ]);
  });
});
