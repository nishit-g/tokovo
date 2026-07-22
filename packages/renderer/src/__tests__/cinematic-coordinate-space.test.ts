import { describe, expect, it } from "vitest";
import {
  createCinematicSubjectRegistry,
  type LayoutState,
  type WorldState,
} from "@tokovo/core";
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
      world: {
        devices: {},
        appInstances: {},
        capabilityState: {},
      } as WorldState,
      layouts: [layout],
      stage,
      registry,
    });

    const message = projected.subjects.find(
      (subject) =>
        subject.ref.kind === "semantic" && subject.ref.subjectId === "message",
    );
    expect(message?.localRect).toEqual({
      x: 54,
      y: 90,
      width: 300,
      height: 120,
    });
    expect(message?.worldRect).toEqual({
      x: 104,
      y: 160,
      width: 300,
      height: 120,
    });

    const body = projected.subjects.find(
      (subject) =>
        subject.ref.kind === "device" && subject.ref.subjectId === "body",
    );
    const screen = projected.subjects.find(
      (subject) =>
        subject.ref.kind === "device" && subject.ref.subjectId === "screen",
    );
    expect(body?.localRect).toEqual({ x: 0, y: 0, width: 1179, height: 2556 });
    expect(screen?.localRect).toEqual({
      x: 24,
      y: 30,
      width: 1131,
      height: 2496,
    });
  });

  it("combines scaled subjects from multiple stage devices without collisions", () => {
    const registry = createCinematicSubjectRegistry();
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
          ...["left", "right"].map((deviceId, index) => ({
            id: `device-${deviceId}`,
            parentId: "root",
            source: { kind: "device" as const, deviceId },
            localBounds: {
              x: 100 + index * 500,
              y: 200,
              width: 200,
              height: 400,
            },
            initialTransform: { a: 1, b: 0, c: 0, d: 1, tx: 10, ty: 20 },
            zIndex: index + 1,
          })),
        ],
        transformKeyframes: [],
      }),
      4,
    );
    const layouts = ["left", "right"].map(
      (deviceId) =>
        ({
          deviceId,
          appId: undefined,
          appLogicalScale: 1,
          layout: { kind: "HOMESCREEN", meta: {} } as LayoutState,
          profile: {
            dimensions: { width: 400, height: 800 },
            display: {
              x: 10,
              y: 20,
              width: 380,
              height: 760,
              ppi: 400,
              cornerRadius: 40,
            },
          },
        }) as LayoutEngineOutput,
    );

    const projected = projectCinematicFrame({
      frame: 4,
      world: {
        devices: {},
        appInstances: {},
        capabilityState: {},
      } as WorldState,
      layouts,
      stage,
      registry,
    });

    const bodies = projected.subjects.filter(
      (subject) =>
        subject.ref.kind === "device" && subject.ref.subjectId === "body",
    );
    expect(bodies).toHaveLength(2);
    expect(bodies[0]).toMatchObject({
      ref: { kind: "device", deviceId: "left", subjectId: "body" },
      localRect: { x: 100, y: 200, width: 200, height: 400 },
      worldRect: { x: 110, y: 220, width: 200, height: 400 },
    });
    expect(bodies[1]).toMatchObject({
      ref: { kind: "device", deviceId: "right", subjectId: "body" },
      localRect: { x: 600, y: 200, width: 200, height: 400 },
      worldRect: { x: 610, y: 220, width: 200, height: 400 },
    });
  });
});
