import type {
  PreparedInputOperation,
  PreparedInputProgram,
  PreparedInputSession,
} from "../contract/index.js";

export type InputAudioCueKind =
  | "key"
  | "delete"
  | "layout"
  | "suggestion"
  | "submit";

export interface InputAudioCue {
  id: string;
  deviceId: string;
  sessionId: string;
  at: number;
  kind: InputAudioCueKind;
}

function getCueKind(
  session: PreparedInputSession,
  operation: PreparedInputOperation,
): InputAudioCueKind | null {
  switch (operation.type) {
    case "insert":
      return operation.source === "softwareKeyboard" ? "key" : null;
    case "compositionUpdate":
      return "key";
    case "deleteBackward":
      return "delete";
    case "switchLayout":
      return "layout";
    case "chooseSuggestion":
      return "suggestion";
    case "submit":
      return session.keyboard.returnKey ? "submit" : null;
    default:
      return null;
  }
}

/**
 * Project immutable key audio cues from the same prepared operations that
 * drive draft state and key highlights. This remains correct under direct or
 * random-order frame rendering because it has no playback history.
 */
export function projectInputAudioCues(
  program: PreparedInputProgram | undefined,
): InputAudioCue[] {
  if (!program) return [];

  return program.sessions
    .flatMap((session) =>
      session.operations.flatMap((operation) => {
        const kind = getCueKind(session, operation);
        return kind
          ? [
              {
                id: `${session.id}:${operation.sequence}`,
                deviceId: session.deviceId,
                sessionId: session.id,
                at: operation.at,
                kind,
              } satisfies InputAudioCue,
            ]
          : [];
      }),
    )
    .sort((left, right) => left.at - right.at || left.id.localeCompare(right.id));
}
