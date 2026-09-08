import { IMessagePlugin } from "@tokovo/apps-imessage/plugin";
import { prepareTrackEpisode } from "@tokovo/compiler";
import { describe, expect, it } from "vitest";
import calendarInvite from "./stories/calendar-invite.episode.js";

describe("The Calendar Invite", () => {
  it("compiles a complete notification, calendar-card, performer, voice, and camera story", () => {
    const ir = calendarInvite.build();
    const prepared = prepareTrackEpisode(ir, [IMessagePlugin], {
      log: false,
      validate: true,
    });

    expect(calendarInvite.meta.id).toBe("calendar-invite");
    expect(ir.durationInFrames).toBe(720);
    expect(ir.devices).toHaveLength(1);
    expect(ir.devices[0]?.installedApps).toEqual(["app_imessage"]);
    expect(ir.notificationIntents).toEqual([
      expect.objectContaining({
        id: "calendar-teal-accepted",
        appId: "system_calendar",
      }),
    ]);

    const iMessageEvents = ir.events.filter(
      (event) => event.kind === "APP" && event.appId === "app_imessage",
    );
    expect(
      iMessageEvents.some(
        (event) =>
          event.type === "IMESSAGE_MESSAGE_RECEIVE" &&
          JSON.stringify(event.payload).includes(
            "Discuss Coral’s attention to detail",
          ),
      ),
    ).toBe(true);
    expect(
      iMessageEvents.filter(
        (event) => event.type === "IMESSAGE_TYPING_START",
      ),
    ).toHaveLength(3);

    expect(ir.voice?.segmentSchedule).toHaveLength(6);
    expect(
      ir.events.filter(
        (event) =>
          event.kind === "OVERLAY" &&
          event.type === "SHOW" &&
          event.payload.variant === "performer",
      ),
    ).toHaveLength(7);
    expect(prepared.cinematics?.storySignature).toBe(
      prepared.eventSignature,
    );
    expect(
      prepared.cinematics?.cameraPrograms[0]?.coverageByOutput[
        "portrait-main"
      ]?.gaps,
    ).toEqual([]);
  });
});
