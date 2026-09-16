import type { XState } from "./state.js";

export function xScrollOffset(state: XState, surface: string, targetId?: string): number {
  if (surface === "tweet") return state.scroll.tweetById[targetId ?? ""] ?? 0;
  if (surface === "profile") return state.scroll.profileById[targetId ?? ""] ?? 0;
  if (surface === "thread") return state.scroll.threadFromBottomById[targetId ?? ""] ?? 0;
  return state.scroll[surface as "timeline" | "messages" | "notifications"] ?? 0;
}

export function projectXMotion(state: XState, frame: number, reduced = false): XState {
  const motion = state.scrollMotion;
  if (
    !motion ||
    reduced ||
    frame >= motion.atFrame + motion.durationFrames ||
    motion.durationFrames === 0
  )
    return state;
  const progress = Math.max(0, Math.min(1, (frame - motion.atFrame) / motion.durationFrames));
  const value = motion.from + (motion.to - motion.from) * (1 - Math.pow(1 - progress, 3));
  const targetId = motion.targetId ?? "";
  if (["tweet", "profile", "thread"].includes(motion.surface) && !targetId)
    throw new Error("X_SCROLL_TARGET_REQUIRED");
  const scroll = { ...state.scroll };
  if (motion.surface === "tweet") scroll.tweetById = { ...scroll.tweetById, [targetId]: value };
  else if (motion.surface === "profile")
    scroll.profileById = { ...scroll.profileById, [targetId]: value };
  else if (motion.surface === "thread")
    scroll.threadFromBottomById = { ...scroll.threadFromBottomById, [targetId]: value };
  else scroll[motion.surface as "timeline" | "messages" | "notifications"] = value;
  return { ...state, scroll };
}
export function xRouteShift(
  state: XState,
  frame: number,
  width: number,
  duration: number,
  rtl: boolean,
) {
  if (!state.lastTransition || duration === 0) return 0;
  const progress = Math.max(0, Math.min(1, (frame - state.lastTransition.atFrame) / duration));
  return (
    (state.lastTransition.direction === "back" ? -1 : 1) *
    (rtl ? -1 : 1) *
    Math.pow(1 - progress, 3) *
    width
  );
}
export function xLayoutCacheHint(
  state: XState,
  frame: number,
  routeDuration: number,
  reduced: boolean,
): "static" | undefined {
  if (reduced) return "static";
  if (state.lastArrivalFrame !== undefined && frame < state.lastArrivalFrame + 12) return undefined;
  if (state.lastTransition && frame < state.lastTransition.atFrame + routeDuration)
    return undefined;
  if (state.scrollMotion && frame < state.scrollMotion.atFrame + state.scrollMotion.durationFrames)
    return undefined;
  return "static";
}
