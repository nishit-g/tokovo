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
  for (const [name, rect] of Object.entries(layout.notificationProjection?.anchors ?? {})) {
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
  for (const [name, rect] of Object.entries(layout.systemSurfaceProjection?.anchors ?? {})) {
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

function offsetRect(rect: LayoutRect, x: number, y: number): LayoutRect {
  return { ...rect, x: rect.x + x, y: rect.y + y };
}

/** Bridges exact per-device layout projections into stage/world subjects. */
export function projectCinematicFrame(input: {
  frame: number;
  world: WorldState;
  layout: LayoutEngineOutput;
  stage: EvaluatedStageFrame;
  registry: CinematicSubjectRegistryClass;
}): CinematicSubjectFrame {
  if (input.stage.frame !== input.frame) {
    throw new Error(
      `Stage frame ${input.stage.frame} does not match subject frame ${input.frame}.`,
    );
  }
  const stageNode = input.stage.nodes.find(
    (node) => node.source.kind === "device" && node.source.deviceId === input.layout.deviceId,
  );
  if (!stageNode) {
    throw new Error(`No evaluated stage node owns device "${input.layout.deviceId}".`);
  }
  const appSubjects = input.layout.appId
    ? input.registry.project(
        input.layout.appId,
        input.world,
        input.layout.layout,
        input.layout.deviceId,
      )
    : [];
  const projections = [...collectDeviceSubjects(input.layout), ...appSubjects];
  const display = input.layout.profile.display;
  const localSubjects: LocalCinematicSubject[] = projections.map((projection) => {
    const screenRect =
      projection.coordinateSpace === "app-logical"
        ? scaleRect(projection.rect, input.layout.appLogicalScale)
        : projection.rect;
    const localRect =
      projection.coordinateSpace === "device-body"
        ? screenRect
        : offsetRect(screenRect, display.x, display.y);
    const clippedScreenRect = projection.clippedRect
      ? projection.coordinateSpace === "app-logical"
        ? scaleRect(projection.clippedRect, input.layout.appLogicalScale)
        : projection.clippedRect
      : undefined;
    const clippedLocalRect = clippedScreenRect
      ? projection.coordinateSpace === "device-body"
        ? clippedScreenRect
        : offsetRect(clippedScreenRect, display.x, display.y)
      : undefined;
    return {
      ref: projection.ref,
      localRect,
      nodeId: stageNode.id,
      visible: projection.visible,
      clippedLocalRect,
      sourceVersion: projection.sourceVersion,
      provenance: projection.provenance,
    };
  });
  return {
    frame: input.frame,
    subjects: projectCinematicSubjects(input.stage, localSubjects),
  };
}
