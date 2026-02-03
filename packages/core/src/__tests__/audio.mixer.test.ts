import { describe, expect, it, vi } from "vitest";
import type { AudioState, SoundCue } from "../types";
import { DEFAULT_BUS_CONFIG } from "../types/audio";
import {
  applyEnvelope,
  computeBusDuckMultiplier,
  computeBusStates,
  computeSoundVolume,
  createSoundCue,
  createUISoundCue,
  createVoiceSoundCue,
} from "../audio/mixer";

describe("audio mixer", () => {
  it("applies envelope attack and release", () => {
    const cue: SoundCue = {
      soundId: "tone",
      startFrame: 0,
      volume: 1,
      bus: "sfx",
      priority: 1,
      duration: 10,
      envelope: { attack: 4, release: 2, curve: "linear" },
    };

    expect(applyEnvelope(cue, 2)).toBeCloseTo(0.5, 4);
    expect(applyEnvelope(cue, 9)).toBeCloseTo(0.5, 4);
    expect(applyEnvelope({ ...cue, envelope: undefined }, 2)).toBe(1);
  });

  it("supports easeIn/easeOut curves", () => {
    const base: SoundCue = {
      soundId: "tone",
      startFrame: 0,
      volume: 1,
      bus: "sfx",
      priority: 1,
      duration: 10,
    };

    const easeIn = applyEnvelope(
      { ...base, envelope: { attack: 4, release: 0, curve: "easeIn" } },
      2,
    );
    const easeOut = applyEnvelope(
      { ...base, envelope: { attack: 4, release: 0, curve: "easeOut" } },
      2,
    );

    expect(easeIn).toBeLessThan(easeOut);
  });

  it("handles envelopes without duration", () => {
    const cue: SoundCue = {
      soundId: "tone",
      startFrame: 0,
      volume: 1,
      bus: "sfx",
      priority: 1,
      envelope: { attack: 4, release: 2, curve: "linear" },
    };

    expect(applyEnvelope(cue, 2)).toBeCloseTo(0.5, 4);
  });

  it("computes duck multiplier with attack and release", () => {
    const cue: SoundCue = {
      soundId: "ui",
      startFrame: 0,
      volume: 1,
      bus: "ui",
      priority: 1,
      duration: 10,
      duck: { targetBus: "music", amount: 0.5, attack: 2, release: 2 },
    };

    expect(computeBusDuckMultiplier("music", 1, [cue])).toBeCloseTo(0.75, 4);
    expect(computeBusDuckMultiplier("music", 11, [cue])).toBeGreaterThan(0.5);
    expect(computeBusDuckMultiplier("music", 12, [cue])).toBe(1);
    expect(computeBusDuckMultiplier("music", 20, [cue])).toBe(1);
    expect(computeBusDuckMultiplier("music", 1, [])).toBe(1);
  });

  it("handles duckers without duration", () => {
    const cue: SoundCue = {
      soundId: "ui",
      startFrame: 0,
      volume: 1,
      bus: "ui",
      priority: 1,
      duck: { targetBus: "music", amount: 0.5, attack: 0, release: 0 },
    };

    expect(computeBusDuckMultiplier("music", 5, [cue])).toBe(0.5);

    const audioState: AudioState = {
      activeSounds: { duck: cue },
      buses: { ...DEFAULT_BUS_CONFIG },
      policyState: { recentSounds: {}, nextId: 0 },
      autoSoundRules: [],
    };
    const states = computeBusStates(audioState, 5);
    expect(states.music.duckMultiplier).toBe(0.5);
  });

  it("ignores non-matching duckers", () => {
    const cue: SoundCue = {
      soundId: "ui",
      startFrame: 0,
      volume: 1,
      bus: "ui",
      priority: 1,
    };
    const ducker: SoundCue = {
      soundId: "duck",
      startFrame: 0,
      volume: 1,
      bus: "ui",
      priority: 1,
      duration: 10,
      duck: { targetBus: "sfx", amount: 0.5, attack: 0, release: 0 },
    };

    expect(computeBusDuckMultiplier("music", 1, [cue, ducker])).toBe(1);
  });

  it("computes bus states and sound volume", () => {
    const audioState: AudioState = {
      activeSounds: {},
      buses: { ...DEFAULT_BUS_CONFIG },
      policyState: { recentSounds: {}, nextId: 0 },
      autoSoundRules: [],
    };

    const cue: SoundCue = {
      soundId: "sfx",
      startFrame: 0,
      volume: 1,
      bus: "sfx",
      priority: 1,
      fadeTarget: 0,
      fadeStartFrame: 0,
      fadeDuration: 10,
    };

    audioState.activeSounds["id"] = cue;

    const busStates = computeBusStates(audioState, 5);
    const volume = computeSoundVolume(cue, 5, busStates);
    expect(volume).toBeCloseTo(0.4, 4);

    const duckCue: SoundCue = {
      soundId: "duck",
      startFrame: 0,
      volume: 1,
      bus: "ui",
      priority: 1,
      duration: 10,
      duck: { targetBus: "music", amount: 0.5, attack: 1, release: 1 },
    };
    audioState.activeSounds["duck"] = duckCue;
    const duckStates = computeBusStates(audioState, 1);
    expect(duckStates.music.duckMultiplier).toBeLessThan(1);

    const loud = computeSoundVolume(
      { ...cue, volume: 2, fadeDuration: undefined },
      0,
      busStates,
    );
    expect(loud).toBe(1);

    const fallbackVolume = computeSoundVolume(
      { ...cue, bus: "unknown" as any },
      0,
      busStates,
    );
    expect(fallbackVolume).toBeGreaterThan(0);
  });

  it("applies duck attack and release when computing bus states", () => {
    const audioState: AudioState = {
      activeSounds: {},
      buses: { ...DEFAULT_BUS_CONFIG },
      policyState: { recentSounds: {}, nextId: 0 },
      autoSoundRules: [],
    };

    audioState.activeSounds["duck"] = {
      soundId: "duck",
      startFrame: 0,
      volume: 1,
      bus: "ui",
      priority: 1,
      duration: 10,
      duck: { targetBus: "music", amount: 0.5, attack: 4, release: 4 },
    } as SoundCue;

    const attackStates = computeBusStates(audioState, 2);
    expect(attackStates.music.duckMultiplier).toBeCloseTo(0.75, 4);

    const releaseStates = computeBusStates(audioState, 12);
    expect(releaseStates.music.duckMultiplier).toBeCloseTo(0.75, 4);
  });

  it("ignores duckers outside their active window", () => {
    const audioState: AudioState = {
      activeSounds: {},
      buses: { ...DEFAULT_BUS_CONFIG },
      policyState: { recentSounds: {}, nextId: 0 },
      autoSoundRules: [],
    };

    audioState.activeSounds["duck"] = {
      soundId: "duck",
      startFrame: 0,
      volume: 1,
      bus: "ui",
      priority: 1,
      duration: 10,
      duck: { targetBus: "music", amount: 0.5, attack: 2, release: 2 },
    } as SoundCue;

    const states = computeBusStates(audioState, 20);
    expect(states.music.duckMultiplier).toBe(1);
  });

  it("creates sound cues with validation and defaults", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

    const cue = createSoundCue("sound", 0, { volume: 2, duration: -1 });
    expect(cue.volume).toBe(1);
    expect(cue.duration).toBeUndefined();

    const nanCue = createSoundCue("sound", 0, { volume: Number.NaN });
    expect(nanCue.volume).toBe(0);

    const valid = createSoundCue("sound", 0, { volume: 0.5, duration: 10 });
    expect(valid.volume).toBe(0.5);
    expect(valid.duration).toBe(10);

    const uiCue = createUISoundCue("ui", 0);
    expect(uiCue.bus).toBe("ui");
    expect(uiCue.duck?.targetBus).toBe("music");

    const voiceCue = createVoiceSoundCue("voice", 0);
    expect(voiceCue.bus).toBe("voice");
    expect(voiceCue.duck?.amount).toBe(0.15);

    warn.mockRestore();
  });
});
