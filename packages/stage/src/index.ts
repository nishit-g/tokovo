export {
  IDENTITY_STAGE_MATRIX,
  multiplyStageMatrices,
  applyStageMatrix,
  transformStageRect,
} from "./matrix.js";
export { prepareStageProgram, StagePreparationError } from "./program.js";
export { evaluateStageFrame, projectCinematicSubjects } from "./evaluate.js";
export type {
  StageDiagnostic,
  PreparedStageProgram,
  EvaluatedStageNode,
  EvaluatedStageFrame,
  LocalCinematicSubject,
  StageProjectedCinematicSubject,
} from "./types.js";
