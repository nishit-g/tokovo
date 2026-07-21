import { createSeededRng, hashBasedId } from "@tokovo/core";
import {
  applyPreparedInputOperation,
  countGraphemes,
  createInputRuntimeState,
  normalizeInputLocale,
  splitGraphemes,
  type AppInstanceId,
  type InputDirectionIntent,
  type InputKeyboardConfig,
  type InputReturnKey,
  type InputSelection,
  type InputSource,
  type KeyboardLayoutKind,
  type PreparedInputOperation,
  type PreparedInputProgram,
  type PreparedInputSession,
} from "../contract/index.js";

export type InputCadenceStyle = "slow" | "natural" | "fast";

export interface InputCadenceIntent {
  style?: InputCadenceStyle;
  framesPerGrapheme?: number;
  varianceFrames?: number;
  punctuationPauseFrames?: number;
  focusLeadFrames?: number;
  keyPressDurationFrames?: number;
}

export type InputScriptStep =
  | {
      type: "type";
      text: string;
      source?: Exclude<InputSource, "paste" | "voice">;
      cadence?: InputCadenceIntent;
    }
  | { type: "pause"; frames: number }
  | { type: "deleteBackward"; count?: number; intervalFrames?: number }
  | { type: "setSelection"; selection: InputSelection }
  | { type: "moveCursor"; position: number }
  | {
      type: "replaceRange";
      range: InputSelection;
      text: string;
      source?: InputSource;
    }
  | {
      type: "compose";
      updates: readonly string[];
      commit: string;
      intervalFrames?: number;
      keys?: readonly string[];
    }
  | { type: "setSuggestions"; suggestions: readonly string[] }
  | {
      type: "chooseSuggestion";
      index: number;
      text: string;
      replaceRange?: InputSelection;
    }
  | { type: "switchLayout"; layout: KeyboardLayoutKind }
  | { type: "paste"; text: string }
  | { type: "voice"; text: string };

export interface InputSessionIntent {
  id?: string;
  deviceId: string;
  appInstanceId: AppInstanceId;
  fieldId: string;
  fps: number;
  startFrame: number;
  endFrame?: number;
  submitAtFrame?: number;
  clearOnSubmit?: boolean;
  initialValue?: string;
  text?: string;
  script?: readonly InputScriptStep[];
  expectedFinalValue?: string;
  seed?: string | number;
  source?: InputSource;
  locale?: string;
  direction?: InputDirectionIntent;
  keyboard?: Partial<
    Omit<InputKeyboardConfig, "locale"> & { locale: string }
  >;
  cadence?: InputCadenceIntent;
}

interface ResolvedCadence {
  framesPerGrapheme: number;
  varianceFrames: number;
  punctuationPauseFrames: number;
  focusLeadFrames: number;
  keyPressDurationFrames: number;
}

type WithoutSequence<T> = T extends unknown ? Omit<T, "sequence"> : never;
type UnsequencedPreparedInputOperation =
  WithoutSequence<PreparedInputOperation>;

const STYLE_CADENCE_SECONDS: Record<
  InputCadenceStyle,
  { delay: number; variance: number }
> = {
  slow: { delay: 0.19, variance: 0.07 },
  natural: { delay: 0.115, variance: 0.045 },
  fast: { delay: 0.065, variance: 0.02 },
};

function assertFrame(name: string, frame: number): void {
  if (!Number.isInteger(frame) || frame < 0) {
    throw new Error(
      `INPUT_INVALID_FRAME: ${name} must be a non-negative integer; received ${frame}.`,
    );
  }
}

function assertIdentity(name: string, value: string): void {
  if (!value.trim()) {
    throw new Error(`INPUT_MISSING_IDENTITY: ${name} must not be empty.`);
  }
}

