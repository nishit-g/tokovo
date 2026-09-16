import { expect, it } from "vitest";
import { instagramNotificationAdapter } from "../notifications/adapter.js";

it("opens an authored conversation through the app event contract", () => {
  const intent = { id: "notice", deviceId: "phone", appId: "app_instagram", deliverAtFrame: 0,
    content: { title: "Update", body: "New message" }, threadId: "thread-1" };
  expect(instagramNotificationAdapter.defaultAction!(intent).appEvent).toEqual({
    appId: "app_instagram", type: "NAVIGATE", payload: {"screen":"thread","threadId":"thread-1"},
  });
  expect(instagramNotificationAdapter.defaultAction!({ ...intent, threadId: undefined }).appEvent).toBeUndefined();
});
