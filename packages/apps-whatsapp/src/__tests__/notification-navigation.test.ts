import { expect, it } from "vitest";
import { whatsappNotificationAdapter } from "../notifications/adapter.js";

it("opens the notification conversation through the app-owned event", () => {
  const intent = { id: "notice", deviceId: "phone", appId: "app_whatsapp", deliverAtFrame: 0, content: { title: "New message", body: "Hello" } };
  expect(whatsappNotificationAdapter.defaultAction?.({ ...intent, threadId: "chat" }).appEvent)
    .toEqual({ appId: "app_whatsapp", type: "CONVERSATION_OPENED", payload: { conversationId: "chat" } });
  expect(whatsappNotificationAdapter.defaultAction?.(intent).appEvent).toBeUndefined();
});
