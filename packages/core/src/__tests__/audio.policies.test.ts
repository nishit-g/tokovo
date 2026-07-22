import { describe, expect, it } from "vitest";
import type { SoundCue } from "../types.js";
import {
  DEFAULT_POLICY_CONFIG,
  checkSpamPure,
  cleanupRecentSounds,
  enforceBusConcurrency,
  getDefaultPriority,
  sortByPriority,
  shouldInterrupt,
  checkAllPoliciesPure,
} from "../audio/policies.js";

describe("audio policies", () => {
  it("checks spam with pure function", () => {
    const first = checkSpamPure("ding", 10, {});
    expect(first.shouldPlay).toBe(true);

    const second = checkSpamPure("ding", 12, { ding: 10 }, DEFAULT_POLICY_CONFIG);
    expect(second.shouldPlay).toBe(false);
    expect(second.alternateSound).toBe("ding_soft");

    const third = checkSpamPure("ding", 30, { ding: 10 }, DEFAULT_POLICY_CONFIG);
    expect(third.shouldPlay).toBe(true);
  });

  it("cleans up old recent sounds", () => {
    const cleaned = cleanupRecentSounds({ a: 1, b: 100 }, 200, 50);
    expect(cleaned).toEqual({});
  });

  it("retains recent sounds within max age", () => {
    const cleaned = cleanupRecentSounds({ a: 10, b: 40 }, 50, 30);
    expect(cleaned).toEqual({ b: 40 });
  });

  it("enforces concurrency limits", () => {
    const cue = { soundId: "a", bus: "sfx", priority: 5 } as SoundCue;
    const active = [{ soundId: "b", bus: "sfx", priority: 1 } as SoundCue];

    expect(enforceBusConcurrency(cue, [], 2).shouldAdd).toBe(true);
    const result = enforceBusConcurrency(cue, active, 1);
    expect(result.shouldAdd).toBe(true);
    expect(result.toRemove).toEqual(["b"]);

    const lower = enforceBusConcurrency({ ...cue, priority: 0 }, active, 1);
    expect(lower.shouldAdd).toBe(false);
  });

  it("handles priority helpers", () => {
    expect(getDefaultPriority("ui")).toBeGreaterThan(0);
    expect(() => getDefaultPriority("custom" as any)).toThrow("AUDIO_BUS_UNREGISTERED");
    const sorted = sortByPriority([
      { soundId: "a", bus: "sfx", priority: 1 } as SoundCue,
      { soundId: "b", bus: "sfx", priority: 10 } as SoundCue,
    ]);
    expect(sorted[0].soundId).toBe("b");

    expect(
      shouldInterrupt(
        { soundId: "a", bus: "sfx", priority: 1 } as SoundCue,
        { soundId: "b", bus: "voice", priority: 1 } as SoundCue,
      ),
    ).toBe(true);
    expect(
      shouldInterrupt(
        { soundId: "a", bus: "sfx", priority: 10 } as SoundCue,
        { soundId: "b", bus: "sfx", priority: 1 } as SoundCue,
      ),
    ).toBe(false);

    expect(
      shouldInterrupt(
        { soundId: "a", bus: "sfx", priority: 1 } as SoundCue,
        { soundId: "b", bus: "sfx", priority: 5 } as SoundCue,
      ),
    ).toBe(true);
  });

  it("runs combined policies (pure)", () => {
    const cue = { soundId: "ding", bus: "ui", priority: 1 } as SoundCue;

    const softened = checkAllPoliciesPure(cue, 1, [], { ding: 0 }, DEFAULT_POLICY_CONFIG);
    expect(softened.shouldPlay).toBe(true);
    expect(softened.soundId).toBe("ding_soft");

    const dropped = checkAllPoliciesPure(
      cue,
      1,
      [],
      { ding: 0 },
      { ...DEFAULT_POLICY_CONFIG, softVariant: undefined },
    );
    expect(dropped.shouldPlay).toBe(true);
    expect(dropped.reason).toBe("spam_softened");
    expect(dropped.soundId).toBe("ding_soft");

    const limited = checkAllPoliciesPure(
      cue,
      100,
      [{ ...cue, priority: 2 } as SoundCue],
      {},
      {
        ...DEFAULT_POLICY_CONFIG,
        maxConcurrentPerBus: { ui: 1, sfx: 1, music: 1, voice: 1, master: 1 },
      },
    );
    expect(limited.shouldPlay).toBe(false);
    expect(limited.reason).toBe("concurrency_limit");

    expect(() =>
      checkAllPoliciesPure({ ...cue, bus: "custom" as any }, 100, [], {}, DEFAULT_POLICY_CONFIG),
    ).toThrow("AUDIO_BUS_UNREGISTERED");
  });

  it("drops spam when no alternate sound is available (forced)", () => {
    const cue = { soundId: "ding", bus: "ui", priority: 1 } as SoundCue;
    const result = checkAllPoliciesPure(
      cue,
      1,
      [],
      { ding: 0 },
      { ...DEFAULT_POLICY_CONFIG, softVariant: null },
    );
    expect(result.shouldPlay).toBe(false);
    expect(result.reason).toBe("spam_dropped");
  });
});
