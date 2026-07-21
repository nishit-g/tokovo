import {
  getInputDisplayDraft,
  inferTextDirection,
  type InputProjection,
  type PreparedInputOperation,
  type PreparedInputProgram,
  type PreparedInputSession,
} from "../contract/index.js";
import { evaluateInputSession } from "../runtime/evaluate.js";
import { resolveInputExperience } from "../experience/index.js";

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
  return program.sessions.find((session) => {
    if (session.deviceId !== deviceId || frame < session.startFrame) return false;
    const experience = resolveInputExperience({
      platform: session.keyboard.platform,
      appearance: session.keyboard.appearance,
      locale: session.keyboard.locale.tag,
      themeId: session.keyboard.themeId,
    });
    const exitFrames = Math.max(
      1,
      Math.round(experience.theme.motion.exitDurationSeconds * fps),
    );
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
): number {
  if (frame < session.startFrame) return 0;
  if (frame < session.startFrame + duration) {
    return easeOutCubic(
      clamp01((frame - session.startFrame) / Math.max(1, duration)),
    );
  }
  if (frame < session.endFrame) return 1;
  if (frame < session.endFrame + duration) {
    return 1 - easeOutCubic(
      clamp01((frame - session.endFrame) / Math.max(1, duration)),
    );
  }
  return 0;
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

function getActiveKey(
  session: PreparedInputSession,
  frame: number,
): string | null {
  let active: { key: string; at: number; sequence: number } | undefined;
  for (const operation of session.operations) {
    if (operation.at > frame) continue;
    const resolved = operationKey(operation, session);
    if (!resolved || frame >= operation.at + resolved.duration) continue;
    if (
      !active ||
      operation.at > active.at ||
      (operation.at === active.at && operation.sequence > active.sequence)
    ) {
      active = {
        key: resolved.key,
        at: operation.at,
        sequence: operation.sequence,
      };
    }
  }
  return active?.key ?? null;
}

export function projectInputSession(
  session: PreparedInputSession,
  frame: number,
  config: InputProjectionConfig,
): InputProjection {
  if (!Number.isFinite(config.fps) || config.fps <= 0) {
    throw new Error("INPUT_INVALID_PROJECTION: fps must be greater than zero.");
  }
  if (
    config.viewportWidth <= 0 ||
    config.viewportHeight <= 0 ||
    config.keyboardHeight <= 0
  ) {
    throw new Error(
      "INPUT_INVALID_PROJECTION: viewport and keyboard dimensions must be greater than zero.",
    );
  }

  const state = evaluateInputSession(session, frame);
  const displayDraft = getInputDisplayDraft(
    state,
    session.keyboard.locale.tag,
  );
  const direction =
    session.direction === "auto"
      ? inferTextDirection(displayDraft, session.keyboard.locale.direction)
      : session.direction;
  const transitionDuration =
    config.transitionDurationFrames ??
    Math.max(
      1,
      Math.round(
        config.fps *
          resolveInputExperience({
            platform: session.keyboard.platform,
            appearance: session.keyboard.appearance,
            locale: session.keyboard.locale.tag,
            themeId: session.keyboard.themeId,
          }).theme.motion.entranceDurationSeconds,
      ),
    );
  const progress = getSurfaceProgress(
    session,
    frame,
    transitionDuration,
  );
  const viewportInset = config.keyboardHeight * progress;
  const experience = resolveInputExperience({
    platform: session.keyboard.platform,
    appearance: session.keyboard.appearance,
    locale: session.keyboard.locale.tag,
    themeId: session.keyboard.themeId,
  });

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
      themeId: session.keyboard.themeId,
      theme: experience.theme,
      presentation: experience.presentation,
      returnKey: session.keyboard.returnKey,
      activeKey: getActiveKey(session, frame),
      suggestions: [...state.suggestions],
      activeSuggestionIndex: state.activeSuggestionIndex,
      viewportInset,
      anchor: {
        x: 0,
        y: config.viewportHeight - viewportInset,
        width: config.viewportWidth,
        height: viewportInset,
      },
    },
  };
}
