import type {
  CameraEffect,
  AnimateParams,
  FocusParams,
  ShakeParams,
  ResetParams,
  ZoomParams,
} from "./types";

interface CameraPointBuilder {
  at(time: string): CameraPointBuilder;
  focus(anchor: string, options?: Record<string, unknown>): CameraPointBuilder;
  animate(options: Record<string, unknown>): CameraPointBuilder;
  shake(options: Record<string, unknown>): CameraPointBuilder;
  reset(options?: Record<string, unknown>): CameraPointBuilder;
  zoom(options?: Record<string, unknown>): CameraPointBuilder;
}

export function applyCameraEffects(
  cam: CameraPointBuilder,
  effects: readonly CameraEffect[],
): void {
  const framesToTime = (frames: number, fps: number = 30): string => {
    const seconds = frames / fps;
    return `${seconds.toFixed(2)}s`;
  };

  for (const effect of effects) {
    const time = framesToTime(effect.timestamp);

    switch (effect.type) {
      case "focus": {
        const params = effect.params as FocusParams;
        cam.at(time).focus(params.anchor, {
          scale: params.scale,
          duration: params.duration ? `${params.duration}s` : undefined,
          easing: params.easing,
        });
        break;
      }

      case "animate": {
        const params = effect.params as AnimateParams;
        cam.at(time).animate({
          x: params.x,
          y: params.y,
          scale: params.scale,
          rotation: params.rotation,
          duration: params.duration ? `${params.duration}s` : undefined,
          easing: params.easing,
        });
        break;
      }

      case "shake": {
        const params = effect.params as ShakeParams;
        cam.at(time).shake({
          intensityX: params.intensityX,
          intensityY: params.intensityY,
          frequency: params.frequency,
          decay: params.decay,
          duration: `${params.duration}s`,
        });
        break;
      }

      case "reset": {
        const params = effect.params as ResetParams;
        cam.at(time).reset({
          duration: params.duration ? `${params.duration}s` : undefined,
          easing: params.easing,
        });
        break;
      }

      case "zoom": {
        const params = effect.params as ZoomParams;
        cam.at(time).zoom({
          scale: params.scale,
          duration: params.duration ? `${params.duration}s` : undefined,
          easing: params.easing,
        });
        break;
      }

      default:
        console.warn(
          `[applyCameraEffects] Unsupported effect type: ${effect.type}`,
        );
    }
  }
}
