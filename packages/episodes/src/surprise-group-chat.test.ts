import { WhatsAppPlugin } from "@tokovo/apps-whatsapp/plugin";
import { XPlugin } from "@tokovo/apps-x/plugin";
import { prepareTrackEpisode } from "@tokovo/compiler";
import { describe, expect, it } from "vitest";
import story from "./stories/surprise-group-chat.episode.js";

describe("The Surprise Was the Group Chat", () => {
  it("covers the complete story with grouped deliveries, routed handoffs, and non-overlapping input", () => {
    const ir = story.build();
    const prepared = prepareTrackEpisode(ir, [WhatsAppPlugin, XPlugin], {
      log: false,
      validate: true,
    });
    expect(ir.durationInFrames).toBe(1260);
    expect(prepared.cinematics?.defaultCameraPlanId).toBe("story");
    const directed = prepared.cinematics?.cameraPrograms.find(
      (program) => program.plan.id === "directed",
    );
    expect(
      directed?.plan.shots.find((shot) => shot.id === "she-created-the-group")?.direction,
    ).toMatchObject({
      source: "freeze",
      framing: "follow-position",
      tracking: { halfLifeSeconds: 0.18 },
    });
    expect(prepared.cinematics?.cameraPrograms[0]?.coverageByOutput["portrait-main"]?.gaps).toEqual(
      [],
    );
    const notifications = prepared.notificationProgram;
    const opening = notifications?.records.filter((record) =>
      ["secret", "cake", "added"].includes(record.id),
    );
    expect(opening).toHaveLength(3);
    expect(new Set(opening?.map((record) => record.groupId))).toEqual(
      new Set(["conversation:birthday"]),
    );
    expect(notifications?.actionEffects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ notificationId: "added", authenticated: true }),
        expect.objectContaining({
          notificationId: "maya-mention",
          interactionType: "markRead",
          badgeCount: 0,
          target: expect.objectContaining({
            appEvent: expect.objectContaining({
              type: "MARK_NOTIFICATION_READ",
              payload: { id: "maya-mention" },
            }),
          }),
        }),
        expect.objectContaining({
          notificationId: "maya-mention",
          target: expect.objectContaining({
            appEvent: expect.objectContaining({
              type: "SET_SCREEN",
              payload: expect.objectContaining({ screen: "tweet", tweetId: "party-post" }),
            }),
          }),
        }),
        expect.objectContaining({
          notificationId: "still-surprise",
          target: expect.objectContaining({
            appEvent: expect.objectContaining({
              type: "CONVERSATION_OPENED",
              payload: { conversationId: "birthday" },
            }),
          }),
        }),
      ]),
    );
    expect(ir.inputSessions).toHaveLength(3);
    const sessions = [...(ir.inputSessions ?? [])].sort((a, b) => a.startFrame - b.startFrame);
    for (let index = 1; index < sessions.length; index++) {
      expect(sessions[index]?.startFrame).toBeGreaterThanOrEqual(
        sessions[index - 1]?.endFrame ?? 0,
      );
    }
  });
});
