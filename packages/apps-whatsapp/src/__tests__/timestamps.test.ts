import { describe, expect, it } from "vitest";
import { formatConversationListTimestamp } from "../utils/messages.js";

describe("deterministic timestamp formatting", () => {
  it("uses UTC instead of the render host timezone", () => {
    const baseTime = new Date("2026-04-10T12:00:00Z");
    const timestamp = Date.parse("2026-04-10T00:30:00Z");

    expect(formatConversationListTimestamp(timestamp, baseTime, "en-US")).toBe("00:30");
  });
});
