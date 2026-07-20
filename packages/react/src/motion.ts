const TAU = Math.PI * 2;

export function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function frameProgress(frame: number, startFrame: number, durationInFrames: number): number {
  if (durationInFrames <= 0) return frame >= startFrame ? 1 : 0;
  return clamp01((frame - startFrame) / durationInFrames);
}

export function easeOutCubic(progress: number): number {
  const p = clamp01(progress);
  return 1 - Math.pow(1 - p, 3);
}

export function easeInOutSine(progress: number): number {
  const p = clamp01(progress);
  return -(Math.cos(Math.PI * p) - 1) / 2;
}

export function loopProgress(
  frame: number,
  fps: number,
  durationSeconds: number,
  delaySeconds = 0,
): number {
  const durationInFrames = Math.max(1, durationSeconds * Math.max(1, fps));
  const delayedFrame = frame - delaySeconds * Math.max(1, fps);
  return (
    (((delayedFrame % durationInFrames) + durationInFrames) % durationInFrames) / durationInFrames
  );
}

export function pulse(
  frame: number,
  fps: number,
  durationSeconds: number,
  delaySeconds = 0,
): number {
  return 0.5 - 0.5 * Math.cos(loopProgress(frame, fps, durationSeconds, delaySeconds) * TAU);
}

export function triangleWave(
  frame: number,
  fps: number,
  durationSeconds: number,
  delaySeconds = 0,
): number {
  const progress = loopProgress(frame, fps, durationSeconds, delaySeconds);
  return progress < 0.5 ? progress * 2 : (1 - progress) * 2;
}
