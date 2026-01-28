import { useMemo } from "react";
import { spring, interpolate } from "remotion";
import type { AnimationState } from "../runtime/selectors";
import type { NotificationTokens } from "../tokens/types";

interface AnimationValues {
  translateY: number;
  opacity: number;
  scale: number;
}

interface AnimationOptions {
  stackIndex?: number;
  stackOffset?: number;
  fps?: number;
  frame?: number;
}

export function useNotificationAnimation(
  animationState: AnimationState,
  animationProgress: number,
  tokens: NotificationTokens,
  options?: AnimationOptions,
): AnimationValues {
  const { stackIndex = 0, stackOffset = 0, fps = 30, frame } = options ?? {};
  const { animation } = tokens;

  return useMemo(() => {
    if (frame !== undefined && fps) {
      const springConfig = { damping: 20, stiffness: 200 };

      switch (animationState) {
        case "entering": {
          const enterSpring = spring({
            frame: Math.round(animationProgress * animation.enterDuration),
            fps,
            config: springConfig,
            durationInFrames: animation.enterDuration,
          });

          return {
            translateY: interpolate(
              enterSpring,
              [0, 1],
              [animation.enterTranslateY, 0],
            ),
            opacity: enterSpring,
            scale: interpolate(enterSpring, [0, 1], [animation.enterScale, 1]),
          };
        }

        case "visible": {
          const targetScale = 1 - stackIndex * animation.stackScaleDecay;
          return {
            translateY: 0,
            opacity: 1,
            scale: targetScale,
          };
        }

        case "exiting": {
          const exitSpring = spring({
            frame: Math.round(animationProgress * animation.exitDuration),
            fps,
            config: { damping: 200 },
            durationInFrames: animation.exitDuration,
          });

          return {
            translateY: interpolate(
              exitSpring,
              [0, 1],
              [0, animation.exitTranslateY],
            ),
            opacity: 1 - exitSpring,
            scale: 1,
          };
        }

        case "dismissed":
          return { translateY: 0, opacity: 0, scale: 1 };
      }
    }

    switch (animationState) {
      case "entering":
        return {
          translateY: animation.enterTranslateY * (1 - animationProgress),
          opacity: animationProgress,
          scale:
            animation.enterScale +
            (1 - animation.enterScale) * animationProgress,
        };
      case "visible":
        return {
          translateY: 0,
          opacity: 1,
          scale: 1 - stackIndex * animation.stackScaleDecay,
        };
      case "exiting":
        return {
          translateY: animation.exitTranslateY * animationProgress,
          opacity: 1 - animationProgress,
          scale: 1,
        };
      case "dismissed":
        return { translateY: 0, opacity: 0, scale: 1 };
    }
  }, [
    animationState,
    animationProgress,
    stackIndex,
    frame,
    fps,
    animation.enterTranslateY,
    animation.exitTranslateY,
    animation.enterScale,
    animation.enterDuration,
    animation.exitDuration,
    animation.stackScaleDecay,
  ]);
}
