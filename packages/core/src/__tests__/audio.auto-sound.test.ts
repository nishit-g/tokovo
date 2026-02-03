import { describe, expect, it } from "vitest";
import type { TimelineEvent } from "../types";
import { deriveAudioInstructions, AutoSoundRule, AutoSoundRegistry } from "../audio/auto-sound";

const baseEvent: TimelineEvent = {
  at: 10,
  kind: "APP",
  type: "MESSAGE_RECEIVED",
  appId: "app.test",
  from: "alice",
  deviceId: "device-1",
  conversationId: "conv-1",
  payload: {
    text: "hello",
    count: 4,
  },
} as TimelineEvent;

describe("deriveAudioInstructions", () => {
  it("creates play instructions with numeric and string-derived durations", () => {
    const rules: AutoSoundRule[] = [
      {
        match: {
          kind: "APP",
          type: "MESSAGE_RECEIVED",
          appId: "app.test",
          from: "alice",
        },
        action: "PLAY_ONE_SHOT",
        sound: "ding",
        bus: "ui",
        volume: 0.5,
        durationFrom: { key: "payload.count", factor: 2, min: 1 },
      },
      {
        match: {
          kind: "APP",
          type: "MESSAGE_RECEIVED",
          appId: "app.test",
          from: "alice",
        },
        action: "PLAY_ONE_SHOT",
        sound: "typing",
        durationFrom: { key: "payload.text", factor: 1, min: 1 },
      },
    ];

    const instructions = deriveAudioInstructions(baseEvent, rules);
    expect(instructions).toHaveLength(2);

    const [first, second] = instructions;
    expect(first.cue?.bus).toBe("ui");
    expect(first.cue?.volume).toBe(0.5);
    expect(first.cue?.duration).toBe(8);
    expect(first.cue?.deviceId).toBe("device-1");

    expect(second.cue?.duration).toBe(5);
  });

  it("uses default duration factors when optional values are missing", () => {
    const rules: AutoSoundRule[] = [
      {
        match: { kind: "APP", from: "alice" },
        action: "PLAY_ONE_SHOT",
        sound: "ding",
        durationFrom: { key: "payload.count" },
      },
      {
        match: { kind: "APP", from: "alice" },
        action: "PLAY_ONE_SHOT",
        sound: "typing",
        durationFrom: { key: "payload.text" },
      },
    ];

    const instructions = deriveAudioInstructions(baseEvent, rules);
    expect(instructions[0].cue?.duration).toBe(4);
    expect(instructions[1].cue?.duration).toBe(5);
  });

  it("derives stop instructions using templates", () => {
    const rules: AutoSoundRule[] = [
      {
        match: {
          kind: "APP",
          appId: "app.test",
        },
        action: "STOP_SOUND",
        stopId: "typing_{conversationId}_{from}",
      },
    ];

    const instructions = deriveAudioInstructions(baseEvent, rules);
    expect(instructions).toHaveLength(1);
    expect(instructions[0].action).toBe("STOP_SOUND");
    expect(instructions[0].instanceId).toBe("typing_conv-1_alice");
  });

  it("applies id templates and ignores rules without sound", () => {
    const rules: AutoSoundRule[] = [
      {
        match: { kind: "APP" },
        action: "PLAY_ONE_SHOT",
        idTemplate: "loop_{conversationId}",
        sound: "loop",
        durationFrom: { key: "payload.meta", factor: 2 },
      },
      {
        match: { kind: "APP" },
        action: "PLAY_ONE_SHOT",
      },
    ];

    const event: TimelineEvent = {
      ...baseEvent,
      payload: { meta: { ok: true } },
    } as TimelineEvent;

    const [instruction] = deriveAudioInstructions(event, rules);
    expect(instruction.instanceId).toBe("loop_conv-1");
    expect(instruction.cue?.duration).toBeUndefined();
  });

  it("ignores silent events", () => {
    const rules: AutoSoundRule[] = [
      {
        match: { kind: "APP", appId: "app" },
        action: "PLAY_ONE_SHOT",
        sound: "ding",
      },
    ];

    const silentEvent: TimelineEvent = {
      ...baseEvent,
      silent: true,
    } as TimelineEvent;

    expect(deriveAudioInstructions(silentEvent, rules)).toEqual([]);
  });

  it("respects from='*' excluding 'me'", () => {
    const rules: AutoSoundRule[] = [
      {
        match: { kind: "APP", from: "*" },
        action: "PLAY_ONE_SHOT",
        sound: "ding",
      },
    ];

    const fromMe: TimelineEvent = {
      ...baseEvent,
      from: "me",
    } as TimelineEvent;

    expect(deriveAudioInstructions(fromMe, rules)).toEqual([]);
    expect(deriveAudioInstructions(baseEvent, rules)).toHaveLength(1);
  });

  it("ignores mismatched sender", () => {
    const rules: AutoSoundRule[] = [
      {
        match: { kind: "APP", from: "bob" },
        action: "PLAY_ONE_SHOT",
        sound: "ding",
      },
    ];

    const instructions = deriveAudioInstructions(baseEvent, rules);
    expect(instructions).toHaveLength(0);
  });

  it("ignores rules when appId is missing or mismatched", () => {
    const rules: AutoSoundRule[] = [
      {
        match: { kind: "APP", appId: "app.other" },
        action: "PLAY_ONE_SHOT",
        sound: "ding",
      },
    ];

    const missingAppId = { ...baseEvent } as TimelineEvent;
    delete (missingAppId as any).appId;

    expect(deriveAudioInstructions(missingAppId, rules)).toEqual([]);
    expect(deriveAudioInstructions(baseEvent, rules)).toEqual([]);
  });

  it("ignores rules when kind or type do not match", () => {
    const kindRules: AutoSoundRule[] = [
      {
        match: { kind: "DEVICE" },
        action: "PLAY_ONE_SHOT",
        sound: "ding",
      },
    ];

    expect(deriveAudioInstructions(baseEvent, kindRules)).toEqual([]);

    const typeRules: AutoSoundRule[] = [
      {
        match: { kind: "APP", type: "OTHER" },
        action: "PLAY_ONE_SHOT",
        sound: "ding",
      },
    ];

    expect(deriveAudioInstructions(baseEvent, typeRules)).toEqual([]);
  });

  it("ignores rules when from is required but missing", () => {
    const rules: AutoSoundRule[] = [
      {
        match: { kind: "APP", from: "alice" },
        action: "PLAY_ONE_SHOT",
        sound: "ding",
      },
    ];

    const noFrom = { ...baseEvent } as TimelineEvent;
    delete (noFrom as any).from;

    expect(deriveAudioInstructions(noFrom, rules)).toEqual([]);
  });

  it("handles missing duration paths gracefully", () => {
    const rules: AutoSoundRule[] = [
      {
        match: { kind: "APP", from: "alice" },
        action: "PLAY_ONE_SHOT",
        sound: "ding",
        durationFrom: { key: "payload.missing" },
      },
    ];

    const [instruction] = deriveAudioInstructions(baseEvent, rules);
    expect(instruction.cue?.duration).toBeUndefined();
  });

  it("creates ducked UI cues when configured", () => {
    const rules: AutoSoundRule[] = [
      {
        match: { kind: "APP", from: "alice" },
        action: "PLAY_ONE_SHOT",
        sound: "ding",
        duckMusic: true,
      },
    ];

    const [instruction] = deriveAudioInstructions(baseEvent, rules);
    expect(instruction.cue?.duck).toBeDefined();
  });

  it("exposes registry accessors", () => {
    AutoSoundRegistry.clear();
    const rules: AutoSoundRule[] = [
      {
        match: { kind: "APP", appId: "app" },
        action: "PLAY_ONE_SHOT",
        sound: "ding",
      },
    ];

    AutoSoundRegistry.unregisterByAppId("missing");
    AutoSoundRegistry.register(rules);
    expect(AutoSoundRegistry.getRulesForKind("APP")).toHaveLength(1);
    expect(AutoSoundRegistry.getRulesForKind("UNKNOWN")).toHaveLength(0);
    expect(AutoSoundRegistry.getAll()).toHaveLength(1);
    AutoSoundRegistry.unregisterByAppId("missing");
    AutoSoundRegistry.unregisterByAppId("app");
    expect(AutoSoundRegistry.getAll()).toHaveLength(0);
    AutoSoundRegistry.clear();
  });
});
