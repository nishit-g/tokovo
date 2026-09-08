import { describe, expect, it } from "vitest";
import {
  messageActionKeys,
  messageActionRect,
} from "../presentation/message-actions.js";

describe("message action surfaces", () => {
  it("offers actions appropriate to content and ownership", () => {
    expect(
      messageActionKeys({ id: "photo", from: "other", type: "image", at: 0 }),
    ).not.toContain("action.copy");
    expect(
      messageActionKeys({ id: "photo", from: "other", type: "image", at: 0 }),
    ).not.toContain("action.info");
    expect(
      messageActionKeys({
        id: "text",
        from: "me",
        type: "text",
        text: "Copy",
        at: 0,
      }),
    ).toContain("action.info");
    expect(
      messageActionKeys({ id: "deleted", from: "me", type: "deleted", at: 0 }),
    ).toEqual(["action.delete"]);
  });
  it("keeps menus inside the visible thread for short, tall and edge bubbles", () => {
    const bounds = { x: 0, y: 100, width: 393, height: 420 };
    for (const y of [100, 200, 480]) {
      const rect = messageActionRect(
        { x: 300, y, width: 76, height: 42 },
        bounds,
        6,
      );
      expect(rect.x).toBeGreaterThanOrEqual(0);
      expect(rect.x + rect.width).toBeLessThanOrEqual(393);
      expect(rect.y).toBeGreaterThanOrEqual(100);
      expect(rect.y + rect.height).toBeLessThanOrEqual(520);
    }
  });
});
