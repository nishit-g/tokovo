import { describe, expect, it } from "vitest";
import { createCinematicSubjectRegistry, type LayoutState, type WorldState } from "@tokovo/core";
import { evaluateStageFrame, prepareStageProgram } from "@tokovo/stage";
import type { LayoutEngineOutput } from "../engines/useLayoutEngine.js";
import { projectCinematicFrame } from "../camera/projectCinematicFrame.js";

describe("cinematic coordinate-space bridge", () => {
  it("maps app-logical subjects through the display inset and the same scale as AppSurface", () => {
    const registry = createCinematicSubjectRegistry();
    registry.register({
      ownerId: "app_test",
      schema: {
        version: 1,
        ownerId: "app_test",
        semanticSubjectIds: ["message"],
        entityRegions: {},
      },
      project: () => [
        {
          ref: {
            kind: "semantic",
            deviceId: "phone",
            appId: "app_test",
            subjectId: "message",
          },
          rect: { x: 10, y: 20, width: 100, height: 40 },
          coordinateSpace: "app-logical",
          visible: true,
          sourceVersion: 1,
          provenance: { ownerId: "app_test", regionId: "message" },
        },
      ],
    });
    const stage = evaluateStageFrame(
      prepareStageProgram({
        version: 1,
        rootNodeId: "root",
        nodes: [
          {
            id: "root",
            source: { kind: "group" },
            localBounds: { x: 0, y: 0, width: 1080, height: 1920 },
            initialTransform: { a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0 },
            zIndex: 0,
          },
          {
            id: "phone-node",
            parentId: "root",
            source: { kind: "device", deviceId: "phone" },
            localBounds: { x: 0, y: 0, width: 1179, height: 2556 },
            initialTransform: { a: 1, b: 0, c: 0, d: 1, tx: 50, ty: 70 },
            zIndex: 1,
          },
        ],
        transformKeyframes: [],
      }),
      12,
    );
    const layout = {
      deviceId: "phone",
      appId: "app_test",
      appDesignWidth: 393,
      appLogicalScale: 3,
      layout: { kind: "FEED", meta: {} } as LayoutState,
      profile: {
        dimensions: { width: 1179, height: 2556 },
        display: {
          x: 24,
          y: 30,
          width: 1131,
          height: 2496,
          ppi: 460,
          cornerRadius: 150,
        },
      },
    } as LayoutEngineOutput;

    const projected = projectCinematicFrame({
      frame: 12,
      world: { devices: {}, appState: {} } as WorldState,
      layout,
      stage,
      registry,
    });

    const message = projected.subjects.find(
      (subject) => subject.ref.kind === "semantic" && subject.ref.subjectId === "message",
    );
    expect(message?.localRect).toEqual({ x: 54, y: 90, width: 300, height: 120 });
    expect(message?.worldRect).toEqual({ x: 104, y: 160, width: 300, height: 120 });

    const body = projected.subjects.find(
      (subject) => subject.ref.kind === "device" && subject.ref.subjectId === "body",
    );
    const screen = projected.subjects.find(
      (subject) => subject.ref.kind === "device" && subject.ref.subjectId === "screen",
    );
    expect(body?.localRect).toEqual({ x: 0, y: 0, width: 1179, height: 2556 });
    expect(screen?.localRect).toEqual({ x: 24, y: 30, width: 1131, height: 2496 });
  });
});
