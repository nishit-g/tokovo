import type {
  CameraRectIR,
  CinematicSubjectRefIR,
  CinematicSubjectSchemaIR,
} from "@tokovo/ir";
import type { WorldState } from "./world-state.js";

/** Exact app/device geometry emitted from the same headless layout that paints the UI. */
export interface CinematicSubjectProjection {
  ref: CinematicSubjectRefIR;
  rect: CameraRectIR;
  coordinateSpace: "app-logical" | "device-screen";
  visible: boolean;
  clippedRect?: CameraRectIR;
  sourceVersion: number;
  provenance: {
    ownerId: string;
    regionId: string;
  };
}

export interface CinematicSubjectProvider {
  ownerId: string;
  schema: CinematicSubjectSchemaIR;
  project(
    world: WorldState,
    layout: unknown,
    deviceId: string,
  ): readonly CinematicSubjectProjection[];
}
