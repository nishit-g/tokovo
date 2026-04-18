import { describe, expect, it } from "vitest";
import {
  buildProviderAttemptOrder,
  computeVoiceArtifactKey,
} from "../providers/types.js";

describe("voice provider planning", () => {
  it("builds a deduplicated provider fallback order", () => {
    const order = buildProviderAttemptOrder({
      provider: "gemini",
      model: "gemini-3.1-flash-tts-preview",
      voiceId: "hero",
      fallbackChain: [
        {
          provider: "elevenlabs",
          model: "eleven_v3",
          voiceId: "hero-alt",
        },
        {
          provider: "gemini",
          model: "gemini-3.1-flash-tts-preview",
          voiceId: "hero",
        },
      ],
    });

    expect(order.map((entry) => entry.provider)).toEqual([
      "gemini",
      "elevenlabs",
    ]);
  });

  it("keys artifacts by provider, model, voice, and content hash", () => {
    const key = computeVoiceArtifactKey({
      contentHash: "abc123",
      provider: "gemini",
      model: "gemini-3.1-flash-tts-preview",
      voiceId: "hero",
    });

    expect(key).toContain("abc123");
    expect(key).toContain("gemini");
    expect(key).toContain("hero");
  });
});
