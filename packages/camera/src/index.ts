export {
  IDENTITY_MATRIX_3,
  multiplyMatrix3,
  translationMatrix3,
  scaleMatrix3,
  rotationMatrix3,
  invertMatrix3,
  applyMatrix3,
  cameraPoseToViewMatrix,
} from "./matrix.js";

export {
  solveComposer,
  minimumJerk,
  interpolateCameraPose,
} from "./composer.js";

export {
  CameraLensRegistry,
  createBuiltinCameraLensRegistry,
  createBuiltinCameraRegistries,
} from "./lenses.js";
export type { CameraRegistries } from "./lenses.js";

export {
  CameraFilterRegistry,
  createBuiltinCameraFilterRegistry,
} from "./filters.js";

export {
  CameraModifierRegistry,
  createBuiltinCameraModifierRegistry,
  applyCameraModifiers,
} from "./modifiers.js";

export {
  CameraPreparationError,
  prepareCameraPlan,
  getRigById,
} from "./program.js";

export { CameraEvaluationError, evaluateCameraOutput } from "./evaluate.js";
export { cinematicSubjectKey } from "./subjects.js";
export {
  createCameraProgramManifest,
  explainCameraProgramFrame,
  diffCameraPrograms,
  createCinematicSubjectManifest,
  explainEvaluatedCameraOutput,
} from "./diagnostics.js";
export type { CameraProgramManifest } from "./diagnostics.js";

export type {
  Matrix3,
  CameraPose2D,
  ResolvedCinematicSubject,
  CinematicSubjectFrame,
  CameraProjectionPass,
  CameraDiagnostic,
  CameraShotSegment,
  CameraTransitionTrace,
  CameraEvaluationTrace,
  PreparedCameraProgram,
  EvaluatedCameraOutput,
  LensModelContext,
  CameraLensModel,
  CameraFilterModel,
  CameraModifierResult,
  CameraModifierContext,
  CameraModifierModel,
  CameraEvaluationInput,
  CameraRigEvaluation,
} from "./types.js";
