import { expect, it } from "vitest";
import { IMessagePlugin } from "../plugin.js";

it("keeps remote typing silent while retaining the message send cue", () => {
  expect(IMessagePlugin.audioRules?.some((rule) => String(rule.match.type).includes("TYPING"))).toBe(false);
  expect(IMessagePlugin.audioRules?.some((rule) => rule.match.type === "IMESSAGE_MESSAGE_SEND")).toBe(true);
});
