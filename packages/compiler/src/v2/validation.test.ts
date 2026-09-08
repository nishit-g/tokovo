import { expect, it } from "vitest";
import type { RuntimeEvent, WorldState } from "@tokovo/core";
import { validateV1RuntimeEpisode } from "./validation.js";

it("recognizes iMessage initial views without accepting another device's navigation", () => {
  const event = {
    at: 30,
    kind: "APP",
    appId: "app_imessage",
    deviceId: "phone",
    type: "IMESSAGE_MESSAGE_RECEIVE",
    payload: { conversationId: "chat", from: "Ava", text: "Hello" },
  } satisfies RuntimeEvent;
  const world = {
    appInstances: { "phone:app_imessage": { currentScreen: "chat", activeConversationId: "chat" } },
  } as unknown as WorldState;
  expect(
    validateV1RuntimeEpisode([event], world).filter((issue) => issue.severity === "error"),
  ).toEqual([]);
  expect(
    validateV1RuntimeEpisode([
      { ...event, at: 0, deviceId: "other", type: "IMESSAGE_CONVERSATION_OPEN" },
      event,
    ]).some((issue) => issue.appId === "app_imessage" && issue.severity === "error"),
  ).toBe(true);
});
