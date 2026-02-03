import { LayoutContext, TransitionLayoutState } from "../types";

export function computeTransitionLayout(
  ctx: LayoutContext,
): TransitionLayoutState {
  const { world, config } = ctx;
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

  let deviceScale = transitionConfig.defaultScale;
  let deviceTranslateX = 0;
  let deviceTranslateY = 0;
  let deviceRotation = 0;
  const overlayOpacity = 0;

  if (world.camera?.baseView === "TRANSITION") {
    const transform = world.camera.transform;
    if (transform) {
      deviceScale = transform.scale ?? deviceScale;
      deviceTranslateX = transform.translateX ?? 0;
      deviceTranslateY = transform.translateY ?? 0;
      deviceRotation = transform.rotation ?? 0;
    }
  }

  return {
    kind: "TRANSITION",
    deviceTranslateX,
    deviceTranslateY,
    deviceScale,
    deviceRotation,
    overlayOpacity,
    meta: {},
  };
}
