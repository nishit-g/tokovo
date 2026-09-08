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

  it("does not synthesize remote typing sounds alongside local input cues", () => {
    const typingRules = whatsappAudioRules.filter((rule) =>
      String(rule.match.type).startsWith("TYPING_"),
    );
    expect(typingRules).toHaveLength(0);
  });
});
