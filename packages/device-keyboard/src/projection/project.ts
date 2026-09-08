import {
  getInputDisplayDraft,
  inferTextDirection,
  sliceGraphemes,
  type InputProjection,
  type PreparedInputOperation,
  type PreparedInputProgram,
  type PreparedInputSession,
} from "../contract/index.js";
import { evaluateInputSession } from "../runtime/evaluate.js";
import { resolveInputExperience } from "../experience/index.js";

const experiences = new WeakMap<PreparedInputSession, ReturnType<typeof resolveInputExperience>>();
function sessionExperience(session: PreparedInputSession) {
  let experience = experiences.get(session);
  if (!experience) {
    experience = resolveInputExperience({ platform: session.keyboard.platform, appearance: session.keyboard.appearance, locale: session.keyboard.locale.tag, platformProfileId: session.keyboard.platformProfileId, preferences: session.keyboard.visualPreferences });
    experiences.set(session, experience);
  }
  return experience;
}

export interface InputProjectionConfig {
  fps: number;
  viewportWidth: number;
  viewportHeight: number;
  keyboardHeight: number;
  transitionDurationFrames?: number;
}

/** Resolve the session whose keyboard surface is active or deterministically exiting. */
export function findInputSessionForProjection(
  program: PreparedInputProgram,
  deviceId: string,
  frame: number,
  fps: number,
): PreparedInputSession | undefined {
  return program.sessions.findLast((session) => {
    if (session.deviceId !== deviceId || frame < session.startFrame) return false;
    const experience = sessionExperience(session);
    const exitFrames = Math.max(1, Math.round(experience.theme.motion.exitDurationSeconds * fps));
    return frame <= session.endFrame + exitFrames;
  });
}

function easeOutCubic(value: number): number {
  return 1 - Math.pow(1 - value, 3);
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function getSurfaceProgress(
  session: PreparedInputSession,
  frame: number,
  duration: number,
  exitDuration: number,
): number {
  if (frame < session.startFrame) return 0;
  if (frame >= session.endFrame) {
    const entered = easeOutCubic(clamp01((session.endFrame - session.startFrame) / duration));
    return entered * (1 - easeOutCubic(clamp01((frame - session.endFrame) / exitDuration)));
  }
  if (frame < session.startFrame + duration) {
    return easeOutCubic(clamp01((frame - session.startFrame) / Math.max(1, duration)));
  }
  return 1;
}

function operationKey(
  operation: PreparedInputOperation,
  session: PreparedInputSession,
): { key: string; duration: number } | undefined {
  switch (operation.type) {
    case "insert":
      return operation.key
        ? {
            key: operation.key,
            duration: operation.keyPressDurationFrames ?? 1,
          }
        : undefined;
    case "deleteBackward":
      return {
        key: "backspace",
        duration: operation.keyPressDurationFrames ?? 1,
      };
    case "compositionUpdate":
      return operation.key
        ? {
            key: operation.key,
            duration: operation.keyPressDurationFrames ?? 1,
          }
        : undefined;
    case "chooseSuggestion":
      return {
        key: `suggestion:${operation.index}`,
        duration: operation.keyPressDurationFrames ?? 1,
      };
    case "submit":
      return {
        key: session.keyboard.returnKey,
        duration: operation.keyPressDurationFrames ?? 1,
      };
    default:
      return undefined;
  }
}

const keyOperations = new WeakMap<PreparedInputSession, readonly PreparedInputOperation[]>();
function getActiveOperation(session: PreparedInputSession, frame: number): PreparedInputOperation | undefined {
  let operations = keyOperations.get(session);
  if (!operations) {
    operations = session.operations.filter((op) => operationKey(op, session)).sort((a, b) => a.at - b.at || a.sequence - b.sequence);
    keyOperations.set(session, operations);
  }
  let low = 0;
  let high = operations.length;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (operations[middle].at <= frame) low = middle + 1;
    else high = middle;
  }
  const operation = operations[low - 1];
  const key = operation && operationKey(operation, session);
  return operation && key && frame < operation.at + key.duration ? operation : undefined;
}

export function projectInputSession(
  session: PreparedInputSession,
  frame: number,
  config: InputProjectionConfig,
): InputProjection {
  if (!Number.isFinite(config.fps) || config.fps <= 0) {
    throw new Error("INPUT_INVALID_PROJECTION: fps must be greater than zero.");
  }
  if (config.viewportWidth <= 0 || config.viewportHeight <= 0 || config.keyboardHeight <= 0) {
    throw new Error(
      "INPUT_INVALID_PROJECTION: viewport and keyboard dimensions must be greater than zero.",
    );
  }

  const state = evaluateInputSession(session, frame);
  const experience = sessionExperience(session);
  const displayDraft = getInputDisplayDraft(state, session.keyboard.locale.tag);
  const direction =
    session.direction === "auto"
      ? inferTextDirection(displayDraft, session.keyboard.locale.direction)
      : session.direction;
  const transitionDuration =
    config.transitionDurationFrames ??
    Math.max(
      1,
      Math.round(
        config.fps * experience.theme.motion.entranceDurationSeconds,
      ),
    );
  const exitDuration = config.transitionDurationFrames ?? Math.max(1, Math.round(config.fps * experience.theme.motion.exitDurationSeconds));
  const progress = getSurfaceProgress(session, frame, transitionDuration, exitDuration);
  const viewportInset = config.keyboardHeight * progress;
  const beforeCursor = sliceGraphemes(displayDraft, 0, state.selection.focus, session.keyboard.locale.tag);
  const activeInsert = getActiveOperation(session, frame);
  const uppercase = activeInsert?.type === "insert" && /\p{Lu}/u.test(activeInsert.text)
    || session.keyboard.autocapitalization === "characters"
    || session.keyboard.autocapitalization === "words" && /(?:^|\s)$/u.test(beforeCursor)
    || session.keyboard.autocapitalization === "sentences" && /(?:^|[.!?]\s+)$/u.test(beforeCursor);

  return {
    sessionId: session.id,
    deviceId: session.deviceId,
    appInstanceId: session.appInstanceId,
    fieldId: session.fieldId,
    status: state.status,
    focused: state.focused,
    draft: state.draft,
    displayDraft,
    selection: { ...state.selection },
    composition: state.composition
      ? {
          range: { ...state.composition.range },
          text: state.composition.text,
        }
      : undefined,
    direction,
    locale: session.keyboard.locale,
    surface: {
      visible: progress > 0,
      progress,
      platform: session.keyboard.platform,
      layout: state.layout,
      family: session.keyboard.locale.keyboardFamily,
      appearance: session.keyboard.appearance,
      platformProfileId: session.keyboard.platformProfileId,
      theme: experience.theme,
      presentation: experience.presentation,
      returnKey: session.keyboard.returnKey,
      activeKey: activeInsert ? operationKey(activeInsert, session)?.key ?? null : null,
      uppercase,
      suggestions: [...state.suggestions],
      candidateMode: state.suggestions.length > 0 ? "suggestions" : "toolbar",
      activeSuggestionIndex: state.activeSuggestionIndex,
      viewportInset,
      bounds: {
        x: 0,
        y: config.viewportHeight - viewportInset,
        width: config.viewportWidth,
        height: viewportInset,
      },
    },
  };
}
