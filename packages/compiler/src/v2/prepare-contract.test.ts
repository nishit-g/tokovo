import { describe, expect, it } from "vitest";
import type { RuntimeEvent } from "@tokovo/core";
import { createCanonicalTrackEpisodeIR, type TrackEvent } from "@tokovo/ir";
import { lowerTrackEvent } from "./lowering.js";
import { prepareTrackEpisode } from "./prepare.js";

function runtimeKinds(events: RuntimeEvent[]): string[] {
  return events.map((event) => `${event.kind}:${event.type}`);
}

describe("compiler pipeline guarantees", () => {
  it("applies stable same-frame ordering policy", () => {
    const ir = createCanonicalTrackEpisodeIR({
      events: [
        {
          at: 0,
          kind: "AUDIO",
          type: "PLAY",
          payload: { soundId: "tap", volume: 0.2 },
          _declarationOrder: 2,
        },
        {
          at: 0,
          deviceId: "phone",
          kind: "DEVICE",
          type: "OPEN_APP",
          payload: { appId: "app_whatsapp" },
          _declarationOrder: 5,
        },
        {
          at: 0,
          deviceId: "phone",
          kind: "DEVICE",
          type: "UNLOCK",
          payload: {},
          _declarationOrder: 1,
        },
      ],
    });

    const prepared = prepareTrackEpisode(ir, [], { log: false, validate: true });
    expect(runtimeKinds(prepared.events)).toEqual([
      "DEVICE:UNLOCK",
      "DEVICE:OPEN_APP",
      "AUDIO:PLAY",
    ]);
  });

  it("throws precise error when app lowerer is missing", () => {
    const appEvent = {
      at: 0,
      kind: "APP",
      appId: "app_missing",
      type: "MESSAGE_SENT",
      payload: {},
      _declarationOrder: 0,
    } as TrackEvent;

    expect(() =>
      lowerTrackEvent(appEvent, { fps: 30, pluginLowerers: new Map() }),
    ).toThrow(/No plugin lowerer registered for appId: app_missing/);
  });

  it("prepareTrackEpisode signature and keyframe index are deterministic", () => {
    const ir = createCanonicalTrackEpisodeIR({
      events: [
        {
          at: 0,
          deviceId: "phone",
          kind: "DEVICE",
          type: "UNLOCK",
          payload: {},
          _declarationOrder: 0,
        },
        {
          at: 45,
          deviceId: "phone",
          kind: "DEVICE",
          type: "OPEN_APP",
          payload: { appId: "app_whatsapp" },
          _declarationOrder: 1,
        },
      ],
    });
    const preparedA = prepareTrackEpisode(ir, [], { log: false, validate: true });
    const preparedB = prepareTrackEpisode(ir, [], { log: false, validate: true });

    expect(preparedA.eventSignature).toBe(preparedB.eventSignature);
    expect(preparedA.keyframedEventIndex?.frames).toEqual(
      preparedB.keyframedEventIndex?.frames,
    );
    expect(preparedA.events).toEqual(preparedB.events);
  });
});