function resolveCadence(
  fps: number,
  input: InputCadenceIntent = {},
): ResolvedCadence {
  const style = input.style ?? "natural";
  const profile = STYLE_CADENCE_SECONDS[style];
  const framesPerGrapheme =
    input.framesPerGrapheme ?? Math.max(1, Math.round(profile.delay * fps));
  const varianceFrames =
    input.varianceFrames ?? Math.max(0, Math.round(profile.variance * fps));

  if (!Number.isFinite(framesPerGrapheme) || framesPerGrapheme <= 0) {
    throw new Error(
      "INPUT_INVALID_CADENCE: framesPerGrapheme must be greater than zero.",
    );
  }
  if (!Number.isFinite(varianceFrames) || varianceFrames < 0) {
    throw new Error(
      "INPUT_INVALID_CADENCE: varianceFrames must be zero or greater.",
    );
  }

  return {
    framesPerGrapheme,
    varianceFrames,
    punctuationPauseFrames:
      input.punctuationPauseFrames ?? Math.max(1, Math.round(0.12 * fps)),
    focusLeadFrames:
      input.focusLeadFrames ?? Math.max(1, Math.round(0.25 * fps)),
    keyPressDurationFrames:
      input.keyPressDurationFrames ?? Math.max(1, Math.round(0.1 * fps)),
  };
}

function isPunctuationPause(grapheme: string): boolean {
  return /[.!?…。！？،؛؟]$/u.test(grapheme);
}

function keyForGrapheme(grapheme: string): string {
  if (/^\s$/u.test(grapheme)) return grapheme === "\n" ? "return" : "space";
  const normalized = grapheme.normalize("NFD");
  const firstLetter = Array.from(normalized).find((value) => /\p{Letter}/u.test(value));
  return (firstLetter ?? grapheme).toLocaleLowerCase("und");
}

function validateIntent(intent: InputSessionIntent): void {
  assertIdentity("deviceId", intent.deviceId);
  assertIdentity("appInstanceId", intent.appInstanceId);
  assertIdentity("fieldId", intent.fieldId);
  assertFrame("startFrame", intent.startFrame);
  if (!Number.isFinite(intent.fps) || intent.fps <= 0) {
    throw new Error(`INPUT_INVALID_FPS: fps must be greater than zero.`);
  }
  if (intent.endFrame !== undefined) assertFrame("endFrame", intent.endFrame);
  if (intent.submitAtFrame !== undefined) {
    assertFrame("submitAtFrame", intent.submitAtFrame);
  }
  if (intent.text !== undefined && intent.script !== undefined) {
    throw new Error(
      "INPUT_AMBIGUOUS_INTENT: provide either text or script, not both.",
    );
  }
}

