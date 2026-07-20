import { describe, expect, it } from "vitest";
import { formatNotificationAppLabel } from "./app-label.js";

describe("formatNotificationAppLabel", () => {
  it("uses product labels for known app ids", () => {
    expect(formatNotificationAppLabel("app_x")).toBe("X");
    expect(formatNotificationAppLabel("app_whatsapp")).toBe("WhatsApp");
    expect(formatNotificationAppLabel("app_linkedin")).toBe("LinkedIn");
  });

  it("humanizes plugin ids without leaking internal prefixes", () => {
    expect(formatNotificationAppLabel("app_studio_notes")).toBe("Studio Notes");
    expect(formatNotificationAppLabel(undefined)).toBe("App");
  });
});
