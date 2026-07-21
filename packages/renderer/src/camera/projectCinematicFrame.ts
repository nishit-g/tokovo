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
  visible?: boolean;
}): CinematicSubjectProjection {
  return {
    ref: {
      kind: "device",
      deviceId: input.deviceId,
      subjectId: input.subjectId,
    },
    rect: input.rect,
    coordinateSpace: "device-screen",
    visible: input.visible ?? true,
    sourceVersion: 1,
    provenance: { ownerId: "device", regionId: input.subjectId },
  };
}

function collectDeviceSubjects(
  layout: LayoutEngineOutput,
): readonly CinematicSubjectProjection[] {
  const viewport = {
    x: 0,
    y: 0,
    width: layout.profile.dimensions.width,
    height: layout.profile.dimensions.height,
  };
  const projections: CinematicSubjectProjection[] = [
    deviceSubject({
      deviceId: layout.deviceId,
      subjectId: "body",
      rect: viewport,
    }),
    deviceSubject({
      deviceId: layout.deviceId,
      subjectId: "screen",
      rect: viewport,
    }),
  ];
  const keyboard = layout.inputProjection?.surface;
  if (keyboard?.visible && keyboard.viewportInset > 0) {
    projections.push(
      deviceSubject({
        deviceId: layout.deviceId,
        subjectId: "keyboard",
        rect: {
          x: 0,
          y: viewport.height - keyboard.viewportInset,
          width: viewport.width,
          height: keyboard.viewportInset,
        },
      }),
    );
  }
  for (const [name, rect] of Object.entries(
    layout.notificationProjection?.anchors ?? {},
  )) {
    if (!rect) continue;
    projections.push(
      deviceSubject({
        deviceId: layout.deviceId,
        subjectId: `notification.${name}`,
        rect,
      }),
    );
  }
  for (const [name, rect] of Object.entries(
    layout.systemSurfaceProjection?.anchors ?? {},
  )) {
    projections.push(
      deviceSubject({
        deviceId: layout.deviceId,
        subjectId: name,
        rect,
      }),
    );
  }
  return projections;
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
    (node) =>
      node.source.kind === "device" &&
      node.source.deviceId === input.layout.deviceId,
  );
  if (!stageNode) {
    throw new Error(
      `No evaluated stage node owns device "${input.layout.deviceId}".`,
    );
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
  const localSubjects: LocalCinematicSubject[] = projections.map(
    (projection) => {
      if (projection.coordinateSpace !== "device-screen") {
        throw new Error(
          `Subject "${projection.provenance.regionId}" uses unsupported ${projection.coordinateSpace} geometry without an explicit transform.`,
        );
      }
      return {
        ref: projection.ref,
        localRect: projection.rect,
        nodeId: stageNode.id,
        visible: projection.visible,
        clippedLocalRect: projection.clippedRect,
        sourceVersion: projection.sourceVersion,
        provenance: projection.provenance,
      };
    },
  );
  return {
    frame: input.frame,
    subjects: projectCinematicSubjects(input.stage, localSubjects),
  };
}
