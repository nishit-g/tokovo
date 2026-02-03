import { describe, expect, it } from "vitest";
import { KeyboardTrackBuilder } from "../dsl/keyboard-builder";

function buildEvents(seed: number | string) {
  let order = 0;
  const builder = new KeyboardTrackBuilder(30, "phone", () => order++);
  builder.type("hello", "0s", { seed });
  return builder._events.map((event) => {
    const { _declarationOrder: _drop, ...rest } = event as Record<string, unknown>;
    return rest;
  });
}

describe("KeyboardTrackBuilder", () => {
  it("produces deterministic timings for the same seed", () => {
    const eventsA = buildEvents(123);
    const eventsB = buildEvents(123);
    expect(eventsA).toEqual(eventsB);
  });

  it("produces different timings for different seeds", () => {
    const eventsA = buildEvents(123);
    const eventsB = buildEvents(456);
    expect(eventsA).not.toEqual(eventsB);
  });
});
