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

export function evaluateInputSession(
  session: PreparedInputSession,
  frame: number,
): InputRuntimeState {
  if (!Number.isInteger(frame) || frame < 0) {
    throw new Error(
      `INPUT_INVALID_FRAME: evaluation frame must be a non-negative integer; received ${frame}.`,
    );
  }

  let state = createInputRuntimeState(session);
  const operations = [...session.operations].sort(compareOperations);
  for (const operation of operations) {
    if (operation.at > frame) break;
    state = applyPreparedInputOperation(
      state,
      operation,
      session.keyboard.locale.tag,
    );
  }
  return state;
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
