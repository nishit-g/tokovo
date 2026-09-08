export interface VoiceDuckingRange {
  startFrame: number;
  endFrame: number;
}

export interface VoiceDuckingConfig {
  duckAmount: number;
  attack: number;
  release: number;
}

export const DEFAULT_VOICE_DUCKING_CONFIG: VoiceDuckingConfig = {
  duckAmount: 0.15,
  attack: 5,
  release: 40,
};

function getDuckAmountForRange(
  frame: number,
  range: VoiceDuckingRange,
  config: VoiceDuckingConfig,
): number {
  if (frame < range.startFrame || frame > range.endFrame + config.release) {
    return 1;
  }
  if (frame < range.startFrame + config.attack && config.attack > 0) {
    const progress = (frame - range.startFrame) / config.attack;
    return 1 - (1 - config.duckAmount) * progress;
  }
  if (frame > range.endFrame && config.release > 0) {
    const releaseProgress = (frame - range.endFrame) / config.release;
    return (
      config.duckAmount +
      (1 - config.duckAmount) * Math.min(1, releaseProgress)
    );
  }
  return config.duckAmount;
}

function upperBoundByStartFrame(
  ranges: readonly VoiceDuckingRange[],
  frame: number,
): number {
  let low = 0;
  let high = ranges.length;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    const range = ranges[mid];
    if (range && range.startFrame <= frame) low = mid + 1;
    else high = mid;
  }
  return low;
}

export function computeVoiceDuckMultiplierAtFrame(
  frame: number,
  sortedRanges: readonly VoiceDuckingRange[],
  config: VoiceDuckingConfig = DEFAULT_VOICE_DUCKING_CONFIG,
): number {
  if (sortedRanges.length === 0) return 1;
  let duckMultiplier = 1;
  const startIndex = upperBoundByStartFrame(sortedRanges, frame) - 1;
  for (let index = startIndex; index >= 0; index -= 1) {
    const range = sortedRanges[index];
    if (!range) continue;
    if (range.endFrame + config.release < frame) break;
    duckMultiplier = Math.min(
      duckMultiplier,
      getDuckAmountForRange(frame, range, config),
    );
    if (duckMultiplier <= config.duckAmount) break;
  }
  return duckMultiplier;
}
