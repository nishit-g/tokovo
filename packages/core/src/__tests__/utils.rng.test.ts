import { describe, expect, it } from "vitest";
import {
  SeededRNG,
  createSeededRng,
  deterministicId,
  hashBasedId,
  resetIdCounter,
  seedFromString,
} from "../utils/rng";

describe("rng utilities", () => {
  it("produces deterministic sequences", () => {
    const rng1 = new SeededRNG(123);
    const rng2 = new SeededRNG(123);

    expect(rng1.next()).toBeCloseTo(rng2.next(), 8);
    expect(rng1.nextInt(1, 10)).toBe(rng2.nextInt(1, 10));

    const id = rng1.nextId("foo");
    expect(id.startsWith("foo_")).toBe(true);
    expect(id.split("_")[1]).toHaveLength(8);
  });

  it("creates deterministic and hash-based ids", () => {
    resetIdCounter();
    const id1 = deterministicId("item", 1, "a");
    const id2 = deterministicId("item", 1, "a");
    expect(id1).not.toBe(id2);

    const hash1 = hashBasedId("item", 1, "a");
    const hash2 = hashBasedId("item", 1, "a");
    expect(hash1).toBe(hash2);
  });

  it("normalizes string seeds deterministically", () => {
    const seed = seedFromString("alpha");
    const rng1 = createSeededRng(seed);
    const rng2 = createSeededRng("alpha");
    expect(rng1.next()).toBeCloseTo(rng2.next(), 8);
  });
});
