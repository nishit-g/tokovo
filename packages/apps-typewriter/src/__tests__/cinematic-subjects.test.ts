import { describe, expect, it } from "vitest";
import { createAppViewportFrame, type LayoutContext, type WorldState } from "@tokovo/core";

import { TypewriterCinematicSubjects } from "../camera/subjects.js";
import { TYPEWRITER_APP_ID } from "../constants.js";
import { computeTypewriterFullscreenLayout } from "../layout/index.js";
import { createTypewriterInitialState } from "../runtime/state.js";

function context(cursor = { page: 0, row: 2, col: 7 }): LayoutContext {
  const state = createTypewriterInitialState();
  state.cursor = cursor;
  const world = {
    t: 0,
    devices: {
      desk: {
        id: "desk",
        profileId: "canvas-1080x1920",
        foregroundAppId: TYPEWRITER_APP_ID,
      },
    },
    appInstances: { "desk:app_typewriter": state },
    capabilityState: {},
    audio: { activeSounds: [], musicBed: null },
  } as unknown as WorldState;
  return {
    world,
    t: 0,
    activeDeviceId: "desk",
    activeAppId: TYPEWRITER_APP_ID,
    platform: "ios",
    viewKind: "FULLSCREEN",
    viewportWidth: 1080,
    viewportHeight: 1920,
    appViewport: createAppViewportFrame({ width: 1080, height: 1920 }),
  };
}

describe("Typewriter cinematic subjects", () => {
  it("projects the exact rectangles emitted by the canonical layout", () => {
    const input = context();
    const layout = computeTypewriterFullscreenLayout(input);
    const projected = TypewriterCinematicSubjects.project(input.world, layout, "desk");

    for (const subject of projected) {
      if (subject.ref.kind !== "semantic") continue;
      expect(subject.rect).toEqual(layout.semantic?.regions[subject.ref.subjectId]?.rect);
      expect(subject.coordinateSpace).toBe("app-logical");
    }
    expect(
      projected.find(
        (subject) => subject.ref.kind === "semantic" && subject.ref.subjectId === "paper",
      )?.rect,
    ).toEqual(layout.semantic?.regions.paper?.rect);
  });

  it("derives dynamic cursor geometry from state without device-size fallbacks", () => {
    const firstInput = context({ page: 0, row: 1, col: 1 });
    const secondInput = context({ page: 0, row: 4, col: 12 });
    const first = computeTypewriterFullscreenLayout(firstInput).semantic?.regions.cursor?.rect;
    const second = computeTypewriterFullscreenLayout(secondInput).semantic?.regions.cursor?.rect;

    expect(second?.x).toBeGreaterThan(first?.x ?? Number.POSITIVE_INFINITY);
    expect(second?.y).toBeGreaterThan(first?.y ?? Number.POSITIVE_INFINITY);
  });
});
