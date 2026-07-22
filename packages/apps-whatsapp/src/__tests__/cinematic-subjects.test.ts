import { describe, expect, it } from "vitest";
import type { LayoutState, WorldState } from "@tokovo/core";
import { WhatsAppCinematicSubjects } from "../camera/subjects.js";

describe("WhatsApp cinematic subjects", () => {
  it("emits exact entity regions and explicit latest selectors from canonical layout", () => {
    const layout = {
      kind: "CHAT",
      semantic: {
        regions: {
          m1: {
            id: "m1",
            rect: { x: 22, y: 410, width: 250, height: 82 },
            tags: ["message", "message_other", "text"],
          },
          media_m1: {
            id: "media_m1",
            rect: { x: 30, y: 418, width: 234, height: 52 },
            tags: ["media", "image"],
            metadata: { messageId: "m1" },
          },
          input_area: {
            id: "input_area",
            rect: { x: 0, y: 780, width: 393, height: 72 },
            tags: ["input", "footer"],
          },
        },
        groups: { message: ["m1"], media: ["media_m1"] },
      },
    } as LayoutState;
    const world = {
      devices: {},
      appInstances: {},
      capabilityState: {},
    } as WorldState;
    const subjects = WhatsAppCinematicSubjects.project(world, layout, "phone");

    expect(subjects).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          ref: {
            kind: "entity",
            deviceId: "phone",
            appId: "app_whatsapp",
            entityType: "message",
            entityId: "m1",
            region: "bubble",
          },
          rect: { x: 22, y: 410, width: 250, height: 82 },
        }),
        expect.objectContaining({
          ref: expect.objectContaining({
            kind: "entity",
            entityId: "m1",
            region: "media",
          }),
        }),
        expect.objectContaining({
          ref: expect.objectContaining({
            kind: "semantic",
            subjectId: "last-message",
          }),
          provenance: expect.objectContaining({ regionId: "m1" }),
        }),
      ]),
    );
  });
});
