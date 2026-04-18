import { describe, expect, it } from "vitest";
import { createMockTTSProvider } from "../providers/index.js";

describe("mock TTS provider", () => {
  it("generates deterministic wav dialogue with alignment", async () => {
    const provider = createMockTTSProvider({
      name: "demo-mock",
      voiceDurationMs: 320,
    });

    const result = await provider.generateDialogue({
      model: "mock-v1",
      outputFormat: "wav",
      inputs: [
        { text: "[shocked] Bro this is wild.", voiceId: "hero" },
        { text: "[deadpan] It gets worse.", voiceId: "guest" },
      ],
    });

    expect(result.audioBuffer.subarray(0, 4).toString("ascii")).toBe("RIFF");
    expect(result.audioBuffer.subarray(8, 12).toString("ascii")).toBe("WAVE");
    expect(result.segments).toHaveLength(2);
    expect(result.segments[0]?.voiceId).toBe("hero");
    expect(result.alignment?.characters.join("")).toContain("Bro this is wild.");
  });
});
