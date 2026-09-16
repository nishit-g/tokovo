import type {
  CinematicSubjectProjection,
  CinematicSubjectRegistryClass,
  LayoutRect,
  WorldState,
} from "@tokovo/core";
import type { CinematicSubjectFrame } from "@tokovo/camera";
import {
  projectCinematicSubjects,
  type EvaluatedStageFrame,
  type LocalCinematicSubject,
} from "@tokovo/stage";
import type { LayoutEngineOutput } from "../engines/useLayoutEngine.js";

function deviceSubject(input: {
  deviceId: string;
  subjectId: string;
  rect: LayoutRect;
  coordinateSpace: "device-screen" | "device-body";
  visible?: boolean;
}): CinematicSubjectProjection {
  return {
    ref: {
      kind: "device",
      deviceId: input.deviceId,
      subjectId: input.subjectId,
    },
    rect: input.rect,
    coordinateSpace: input.coordinateSpace,
    visible: input.visible ?? true,
    sourceVersion: 1,
    provenance: { ownerId: "device", regionId: input.subjectId },
  };
}

function collectDeviceSubjects(layout: LayoutEngineOutput): readonly CinematicSubjectProjection[] {
  const viewport = {
    x: 0,
    y: 0,
    width: layout.profile.dimensions.width,
    height: layout.profile.dimensions.height,
  };
  const display = layout.profile.display;
  const projections: CinematicSubjectProjection[] = [
    deviceSubject({
      deviceId: layout.deviceId,
      subjectId: "body",
      rect: viewport,
      coordinateSpace: "device-body",
    }),
    deviceSubject({
      deviceId: layout.deviceId,
      subjectId: "screen",
      rect: { x: 0, y: 0, width: display.width, height: display.height },
      coordinateSpace: "device-screen",
    }),
  ];
  const keyboard = layout.inputProjection?.surface;
  if (keyboard?.visible && keyboard.viewportInset > 0) {
    projections.push(
      deviceSubject({
        deviceId: layout.deviceId,
        subjectId: "keyboard",
        coordinateSpace: "device-screen",
        rect: {
          x: 0,
          y: display.height - keyboard.viewportInset,
          width: display.width,
          height: keyboard.viewportInset,
        },
      }),
    );
  }
  for (const [name, rect] of Object.entries(
    layout.notificationProjection?.cinematicSubjects ?? {},
  )) {
    if (!rect) continue;
    projections.push(
      deviceSubject({
        deviceId: layout.deviceId,
        subjectId: `notification.${name}`,
        rect,
        coordinateSpace: "device-screen",
      }),
    );
  }
  for (const [name, rect] of Object.entries(
    layout.systemSurfaceProjection?.cinematicSubjects ?? {},
  )) {
    projections.push(
      deviceSubject({
        deviceId: layout.deviceId,
        subjectId: name,
        rect,
        coordinateSpace: "device-screen",
      }),
    );
  }
  return projections;
}

function scaleRect(rect: LayoutRect, scale: number): LayoutRect {
  return {
    x: rect.x * scale,
    y: rect.y * scale,
    width: rect.width * scale,
    height: rect.height * scale,
  };
}

function scaleRect2d(rect: LayoutRect, scaleX: number, scaleY: number): LayoutRect {
  return {
    x: rect.x * scaleX,
    y: rect.y * scaleY,
    width: rect.width * scaleX,
    height: rect.height * scaleY,
  };
}

function offsetRect(rect: LayoutRect, x: number, y: number): LayoutRect {
  return { ...rect, x: rect.x + x, y: rect.y + y };
}

/** Bridges every exact per-device layout projection into one stage subject frame. */
export function projectCinematicFrame(input: {
  frame: number;
  world: WorldState;
  layouts: readonly LayoutEngineOutput[];
  stage: EvaluatedStageFrame;
  registry: CinematicSubjectRegistryClass;
}): CinematicSubjectFrame {
  if (input.stage.frame !== input.frame) {
    throw new Error(
      `Stage frame ${input.stage.frame} does not match subject frame ${input.frame}.`,
    );
  }
  const seenDevices = new Set<string>();
  const localSubjects: LocalCinematicSubject[] = [];
  for (const layout of input.layouts) {
    if (seenDevices.has(layout.deviceId)) {
      throw new Error(`Duplicate cinematic layout for device "${layout.deviceId}".`);
    }
    seenDevices.add(layout.deviceId);
    const stageNode = input.stage.nodes.find(
      (node) => node.source.kind === "device" && node.source.deviceId === layout.deviceId,
    );
    if (!stageNode) {
      throw new Error(`No evaluated stage node owns device "${layout.deviceId}".`);
    }
    const appSubjects = layout.appId
      ? input.registry.project(layout.appId, input.world, layout.layout, layout.deviceId)
      : [];
    const projections = [...collectDeviceSubjects(layout), ...appSubjects];
    const display = layout.profile.display;
    const scaleX = stageNode.localBounds.width / layout.profile.dimensions.width;
    const scaleY = stageNode.localBounds.height / layout.profile.dimensions.height;
    for (const projection of projections) {
      const screenRect =
        projection.coordinateSpace === "app-logical"
          ? scaleRect(projection.rect, layout.appLogicalScale)
          : projection.rect;
      const deviceRect =
        projection.coordinateSpace === "device-body"
          ? screenRect
          : offsetRect(screenRect, display.x, display.y);
      const localRect = offsetRect(
        scaleRect2d(deviceRect, scaleX, scaleY),
        stageNode.localBounds.x,
        stageNode.localBounds.y,
      );
      const clippedScreenRect = projection.clippedRect
        ? projection.coordinateSpace === "app-logical"
          ? scaleRect(projection.clippedRect, layout.appLogicalScale)
          : projection.clippedRect
        : undefined;
      const clippedDeviceRect = clippedScreenRect
        ? projection.coordinateSpace === "device-body"
          ? clippedScreenRect
          : offsetRect(clippedScreenRect, display.x, display.y)
        : undefined;
      const clippedLocalRect = clippedDeviceRect
        ? offsetRect(
            scaleRect2d(clippedDeviceRect, scaleX, scaleY),
            stageNode.localBounds.x,
            stageNode.localBounds.y,
          )
        : undefined;
      localSubjects.push({
        ref: projection.ref,
        localRect,
        nodeId: stageNode.id,
        visible: projection.visible,
        clippedLocalRect,
        ...(projection.textSizePx === undefined
          ? {}
          : {
              textSizePx:
                projection.textSizePx *
                Math.min(scaleX, scaleY) *
                (projection.coordinateSpace === "app-logical" ? layout.appLogicalScale : 1),
            }),
        sourceVersion: projection.sourceVersion,
        provenance: projection.provenance,
      });
    }
  }
  return {
    frame: input.frame,
    subjects: projectCinematicSubjects(input.stage, localSubjects),
  };
}
