import { LayoutContext, TransitionLayoutState } from "../types";

export function computeTransitionLayout(
  ctx: LayoutContext,
): TransitionLayoutState {
  const { world, config } = ctx;
  const transitionConfig = config!.transition!;

  let deviceScale = transitionConfig.defaultScale;
  let deviceTranslateX = 0;
  let deviceTranslateY = 0;
  let deviceRotation = 0;
  let overlayOpacity = 0;

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
