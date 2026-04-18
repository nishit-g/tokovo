import { describe, expect, it } from "vitest";
import { normalizeTrackEpisodeIR } from "@tokovo/ir";
import { createReactionPlan } from "@tokovo/reactions";
import { episode } from "./episode.js";

function buildDeterministicDslEpisode() {
  return episode("dsl-contract", { fps: 30, duration: "10s" })
    .device("phone", "iphone16", { app: "app_whatsapp" })
    .deviceTrack("phone", (device) => {
      device.at("0s").unlock();
      device.at("1s").openApp("app_whatsapp");
      device.at(45).setBadge("app_whatsapp", 3);
    })
    .overlay((overlay) => {
      overlay.at("2s").caption("hello");
      overlay.at("3s").clear();
    })
    .build();
}

describe("DSL contract + determinism", () => {
  it("supports a first-class reactor plan integration point", () => {
    const reactionPlan = createReactionPlan({
      id: "reactor-contract",
      sourceRef: {
        kind: "tokovo_episode",
        episodeId: "dsl-contract",
      },
      cast: [],
      segments: [],
      version: "1",
    });

    const ir = episode("dsl-reactors", { fps: 30, duration: "5s" })
      .device("phone", "iphone16", { app: "app_whatsapp" })
      .reactors(reactionPlan)
      .build();

    expect(ir.reactionPlan?.id).toBe("reactor-contract");
    expect(ir.reactionPlan?.formatPreset).toBe("stream-chaos-vertical");
  });

  it("maps builder calls to expected IR shape", () => {
    const ir = buildDeterministicDslEpisode();
    expect(ir.id).toBe("dsl-contract");
    expect(ir.events.map((e) => `${e.kind}:${e.type}`)).toEqual([
      "DEVICE:UNLOCK",
      "DEVICE:OPEN_APP",
      "DEVICE:SET_BADGE",
      "OVERLAY:SHOW",
      "OVERLAY:CLEAR",
    ]);
  });

  it("resolves mixed timing notation correctly", () => {
    const ir = buildDeterministicDslEpisode();
    const frames = ir.events.map((e) => e.at);
    expect(frames).toEqual([0, 30, 45, 60, 90]);
  });

  it("fails explicitly for invalid authoring timing input", () => {
    expect(() =>
      episode("bad-timing", { fps: 30, duration: "5s" })
        .device("phone", "iphone16", { app: "app_whatsapp" })
        .overlay((overlay) => {
          overlay.at("oops").caption("x");
        })
        .build(),
    ).toThrow(/Invalid time format/);
  });

  it("produces deterministic normalized IR", () => {
    const a = buildDeterministicDslEpisode();
    const b = buildDeterministicDslEpisode();
    expect(normalizeTrackEpisodeIR(a)).toEqual(normalizeTrackEpisodeIR(b));
  });
});