export function prepareInputSession(
  intent: InputSessionIntent,
): PreparedInputSession {
  validateIntent(intent);

  const locale = normalizeInputLocale(
    intent.keyboard?.locale ?? intent.locale ?? "en-US",
  );
  const source = intent.source ?? "softwareKeyboard";
  const keyboard: InputKeyboardConfig = {
    platform: intent.keyboard?.platform ?? "ios",
    locale,
    layout: intent.keyboard?.layout ?? "letters",
    returnKey: (intent.keyboard?.returnKey ?? "return") as InputReturnKey,
    appearance: intent.keyboard?.appearance ?? "light",
    themeId: intent.keyboard?.themeId ?? "system",
    autocapitalization: intent.keyboard?.autocapitalization ?? "sentences",
    autocorrection: intent.keyboard?.autocorrection ?? true,
  };
  const seed =
    intent.seed ??
    `${intent.deviceId}|${intent.appInstanceId}|${intent.fieldId}|${intent.startFrame}|${intent.text ?? "script"}`;
  const rng = createSeededRng(seed);
  const defaultCadence = resolveCadence(intent.fps, intent.cadence);
  const operations: PreparedInputOperation[] = [];
  let sequence = 0;
  let frame = intent.startFrame;

  const push = (
    operation: UnsequencedPreparedInputOperation,
  ): void => {
    operations.push({ ...operation, sequence: sequence++ } as PreparedInputOperation);
  };

  push({ type: "focus", at: frame });
  frame += defaultCadence.focusLeadFrames;

  const script: readonly InputScriptStep[] =
    intent.script ?? (intent.text !== undefined ? [{ type: "type", text: intent.text }] : []);

  for (const step of script) {
    switch (step.type) {
      case "type": {
        const cadence = resolveCadence(intent.fps, {
          ...intent.cadence,
          ...step.cadence,
        });
        for (const grapheme of splitGraphemes(step.text, locale.tag)) {
          push({
            type: "insert",
            at: frame,
            text: grapheme,
            key: keyForGrapheme(grapheme),
            source: step.source ?? source,
            keyPressDurationFrames: cadence.keyPressDurationFrames,
          });
          const centeredVariance = (rng.next() * 2 - 1) * cadence.varianceFrames;
          frame += Math.max(
            1,
            Math.round(cadence.framesPerGrapheme + centeredVariance),
          );
          if (isPunctuationPause(grapheme)) {
            frame += cadence.punctuationPauseFrames;
          }
        }
        break;
      }

      case "pause":
        assertFrame("pause.frames", step.frames);
        frame += step.frames;
        break;

      case "deleteBackward": {
        const count = step.count ?? 1;
        if (!Number.isInteger(count) || count <= 0) {
          throw new Error(
            "INPUT_INVALID_DELETE: deleteBackward count must be a positive integer.",
          );
        }
        const interval = step.intervalFrames ?? defaultCadence.framesPerGrapheme;
        for (let index = 0; index < count; index++) {
          push({
            type: "deleteBackward",
            at: frame,
            count: 1,
            keyPressDurationFrames: defaultCadence.keyPressDurationFrames,
          });
          frame += Math.max(1, interval);
        }
        break;
      }

      case "setSelection":
        push({ type: "setSelection", at: frame, selection: step.selection });
        frame += 1;
        break;

      case "moveCursor":
        push({ type: "moveCursor", at: frame, position: step.position });
        frame += 1;
        break;

      case "replaceRange":
        push({
          type: "replaceRange",
          at: frame,
          range: step.range,
          text: step.text,
          source: step.source ?? source,
        });
        frame += defaultCadence.framesPerGrapheme;
        break;

      case "compose": {
        push({ type: "compositionStart", at: frame });
        frame += 1;
        const interval = step.intervalFrames ?? defaultCadence.framesPerGrapheme;
        step.updates.forEach((text, index) => {
          push({
            type: "compositionUpdate",
            at: frame,
            text,
            key: step.keys?.[index] ?? "ime",
            keyPressDurationFrames: defaultCadence.keyPressDurationFrames,
          });
          frame += Math.max(1, interval);
        });
        push({ type: "compositionCommit", at: frame, text: step.commit });
        frame += Math.max(1, interval);
        break;
      }

      case "setSuggestions":
        push({
          type: "setSuggestions",
          at: frame,
          suggestions: [...step.suggestions],
        });
        frame += 1;
        break;

      case "chooseSuggestion":
        push({
          type: "chooseSuggestion",
          at: frame,
          index: step.index,
          text: step.text,
          replaceRange: step.replaceRange,
          keyPressDurationFrames: defaultCadence.keyPressDurationFrames,
        });
        frame += defaultCadence.framesPerGrapheme;
        break;

      case "switchLayout":
        push({ type: "switchLayout", at: frame, layout: step.layout });
        frame += 1;
        break;

      case "paste":
      case "voice":
        push({
          type: "insert",
          at: frame,
          text: step.text,
          key: step.type,
          source: step.type,
          keyPressDurationFrames: defaultCadence.keyPressDurationFrames,
        });
        frame += 1;
        break;
    }
  }

  if (intent.submitAtFrame !== undefined) {
    if (frame > intent.submitAtFrame) {
      throw new Error(
        `INPUT_TIMING_OVERFLOW: session needs operations through frame ${frame - 1}, ` +
          `but submitAtFrame is ${intent.submitAtFrame}. Start earlier, lengthen the span, ` +
          `or choose a faster cadence.`,
      );
    }
    frame = intent.submitAtFrame;
    push({
      type: "submit",
      at: frame,
      clearDraft: intent.clearOnSubmit ?? true,
      keyPressDurationFrames: defaultCadence.keyPressDurationFrames,
    });
    frame += Math.max(1, Math.round(intent.fps * 0.14));
  }

  const endFrame = intent.endFrame ?? frame + Math.max(1, Math.round(intent.fps * 0.18));
  if (endFrame < frame) {
    throw new Error(
      `INPUT_TIMING_OVERFLOW: endFrame ${endFrame} occurs before the prepared input ` +
        `operations finish at frame ${frame}.`,
    );
  }
  push({ type: "blur", at: endFrame });

  const session: PreparedInputSession = {
    version: "1",
    id:
      intent.id ??
      hashBasedId(
        "input",
        intent.deviceId,
        intent.appInstanceId,
        intent.fieldId,
        intent.startFrame,
      ),
    deviceId: intent.deviceId,
    appInstanceId: intent.appInstanceId,
    fieldId: intent.fieldId,
    source,
    direction: intent.direction ?? "auto",
    keyboard,
    initialValue: intent.initialValue ?? "",
    startFrame: intent.startFrame,
    endFrame,
    submitAtFrame: intent.submitAtFrame,
    clearOnSubmit: intent.clearOnSubmit ?? true,
    expectedFinalValue: intent.expectedFinalValue,
    operations,
  };

  if (intent.expectedFinalValue !== undefined) {
    let state = createInputRuntimeState(session);
    for (const operation of operations) {
      if (operation.type === "blur") break;
      state = applyPreparedInputOperation(state, operation, locale.tag);
    }
    const finalValue = state.submittedValue ?? state.draft;
    if (finalValue !== intent.expectedFinalValue) {
      throw new Error(
        `INPUT_FINAL_VALUE_MISMATCH: prepared session produced ${JSON.stringify(finalValue)} ` +
          `instead of ${JSON.stringify(intent.expectedFinalValue)}.`,
      );
    }
  }

  return session;
}

