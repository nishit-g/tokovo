import { describe, expect, it } from "vitest";
import {
  formatConversationListTimestamp,
  hydrateSnapshotMessage,
} from "../utils/messages.js";

describe("deterministic timestamp formatting", () => {
  it("uses UTC instead of the render host timezone", () => {
    const baseTime = new Date("2026-04-10T12:00:00Z");
    const timestamp = Date.parse("2026-04-10T00:30:00Z");

    expect(formatConversationListTimestamp(timestamp, baseTime, "en-US")).toBe("00:30");
  });

  it("derives display time when a snapshot authors timestampMs directly", () => {
    const timestampMs = Date.parse("2026-07-24T20:15:00Z");
    const message = hydrateSnapshotMessage(
      {
        id: "scheduled",
        from: "me",
        type: "text",
        text: "Scheduled it",
        timestampMs,
      },
      { baseTime: new Date("2026-07-24T20:15:08Z") },
    );

    expect(message.timestampMs).toBe(timestampMs);
    expect(message.timestamp).toBe("20:15");
  });
});
