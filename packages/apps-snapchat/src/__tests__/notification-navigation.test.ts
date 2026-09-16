import { expect, it } from "vitest";
import { snapchatNotificationAdapter } from "../notifications/adapter.js";

it("opens an authored conversation through the app event contract", () => {
  const intent = { id: "notice", deviceId: "phone", appId: "app_snapchat", deliverAtFrame: 0,
    content: { title: "Update", body: "New message" }, threadId: "thread-1" };
  expect(snapchatNotificationAdapter.defaultAction!(intent).appEvent).toEqual({
    appId: "app_snapchat", type: "SNAPCHAT_CONVERSATION_OPEN", payload: {"conversationId":"thread-1"},
  });
  expect(snapchatNotificationAdapter.defaultAction!({ ...intent, threadId: undefined }).appEvent).toBeUndefined();
});
