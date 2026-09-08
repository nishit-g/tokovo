import { describe, expect, it } from "vitest";
import {
  createCastScript,
  createCharacterScript,
  createCharacterUtterance,
  defineBlurbCharacter,
  MINT_SPRITE_CHARACTER,
  PING_COURIER_CHARACTER,
  TEAL_MANAGER_CHARACTER,
  VIOLET_FOUNDER_CHARACTER,
} from "./character.js";
import { generateBlurbScript } from "./synthesis.js";

describe("reusable blurb characters", () => {
  it("keeps identity fixed while message and tone direct performance", () => {
    const excited = createCharacterUtterance(MINT_SPRITE_CHARACTER, {
      id: "done",
      message: "Done!",
      act: "confirm",
      tone: "excited",
      context: { stakes: 0.3, audience: "private" },
    });
    const worried = createCharacterUtterance(MINT_SPRITE_CHARACTER, {
      id: "everyone",
      message: "Wait, did that go to everyone?",
      act: "realize",
      tone: "confused",
      context: { stakes: 0.9, audience: "public" },
    });

    expect(excited.performer).toBe("mint");
    expect(worried.performer).toBe("mint");
    expect(excited.emotion).toBe("excited");
    expect(worried.emotion).toBe("confused");
    expect(worried.intensity).toBeGreaterThan(excited.intensity ?? 0);
    expect(worried.lexemes).not.toEqual(excited.lexemes);
  });

  it("resolves the same line deterministically", () => {
    const line = {
      id: "repeatable",
      message: "I scheduled it.",
      act: "confirm" as const,
      tone: "excited" as const,
    };

    expect(createCharacterUtterance(MINT_SPRITE_CHARACTER, line)).toEqual(
      createCharacterUtterance(MINT_SPRITE_CHARACTER, line),
    );
  });

  it("keeps Ping recognizable while delivery confidence turns into doubt", () => {
    const delivered = createCharacterUtterance(PING_COURIER_CHARACTER, {
      id: "delivered",
      message: "Delivered.",
      act: "confirm",
      tone: "excited",
      context: { stakes: 0.2, audience: "group" },
    });
    const where = createCharacterUtterance(PING_COURIER_CHARACTER, {
      id: "where",
      message: "Wait, where did I send it?",
      act: "realize",
      tone: "confused",
      context: { stakes: 0.9, audience: "public" },
    });

    expect(delivered.performer).toBe("ping");
    expect(where.performer).toBe("ping");
    expect(where.intensity).toBeGreaterThan(delivered.intensity ?? 0);
    expect(delivered.lexemes).not.toEqual(where.lexemes);
  });

  it("creates a reusable script that renders through the normal engine", () => {
    const script = createCharacterScript("mint-reuse-proof", MINT_SPRITE_CHARACTER, [
      {
        id: "one",
        message: "Done!",
        act: "confirm",
      },
      {
        id: "two",
        message: "That went to everyone?",
        act: "realize",
        context: { stakes: 0.9, audience: "group" },
      },
      {
        id: "three",
        message: "I used the wrong draft.",
        act: "confess",
        tone: "sad",
      },
    ]);
    const result = generateBlurbScript(script);

    expect(Object.keys(script.voices)).toEqual(["mint"]);
    expect(result.manifest.segments).toHaveLength(3);
    expect(new Set(result.manifest.segments.map((segment) => segment.performer))).toEqual(
      new Set(["mint"]),
    );
  });

  it("rejects character-language words outside the stable voice inventory", () => {
    expect(() =>
      defineBlurbCharacter({
        ...MINT_SPRITE_CHARACTER,
        id: "broken",
        language: {
          phrases: {
            confirm: [["foreign-word"]],
          },
        },
      }),
    ).toThrow(/unknown lexeme/);
  });

  it("builds a deterministic multi-character script with distinct voices", () => {
    const script = createCastScript(
      "ensemble-proof",
      [MINT_SPRITE_CHARACTER, TEAL_MANAGER_CHARACTER, VIOLET_FOUNDER_CHARACTER],
      [
        {
          id: "mint-confession",
          characterId: "mint",
          message: "It went company-wide.",
          act: "confess",
          tone: "panic",
        },
        {
          id: "teal-question",
          characterId: "teal",
          message: "Why is Legal reacting?",
          act: "question",
          tone: "annoyed",
        },
        {
          id: "violet-verdict",
          characterId: "violet",
          message: "Rename the file.",
          act: "verdict",
        },
      ],
    );
    const result = generateBlurbScript(script);

    expect(Object.keys(script.voices)).toEqual(["mint", "teal", "violet"]);
    expect(result.manifest.segments.map((segment) => segment.performer)).toEqual([
      "mint",
      "teal",
      "violet",
    ]);
    expect(
      new Set(result.manifest.segments.map((segment) => segment.syllables.join("-"))).size,
    ).toBe(3);
  });

  it("rejects cast lines for undeclared characters", () => {
    expect(() =>
      createCastScript(
        "broken-cast",
        [MINT_SPRITE_CHARACTER],
        [
          {
            id: "missing",
            characterId: "violet",
            message: "No.",
            act: "verdict",
          },
        ],
      ),
    ).toThrow(/unknown character/);
  });
});
