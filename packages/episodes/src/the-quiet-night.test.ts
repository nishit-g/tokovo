import { describe, expect, it } from "vitest";
import { prepareTrackEpisode } from "@tokovo/compiler";
import { WhatsAppPlugin } from "@tokovo/apps-whatsapp/plugin";
import { XPlugin } from "@tokovo/apps-x/plugin";
import story from "./stories/the-quiet-night.episode.js";
import {
  createBuiltinCameraRegistries,
  evaluateCameraOutput,
  type CinematicSubjectFrame,
} from "@tokovo/camera";

describe("The Quiet Night", () => {
  it("covers a dialogue rally and both notification-driven app handoffs", () => {
    const ir = story.build();
    expect(ir.cinematics?.defaultCameraPlanId).toBe("cinematic");
    const prepared = prepareTrackEpisode(ir, [WhatsAppPlugin, XPlugin], {
      validate: true,
      log: false,
    });
    const camera = prepared.cinematics?.cameraPrograms[0];
    expect(camera?.coverageByOutput.portrait.gaps).toEqual([]);
    expect(camera?.plan.shots).toHaveLength(3);
    expect(camera?.plan.shots.at(-1)?.endFrame).toBe(900);
    const cinematic = prepared.cinematics?.cameraPrograms.find(
      (program) => program.plan.id === "cinematic",
    );
    expect(cinematic?.coverageByOutput.portrait.gaps).toEqual([]);
    expect(cinematic?.plan.shots).toHaveLength(13);
    expect(cinematic?.plan.shots.at(-1)?.endFrame).toBe(900);
    const interruption = cinematic?.plan.shots.find((shot) => shot.id === "the-interruption");
    expect(cinematic?.plan.rigs.find((rig) => rig.id === interruption?.rigId)?.subject).toEqual({
      kind: "device",
      deviceId: "phone",
      subjectId: "notification.banner",
    });
    expect(interruption?.direction?.entrance).toEqual({ type: "minimum-jerk", durationFrames: 27 });
    const reading = prepared.cinematics?.cameraPrograms.find(
      (program) => program.plan.id === "reading-room",
    );
    expect(reading?.coverageByOutput.portrait.gaps).toEqual([]);
    expect(reading?.plan.shots).toHaveLength(4);
    expect(reading?.plan.shots[0].direction).toMatchObject({
      framing: "follow-position",
      tracking: {
        halfLifeSeconds: 0.22,
        readingRegion: { x: 0.05, y: 0.35, width: 0.9, height: 0.45 },
      },
    });
    expect(
      camera?.plan.shots.find((shot) => shot.id === "public-evidence")?.direction,
    ).toMatchObject({
      source: "freeze",
      framing: "hold",
      entrance: { type: "minimum-jerk", durationFrames: 45 },
    });
    expect(prepared.notificationProgram?.actionEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          notificationId: "tagged",
          target: expect.objectContaining({
            appEvent: expect.objectContaining({
              type: "SET_SCREEN",
              payload: expect.objectContaining({ screen: "tweet", tweetId: "karaoke" }),
            }),
          }),
        }),
        expect.objectContaining({
          notificationId: "dont-open",
          target: expect.objectContaining({
            appEvent: expect.objectContaining({
              type: "CONVERSATION_OPENED",
              payload: { conversationId: "sam" },
            }),
          }),
        }),
      ]),
    );
  });

  it("keeps the reading shots stationary and returns to the identical composition", () => {
    const prepared = prepareTrackEpisode(story.build(), [WhatsAppPlugin, XPlugin], {
      validate: true,
      log: false,
    });
    const program = prepared.cinematics!.cameraPrograms[0];
    const registries = createBuiltinCameraRegistries();
    const ref = program.plan.rigs.find((rig) => rig.id === program.plan.shots[0].rigId)!.subject;
    const geometry = (frame: number): CinematicSubjectFrame => ({
      frame,
      subjects: [
        {
          ref,
          localRect: { x: 0, y: 0, width: 640, height: 1390 },
          worldRect: { x: 220, y: 220, width: 640, height: 1390 },
          visible: true,
          nodeId: "phone",
          sourceVersion: 1,
          provenance: { ownerId: "device", regionId: "body" },
        },
      ],
    });
    const evaluate = (frame: number) =>
      evaluateCameraOutput(
        {
          program,
          outputId: "portrait",
          frame,
          subjectFrame: geometry(frame),
          mode: "render",
        },
        registries,
      );
    const opening = evaluate(0).pose;
    // Includes message arrivals and navigation to X. No message geometry is needed to hold the phone.
    for (const frame of [72, 156, 240, 324, 378, 432, 464, 630, 690, 708, 798, 899])
      expect(evaluate(frame).pose).toEqual(opening);
    expect(
      program.plan.shots.every((shot) => !shot.direction?.tracking && !shot.direction?.movement),
    ).toBe(true);
  });
});
