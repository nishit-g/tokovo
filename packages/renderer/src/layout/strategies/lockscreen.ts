import type { LayoutContext, LockscreenLayoutState } from "../types.js";

export function computeLockscreenLayout(
  _ctx: LayoutContext,
): LockscreenLayoutState {
  return {
    kind: "LOCKSCREEN",
    meta: {},
  };
}
