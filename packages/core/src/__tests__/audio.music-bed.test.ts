import { describe, expect, it } from "vitest";
import type { MusicBed } from "../types/audio";
import {
  computeCrossfade,
  createMusicBed,
  createTenseMusicBed,
  createDramaticMusicBed,
  createCalmMusicBed,
  getMusicByMood,
  suggestMood,
} from "../audio/music-bed";

describe("music bed helpers", () => {
  it("computes crossfade when only incoming is present", () => {
    const incoming: MusicBed = {
      id: "in",
      soundId: "track",
      startFrame: 0,
      loop: true,
      baseGain: 1,
      crossfadeFrames: 10,
      crossfadeCurve: "linear",
    };

    const result = computeCrossfade(undefined, incoming, 5);
    expect(result.outVolume).toBe(0);
    expect(result.inVolume).toBeCloseTo(0.5, 4);
  });

  it("applies easing curves during crossfade", () => {
    const easeInBed: MusicBed = {
      id: "in-ease-in",
      soundId: "track",
      startFrame: 0,
      loop: true,
      baseGain: 1,
      crossfadeFrames: 10,
      crossfadeCurve: "easeIn",
    };
    const easeOutBed: MusicBed = {
      id: "in-ease-out",
      soundId: "track",
      startFrame: 0,
      loop: true,
      baseGain: 1,
      crossfadeFrames: 10,
      crossfadeCurve: "easeOut",
    };

    const easeInResult = computeCrossfade(undefined, easeInBed, 5);
    const easeOutResult = computeCrossfade(undefined, easeOutBed, 5);

    expect(easeInResult.inVolume).toBeCloseTo(0.25, 4);
    expect(easeOutResult.inVolume).toBeCloseTo(0.75, 4);
  });

  it("uses easeInOut by default for crossfades", () => {
    const incoming = createMusicBed("song", 0);
    const result = computeCrossfade(undefined, incoming, 15);
    expect(result.inVolume).toBeCloseTo(0.175, 3);
  });

  it("uses default crossfade frames when not provided", () => {
    const incoming: MusicBed = {
      id: "in",
      soundId: "track",
      startFrame: 0,
      loop: true,
      baseGain: 1,
      crossfadeCurve: "linear",
    };

    const result = computeCrossfade(undefined, incoming, 30);
    expect(result.inVolume).toBeCloseTo(1, 4);
  });

  it("computes crossfade when only outgoing is present", () => {
    const outgoing: MusicBed = {
      id: "out",
      soundId: "track",
      startFrame: 0,
      loop: true,
      baseGain: 1,
      fadeOutStart: 10,
      fadeOutDuration: 10,
      crossfadeFrames: 10,
      crossfadeCurve: "linear",
    };

    const result = computeCrossfade(outgoing, undefined, 15);
    expect(result.inVolume).toBe(0);
    expect(result.outVolume).toBeCloseTo(0.5, 4);
  });

  it("keeps volume when outgoing has no fade configuration", () => {
    const outgoing: MusicBed = {
      id: "out",
      soundId: "track",
      startFrame: 0,
      loop: true,
      baseGain: 0.8,
      crossfadeFrames: 10,
      crossfadeCurve: "linear",
    };

    const result = computeCrossfade(outgoing, undefined, 5);
    expect(result.outVolume).toBe(0.8);
    expect(result.inVolume).toBe(0);
  });

  it("computes crossfade with both outgoing and incoming", () => {
    const outgoing: MusicBed = {
      id: "out",
      soundId: "old",
      startFrame: 0,
      loop: true,
      baseGain: 1,
      crossfadeFrames: 10,
      crossfadeCurve: "linear",
    };
    const incoming: MusicBed = {
      id: "in",
      soundId: "new",
      startFrame: 0,
      loop: true,
      baseGain: 0.5,
      crossfadeFrames: 10,
      crossfadeCurve: "linear",
    };

    const result = computeCrossfade(outgoing, incoming, 5);
    expect(result.outVolume).toBeCloseTo(0.5, 4);
    expect(result.inVolume).toBeCloseTo(0.25, 4);
  });

  it("falls back to default crossfade duration for mixed beds", () => {
    const outgoing: MusicBed = {
      id: "out",
      soundId: "old",
      startFrame: 0,
      loop: true,
      baseGain: 1,
      crossfadeCurve: "linear",
    };
    const incoming: MusicBed = {
      id: "in",
      soundId: "new",
      startFrame: 0,
      loop: true,
      baseGain: 1,
      crossfadeCurve: "linear",
    };

    const result = computeCrossfade(outgoing, incoming, 30);
    expect(result.inVolume).toBeCloseTo(1, 4);
  });

  it("applies outgoing fade-out during crossfade", () => {
    const outgoing: MusicBed = {
      id: "out",
      soundId: "old",
      startFrame: 0,
      loop: true,
      baseGain: 1,
      crossfadeFrames: 10,
      crossfadeCurve: "linear",
      fadeOutStart: 0,
      fadeOutDuration: 10,
    };
    const incoming: MusicBed = {
      id: "in",
      soundId: "new",
      startFrame: 0,
      loop: true,
      baseGain: 1,
      crossfadeFrames: 10,
      crossfadeCurve: "linear",
    };

    const result = computeCrossfade(outgoing, incoming, 5);
    expect(result.outVolume).toBeLessThan(0.5);
  });

  it("returns empty crossfade when no beds", () => {
    expect(computeCrossfade(undefined, undefined, 0)).toEqual({
      outVolume: 0,
      inVolume: 0,
    });
  });

  it("creates presets and selects mood", () => {
    const bed = createMusicBed("song", 10, { baseGain: 0.2 });
    expect(bed.baseGain).toBe(0.2);

    const defaultBed = createMusicBed("default", 0);
    expect(defaultBed.baseGain).toBe(0.35);
    expect(defaultBed.crossfadeFrames).toBe(30);

    expect(createTenseMusicBed("tense", 1).moodTag).toBe("tense");
    expect(createDramaticMusicBed("dramatic", 1).moodTag).toBe("dramatic");
    expect(createCalmMusicBed("calm", 1).moodTag).toBe("calm");

    const library = [
      createTenseMusicBed("tense", 1),
      createCalmMusicBed("calm", 1),
    ];
    expect(getMusicByMood("tense", library)?.soundId).toBe("tense");
    expect(getMusicByMood("dramatic", library)).toBeUndefined();
  });

  it("suggests moods from signals", () => {
    expect(
      suggestMood({ messageRate: 0.1, typingDuration: 10, hasConflict: true }),
    ).toBe("dramatic");
    expect(
      suggestMood({ messageRate: 3, typingDuration: 10, hasConflict: false }),
    ).toBe("chaotic");
    expect(
      suggestMood({ messageRate: 1, typingDuration: 70, hasConflict: false }),
    ).toBe("tense");
    expect(
      suggestMood({ messageRate: 1, typingDuration: 10, hasConflict: false }),
    ).toBe("calm");
  });
});
