import type { RuntimeEvent } from "../types/runtime-event.js";

export interface TypedKeyboardPlan {
  ok: boolean;
  reason?:
    | "empty_text"
    | "insufficient_window"
    | "invalid_submit_time"
    | "invalid_context";
  events: RuntimeEvent[];
  keyboardShowAt?: number;
  typeStartAt?: number;
  returnPressAt?: number;
  keyboardHideAt?: number;
  charDelay?: number;
}

export interface PlanTypedKeyboardParams {
  deviceId: string;
  submitAt: number;
  text: string;
  requestedCharDelay?: number;
  notBeforeFrame?: number;
  keyboardType?: string;
  returnKeyType?: string;
  showLeadFrames?: number;
  typeEndBeforeSubmitFrames?: number;
  returnPressLeadFrames?: number;
  returnPressDurationFrames?: number;
  hideAfterSubmitFrames?: number;
}

function clampFrame(frame: number): number {
  return Math.max(0, Math.round(frame));
}

/**
 * Create a deterministic, context-bounded keyboard animation plan for `typed: true`.
 *
 * Invariants we enforce:
 * - Keyboard events never occur before `notBeforeFrame`
 * - We only emit KEYBOARD_TYPE if the full text can be animated within the available window
 *   (so UI components using getTypedTextProgress don't show truncated drafts).
 */
export function planTypedKeyboard(
  params: PlanTypedKeyboardParams,
): TypedKeyboardPlan {
  const submitAt = clampFrame(params.submitAt);
  if (!Number.isFinite(submitAt)) {
    return { ok: false, reason: "invalid_submit_time", events: [] };
  }

  const text = params.text ?? "";
  if (!text) return { ok: false, reason: "empty_text", events: [] };

  const notBeforeFrame = clampFrame(params.notBeforeFrame ?? 0);
  const safeNotBefore = Math.min(notBeforeFrame, submitAt);

  const showLeadFrames = clampFrame(params.showLeadFrames ?? 3);
  const desiredTypeEndBeforeSubmitFrames = clampFrame(
    params.typeEndBeforeSubmitFrames ?? 5,
  );
  const desiredReturnPressLeadFrames = clampFrame(
    params.returnPressLeadFrames ?? 3,
  );
  const returnPressDurationFrames = clampFrame(
    params.returnPressDurationFrames ?? 4,
  );
  const hideAfterSubmitFrames = clampFrame(params.hideAfterSubmitFrames ?? 12);

  const textLen = Math.max(1, text.length);
  const maxFrameGap = Math.max(0, submitAt - safeNotBefore);
  const typeEndBeforeSubmitFrames = Math.min(
    desiredTypeEndBeforeSubmitFrames,
    Math.max(0, maxFrameGap - 1),
  );
  const returnPressLeadFrames = Math.min(
    desiredReturnPressLeadFrames,
    maxFrameGap,
  );
  const availableFrames = submitAt - typeEndBeforeSubmitFrames - safeNotBefore;

  // Can't animate typing without starting before the allowed context window.
  if (availableFrames <= 0) {
    return { ok: false, reason: "insufficient_window", events: [] };
  }

  const requestedCharDelay = Math.max(
    1,
    Math.round(params.requestedCharDelay ?? 3),
  );

  // Allow fractional charDelay (chars per frame > 1) to keep typing bounded to the context window.
  // This avoids early keyboard, and avoids truncating the draft text in apps that use typed progress.
  const maxCharDelayThatFits = availableFrames / textLen;
  const effectiveCharDelay = Math.min(requestedCharDelay, maxCharDelayThatFits);

  const typeDuration = textLen * effectiveCharDelay;
  const typeStartRaw = submitAt - typeEndBeforeSubmitFrames - typeDuration;
  const typeStartAt = Math.max(safeNotBefore, clampFrame(typeStartRaw));
  const effectiveShowLeadFrames = Math.min(
    showLeadFrames,
    Math.max(0, typeStartAt - safeNotBefore),
  );

  const keyboardShowAt = clampFrame(
    Math.max(typeStartAt - effectiveShowLeadFrames, safeNotBefore),
  );
  const returnPressAt = clampFrame(
    Math.max(submitAt - returnPressLeadFrames, safeNotBefore),
  );
  const keyboardHideAt = clampFrame(submitAt + hideAfterSubmitFrames);

  const events: RuntimeEvent[] = [
    {
      at: keyboardShowAt,
      kind: "DEVICE",
      type: "KEYBOARD_SHOW",
      deviceId: params.deviceId,
      payload: {
        keyboardType: params.keyboardType,
        returnKeyType: params.returnKeyType,
      },
    } as unknown as RuntimeEvent,
    {
      at: typeStartAt,
      kind: "DEVICE",
      type: "KEYBOARD_TYPE",
      deviceId: params.deviceId,
      payload: { text, charDelay: effectiveCharDelay },
    } as unknown as RuntimeEvent,
    {
      at: returnPressAt,
      kind: "DEVICE",
      type: "KEYBOARD_KEY_PRESS",
      deviceId: params.deviceId,
      payload: { key: "return", duration: returnPressDurationFrames },
    } as unknown as RuntimeEvent,
    {
      at: keyboardHideAt,
      kind: "DEVICE",
      type: "KEYBOARD_HIDE",
      deviceId: params.deviceId,
      payload: {},
    } as unknown as RuntimeEvent,
  ];

  return {
    ok: true,
    events,
    keyboardShowAt,
    typeStartAt,
    returnPressAt,
    keyboardHideAt,
    charDelay: effectiveCharDelay,
  };
}
