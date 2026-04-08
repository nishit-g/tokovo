function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function getStableBoolean(seed: string): boolean {
  return hashString(seed) % 2 === 0;
}

export function getStableCount(seed: string, maxExclusive: number): number {
  if (maxExclusive <= 0) return 0;
  return hashString(seed) % maxExclusive;
}
