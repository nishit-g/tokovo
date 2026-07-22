import { LayoutContext, TransitionLayoutState } from "../types.js";

export function computeTransitionLayout(
  ctx: LayoutContext,
): TransitionLayoutState {
  const { config } = ctx;
  const transitionConfig = config?.transition;
  if (!transitionConfig) {
    return {
      kind: "TRANSITION",
      deviceTranslateX: 0,
      deviceTranslateY: 0,
      deviceScale: 1,
      deviceRotation: 0,
      overlayOpacity: 0,
      meta: {},
    };
  }

  return {
    kind: "TRANSITION",
    deviceTranslateX: 0,
    deviceTranslateY: 0,
    deviceScale: transitionConfig.defaultScale,
    deviceRotation: 0,
    overlayOpacity: 0,
    meta: {},
  };
}
