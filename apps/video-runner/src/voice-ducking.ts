export type VoiceDuckingRange = {
  startFrame: number;
  endFrame: number;
};

export type VoiceDuckingConfig = {
  duckAmount: number;
  attack: number;
  release: number;
};

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

  let duckAmount = config.duckAmount;

  if (frame < range.startFrame + config.attack && config.attack > 0) {
    const progress = (frame - range.startFrame) / config.attack;
    duckAmount = 1 - (1 - config.duckAmount) * progress;
  }

  if (frame > range.endFrame && config.release > 0) {
    const releaseProgress = (frame - range.endFrame) / config.release;
    duckAmount =
      config.duckAmount +
      (1 - config.duckAmount) * Math.min(1, releaseProgress);
  }

  return duckAmount;
}

function upperBoundByStartFrame(
  ranges: VoiceDuckingRange[],
  frame: number,
): number {
  let low = 0;
  let high = ranges.length;

  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (ranges[mid].startFrame <= frame) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }

  return low;
}

export function computeVoiceDuckMultiplierAtFrame(
  frame: number,
  sortedRanges: VoiceDuckingRange[],
  config: VoiceDuckingConfig = DEFAULT_VOICE_DUCKING_CONFIG,
): number {
  if (sortedRanges.length === 0) {
    return 1;
  }

  let duckMultiplier = 1;
  const startIndex = upperBoundByStartFrame(sortedRanges, frame) - 1;

  for (let i = startIndex; i >= 0; i -= 1) {
    const range = sortedRanges[i];
    if (range.endFrame + config.release < frame) {
      break;
    }

    duckMultiplier = Math.min(
      duckMultiplier,
      getDuckAmountForRange(frame, range, config),
    );

    if (duckMultiplier <= config.duckAmount) {
      break;
    }
  }

  return duckMultiplier;
}
