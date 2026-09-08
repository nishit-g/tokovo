import {
  applyPreparedInputOperation,
  createInputRuntimeState,
  type InputRuntimeState,
  type PreparedInputProgram,
  type PreparedInputSession,
} from "../contract/index.js";

function compareOperations(
  left: PreparedInputSession["operations"][number],
  right: PreparedInputSession["operations"][number],
): number {
  return left.at - right.at || left.sequence - right.sequence;
}

interface InputEvaluationCheckpoint {
  /** Number of ordered operations already reflected in this state. */
  after: number;
  state: InputRuntimeState;
}

interface InputEvaluationIndex {
  operations: readonly PreparedInputSession["operations"][number][];
  stride: number;
  checkpoints: readonly InputEvaluationCheckpoint[];
}

const evaluationIndexes = new WeakMap<
  PreparedInputSession,
  InputEvaluationIndex
>();

function cloneState(state: InputRuntimeState): InputRuntimeState {
  return {
    ...state,
    selection: { ...state.selection },
    composition: state.composition
      ? { range: { ...state.composition.range }, text: state.composition.text }
      : undefined,
    suggestions: [...state.suggestions],
  };
}

function buildEvaluationIndex(
  session: PreparedInputSession,
): InputEvaluationIndex {
  const operations = [...session.operations].sort(compareOperations);
  // Keep at most ~256 retained snapshots. Long authored typing runs therefore
  // stay memory-bounded while every random-access lookup replays at most a
  // small stride instead of the entire input history.
  const stride = Math.max(1, Math.ceil(operations.length / 256));
  const checkpoints: InputEvaluationCheckpoint[] = [];
  let state = createInputRuntimeState(session);
  checkpoints.push({ after: 0, state });

  for (let index = 0; index < operations.length; index++) {
    state = applyPreparedInputOperation(
      state,
      operations[index],
      session.keyboard.locale.tag,
    );
    if ((index + 1) % stride === 0) {
      checkpoints.push({ after: index + 1, state });
    }
  }

  return { operations, stride, checkpoints };
}

function getEvaluationIndex(
  session: PreparedInputSession,
): InputEvaluationIndex {
  const existing = evaluationIndexes.get(session);
  if (existing) return existing;
  const created = buildEvaluationIndex(session);
  evaluationIndexes.set(session, created);
  return created;
}

function operationCountAtFrame(
  operations: InputEvaluationIndex["operations"],
  frame: number,
): number {
  let low = 0;
  let high = operations.length;
  while (low < high) {
    const middle = low + Math.floor((high - low) / 2);
    if (operations[middle].at <= frame) low = middle + 1;
    else high = middle;
  }
  return low;
}

export function evaluateInputSession(
  session: PreparedInputSession,
  frame: number,
): InputRuntimeState {
  if (!Number.isInteger(frame) || frame < 0) {
    throw new Error(
      `INPUT_INVALID_FRAME: evaluation frame must be a non-negative integer; received ${frame}.`,
    );
  }

  const index = getEvaluationIndex(session);
  const operationCount = operationCountAtFrame(index.operations, frame);
  const checkpointNumber = Math.floor(operationCount / index.stride);
  const checkpoint = index.checkpoints[checkpointNumber];
  let state = checkpoint.state;
  for (
    let operationIndex = checkpoint.after;
    operationIndex < operationCount;
    operationIndex++
  ) {
    const operation = index.operations[operationIndex];
    state = applyPreparedInputOperation(
      state,
      operation,
      session.keyboard.locale.tag,
    );
  }
  return cloneState(state);
}

/** Shares the binary-search index with replay, including reverse-frame seeking. */
export function lastInputOperationAtFrame(session: PreparedInputSession, frame: number) {
  const index = getEvaluationIndex(session);
  return index.operations[operationCountAtFrame(index.operations, frame) - 1];
}

export function evaluateInputProgram(
  program: PreparedInputProgram,
  frame: number,
): Readonly<Record<string, InputRuntimeState>> {
  return Object.fromEntries(
    program.sessions.map((session) => [
      session.id,
      evaluateInputSession(session, frame),
    ]),
  );
}

export function findActiveInputSession(
  program: PreparedInputProgram,
  deviceId: string,
  frame: number,
): PreparedInputSession | undefined {
  return program.sessions.find(
    (session) =>
      session.deviceId === deviceId &&
      frame >= session.startFrame &&
      frame <= session.endFrame,
  );
}

export function findInputSessionForField(
  program: PreparedInputProgram,
  appInstanceId: string,
  fieldId: string,
  frame: number,
): PreparedInputSession | undefined {
  return program.sessions.find(
    (session) =>
      session.appInstanceId === appInstanceId &&
      session.fieldId === fieldId &&
      frame >= session.startFrame &&
      frame <= session.endFrame,
  );
}
