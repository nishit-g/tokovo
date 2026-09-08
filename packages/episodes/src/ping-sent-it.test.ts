import { WhatsAppPlugin } from "@tokovo/apps-whatsapp/plugin";
import { prepareTrackEpisode } from "@tokovo/compiler";
import { describe, expect, it } from "vitest";
import pingSentIt from "./stories/ping-sent-it.episode.js";

describe("Ping Sent It", () => {
  it("compiles a complete three-performer loop with typed sends, voice, and camera coverage", () => {
    const ir = pingSentIt.build();
    const prepared = prepareTrackEpisode(ir, [WhatsAppPlugin], {
      log: false,
      validate: true,
    });

    expect(pingSentIt.meta.id).toBe("ping-sent-it");
    expect(ir.durationInFrames).toBe(630);
    expect(ir.devices).toHaveLength(1);
    expect(ir.devices[0]?.installedApps).toEqual(["app_whatsapp"]);
    expect(ir.inputSessions).toHaveLength(2);
    expect(ir.voice?.segmentSchedule).toHaveLength(9);

    expect(ir.events.some((event) => JSON.stringify(event.payload).includes("2,431 people"))).toBe(
      true,
    );
    expect(ir.events.some((event) => JSON.stringify(event.payload).includes("…where?"))).toBe(true);

    const performerEvents = ir.events.filter(
      (event) =>
        event.kind === "OVERLAY" && event.type === "SHOW" && event.payload.variant === "performer",
    );
    expect(performerEvents).toHaveLength(14);
    expect(
      performerEvents.some(
        (event) => event.payload.mediaSrc === "/performers/ping-courier/jumping.gif",
      ),
    ).toBe(true);

    expect(prepared.cinematics?.storySignature).toBe(prepared.eventSignature);
    expect(prepared.cinematics?.cameraPrograms[0]?.coverageByOutput["portrait-main"]?.gaps).toEqual(
      [],
    );
  });
});