export function estimateNaturalInputFrames(
  text: string,
  fps: number,
  cadence?: InputCadenceIntent,
  locale = "en-US",
): number {
  const resolved = resolveCadence(fps, cadence);
  return splitGraphemes(text, normalizeInputLocale(locale).tag).reduce(
    (total, grapheme) =>
      total +
      resolved.framesPerGrapheme +
      (isPunctuationPause(grapheme) ? resolved.punctuationPauseFrames : 0),
    resolved.focusLeadFrames,
  );
}

export function countInputGraphemes(text: string, locale = "en-US"): number {
  return countGraphemes(text, normalizeInputLocale(locale).tag);
}

export function prepareInputProgram(
  intents: readonly InputSessionIntent[],
): PreparedInputProgram {
  const sessions = intents
    .map(prepareInputSession)
    .sort(
      (left, right) =>
        left.startFrame - right.startFrame || left.id.localeCompare(right.id),
    );
  const previousByDevice = new Map<string, PreparedInputSession>();

  for (const session of sessions) {
    const previous = previousByDevice.get(session.deviceId);
    if (previous && session.startFrame <= previous.endFrame) {
      throw new Error(
        `INPUT_SESSION_CONFLICT: sessions "${previous.id}" and "${session.id}" overlap ` +
          `on device "${session.deviceId}" at frame ${session.startFrame}. ` +
          `A device may have only one active input session.`,
      );
    }
    previousByDevice.set(session.deviceId, session);
  }

  return { version: "1", sessions };
}
