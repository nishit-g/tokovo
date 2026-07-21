import { describe, expect, it } from "vitest";
import {
  DeviceConfigSchema,
  TrackEpisodeIRSchema,
  TrackEventSchema,
  VoiceConfigSchema,
  createCanonicalDeviceConfig,
  createCanonicalTrackEpisodeIR,
  normalizeZodIssues,
  safeValidateTrackEpisodeIR,
} from "./index.js";

describe("IR contract matrix", () => {
  it("accepts canonical episode fixture", () => {
    const episode = createCanonicalTrackEpisodeIR();
    const parsed = TrackEpisodeIRSchema.parse(episode);
    expect(parsed.id).toBe("fixture-episode");
    expect(parsed.devices).toHaveLength(1);
  });

  it("rejects nested invalid payload with structured diagnostics", () => {
    const invalid = createCanonicalTrackEpisodeIR({
      devices: [createCanonicalDeviceConfig({ os: { battery: 999 } })],
    });
    const result = safeValidateTrackEpisodeIR(invalid);
    expect(result.success).toBe(false);
    if (result.success) return;
    const issues = normalizeZodIssues(result.error.issues);
    expect(issues[0].path).toEqual(["devices", 0, "os", "battery"]);
    expect(issues[0].code).toBe("too_big");
  });

  it("validates top-level schemas on boundary values", () => {
    expect(() =>
      DeviceConfigSchema.parse(createCanonicalDeviceConfig({ id: "" })),
    ).not.toThrow();
    expect(() =>
      TrackEventSchema.parse({
        at: -1,
        kind: "DEVICE",
        type: "LOCK",
        payload: {},
      }),
    ).toThrow();
    expect(() =>
      VoiceConfigSchema.parse({
        manifestPath: "a.json",
        audioPath: "b.mp3",
        segmentSchedule: [{ segmentId: "s1", at: 0, volume: 1, speed: 1 }],
      }),
    ).not.toThrow();
  });

  it("keeps invalid issue shape/order deterministic", () => {
    const invalid = createCanonicalTrackEpisodeIR({
      fps: 0,
      durationInFrames: -1,
      devices: [],
    });

    const first = safeValidateTrackEpisodeIR(invalid);
    const second = safeValidateTrackEpisodeIR(invalid);
    expect(first.success).toBe(false);
    expect(second.success).toBe(false);
    if (first.success || second.success) return;

    expect(normalizeZodIssues(first.error.issues)).toEqual(
      normalizeZodIssues(second.error.issues),
    );
  });

  it("validates multilingual, IME-aware input sessions", () => {
    const episode = createCanonicalTrackEpisodeIR({
      inputSessions: [
        {
          id: "reply-ja",
          deviceId: "phone",
          appInstanceId: "phone:app_whatsapp",
          fieldId: "composer",
          startFrame: 30,
          submitAtFrame: 120,
          clearOnSubmit: true,
          locale: "ja-JP",
          direction: "auto",
          script: [
            {
              type: "compose",
              updates: ["k", "ko", "こん"],
              commit: "こんにちは",
              keys: ["k", "o", "n"],
            },
          ],
          expectedFinalValue: "こんにちは",
          keyboard: { appearance: "dark", returnKey: "send" },
        },
      ],
    });

    expect(TrackEpisodeIRSchema.parse(episode).inputSessions?.[0]).toMatchObject({
      locale: "ja-JP",
      fieldId: "composer",
      clearOnSubmit: true,
    });
  });

  it("rejects ambiguous input text plus script at the IR boundary", () => {
    const episode = createCanonicalTrackEpisodeIR({
      inputSessions: [
        {
          deviceId: "phone",
          appInstanceId: "phone:app_whatsapp",
          fieldId: "composer",
          startFrame: 0,
          text: "hello",
          script: [{ type: "type", text: "world" }],
        },
      ],
    });

    expect(safeValidateTrackEpisodeIR(episode).success).toBe(false);
  });
});
