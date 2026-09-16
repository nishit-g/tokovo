import { expect, it } from "vitest";
import { iMessageNotificationAdapter } from "../notifications/adapter.js";

it("opens the notification conversation through the app-owned event", () => {
  const intent = { id: "notice", deviceId: "phone", appId: "app_imessage", deliverAtFrame: 0, content: { title: "New message", body: "Hello" } };
  expect(iMessageNotificationAdapter.defaultAction?.({ ...intent, threadId: "chat" }).appEvent)
    .toEqual({ appId: "app_imessage", type: "IMESSAGE_CONVERSATION_OPEN", payload: { conversationId: "chat" } });
  expect(iMessageNotificationAdapter.defaultAction?.(intent).appEvent).toBeUndefined();
});
