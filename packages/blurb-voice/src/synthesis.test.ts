import { describe, expect, it } from "vitest";
import { TOKOVO_CAST_VOICES } from "./presets.js";
import { generateBlurbScript } from "./synthesis.js";
import type { BlurbScript } from "./types.js";

const SCRIPT: BlurbScript = {
  id: "determinism-proof",
  voices: {
    coral: TOKOVO_CAST_VOICES["coral-intern"],
  },
  utterances: [
    {
      id: "caught",
      performer: "coral",
      text: "Wait, that file went live?",
      emotion: "panic",
      intensity: 0.82,
      length: "short",
    },
  ],
};

describe("generateBlurbScript", () => {
  it("generates byte-stable PCM, WAV, and manifests", () => {
    const first = generateBlurbScript(SCRIPT);
    const second = generateBlurbScript(SCRIPT);

    expect(first.pcm).toEqual(second.pcm);
    expect(first.wav).toEqual(second.wav);
    expect(first.manifest).toEqual(second.manifest);
  });

  it("writes a valid 48 kHz mono PCM16 WAV", () => {
    const result = generateBlurbScript(SCRIPT);
    const view = new DataView(result.wav.buffer, result.wav.byteOffset, result.wav.byteLength);
    const text = (offset: number, length: number) =>
      String.fromCharCode(...result.wav.slice(offset, offset + length));

    expect(text(0, 4)).toBe("RIFF");
    expect(text(8, 4)).toBe("WAVE");
    expect(view.getUint16(22, true)).toBe(1);
    expect(view.getUint32(24, true)).toBe(48_000);
    expect(view.getUint16(34, true)).toBe(16);
    expect(view.getUint32(40, true)).toBe(result.pcm.length * 2);
    expect(result.manifest.model).toBe("tokovo-blurb-v2");
    expect(result.manifest.generatedAt).toBe("1970-01-01T00:00:00.000Z");
    expect(result.manifest.segments[0].speaker).toBe("coral");
  });

  it("emits timing and mouth animation data for every utterance", () => {
    const result = generateBlurbScript(SCRIPT);
    const segment = result.manifest.segments[0];

    expect(segment.id).toBe("caught");
    expect(segment.durationMs).toBeGreaterThan(100);
    expect(segment.endSample - segment.startSample).toBeGreaterThan(0);
    expect(segment.syllables.length).toBeGreaterThanOrEqual(3);
    expect(segment.analysis.frameRate).toBe(60);
    expect(segment.analysis.energy.length).toBe(segment.analysis.mouth.length);
    expect(segment.analysis.mouth).toContain("wide");
  });

  it("changes the waveform when performance direction changes", () => {
    const angry = generateBlurbScript({
      ...SCRIPT,
      utterances: [{ ...SCRIPT.utterances[0], emotion: "angry" }],
    });
    const sad = generateBlurbScript({
      ...SCRIPT,
      utterances: [{ ...SCRIPT.utterances[0], emotion: "sad" }],
    });

    expect(angry.manifest.contentHash).not.toBe(sad.manifest.contentHash);
    expect(angry.manifest.durationMs).toBeLessThan(sad.manifest.durationMs);
  });

  it("gives every cast performer a distinct acoustic fingerprint", () => {
    const hashes = Object.entries(TOKOVO_CAST_VOICES).map(
      ([performer, voice]) =>
        generateBlurbScript({
          id: "cast-identity-proof",
          voices: { [performer]: voice },
          utterances: [
            {
              id: "same-intent",
              performer,
              text: "Did everyone see that?",
              emotion: "confused",
              intensity: 0.65,
              length: "short",
            },
          ],
        }).manifest.contentHash,
    );

    expect(new Set(hashes).size).toBe(Object.keys(TOKOVO_CAST_VOICES).length);
  });

  it("makes organic articulation connected and acoustically distinct", () => {
    const organic = generateBlurbScript(SCRIPT);
    const baseVoice = TOKOVO_CAST_VOICES["coral-intern"];
    const mechanical = generateBlurbScript({
      ...SCRIPT,
      voices: {
        coral: {
          ...baseVoice,
          signature: {
            ...baseVoice.signature,
            coarticulation: 0,
            vowelDrift: 0,
            microVariation: 0,
          },
        },
      },
    });

    expect(organic.manifest.contentHash).not.toBe(mechanical.manifest.contentHash);
    expect(organic.manifest.durationMs).toBeLessThan(mechanical.manifest.durationMs);
  });

  it("preserves authored recurring character-language lexemes", () => {
    const result = generateBlurbScript({
      id: "mint-language-proof",
      voices: {
        mint: TOKOVO_CAST_VOICES["mint-sprite"],
      },
      utterances: [
        {
          id: "confirmation",
          performer: "mint",
          text: "Done!",
          intent: "eager-confirmation",
          lexemes: ["mibi", "mibi"],
        },
      ],
    });

    expect(result.manifest.segments[0].syllables).toEqual(["mibi", "mibi"]);
    expect(result.manifest.segments[0].emotion).toBe("excited");
  });

  it("rejects lexemes that do not belong to the performer", () => {
    expect(() =>
      generateBlurbScript({
        id: "invalid-language",
        voices: {
          mint: TOKOVO_CAST_VOICES["mint-sprite"],
        },
        utterances: [
          {
            id: "foreign-word",
            performer: "mint",
            text: "No.",
            lexemes: ["not-in-the-language"],
          },
        ],
      }),
    ).toThrow(/outside voice/);
  });

  it("uses punctuation as performance direction", () => {
    const question = generateBlurbScript({
      ...SCRIPT,
      utterances: [{ ...SCRIPT.utterances[0], text: "You sent it?" }],
    });
    const statement = generateBlurbScript({
      ...SCRIPT,
      utterances: [{ ...SCRIPT.utterances[0], text: "You sent it." }],
    });

    expect(question.manifest.contentHash).not.toBe(statement.manifest.contentHash);
  });

  it("limits mouth pose changes to one step per analysis frame", () => {
    const result = generateBlurbScript(SCRIPT);
    const levels = ["closed", "small", "medium", "wide"];
    const mouth = result.manifest.segments[0].analysis.mouth;

    for (let index = 1; index < mouth.length; index += 1) {
      const step = Math.abs(levels.indexOf(mouth[index]) - levels.indexOf(mouth[index - 1]));
      expect(step).toBeLessThanOrEqual(1);
    }
  });

  it("fails loudly when a performer voice is missing", () => {
    expect(() =>
      generateBlurbScript({
        ...SCRIPT,
        voices: {},
      }),
    ).toThrow(/Unknown performer/);
  });
});
