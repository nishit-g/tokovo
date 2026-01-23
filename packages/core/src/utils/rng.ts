/**
 * Seeded Random Number Generator
 *
 * Essential for deterministic video generation.
 * Uses a simple Mulberry32 algorithm.
 */

export class SeededRNG {
  private state: number;

  constructor(seed: number) {
    this.state = seed | 0;
  }

  next(): number {
    this.state = (this.state + 0x6d2b79f5) | 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }

  nextId(prefix = "id"): string {
    return `${prefix}_${Math.floor(this.next() * 0xffffffff)
      .toString(16)
      .padStart(8, "0")}`;
  }
}

let globalIdCounter = 0;

export function deterministicId(
  prefix: string,
  ...parts: (string | number)[]
): string {
  const partStr = parts.map((p) => String(p)).join("_");
  globalIdCounter++;
  return `${prefix}_${partStr}_${globalIdCounter}`;
}

export function hashBasedId(
  prefix: string,
  ...parts: (string | number)[]
): string {
  const str = parts.map((p) => String(p)).join("|");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return `${prefix}_${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

export function resetIdCounter(): void {
  globalIdCounter = 0;
}
