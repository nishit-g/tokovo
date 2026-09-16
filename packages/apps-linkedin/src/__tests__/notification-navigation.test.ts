import { expect, it } from "vitest";
import { linkedInNotificationAdapter } from "../notifications/adapter.js";

it("opens an authored conversation through the app event contract", () => {
  const intent = { id: "notice", deviceId: "phone", appId: "app_linkedin", deliverAtFrame: 0,
    content: { title: "Update", body: "New message" }, threadId: "thread-1" };
  expect(linkedInNotificationAdapter.defaultAction!(intent).appEvent).toEqual({
    appId: "app_linkedin", type: "NAVIGATE", payload: {"screen":"thread","threadId":"thread-1"},
  });
  expect(linkedInNotificationAdapter.defaultAction!({ ...intent, threadId: undefined }).appEvent).toBeUndefined();
});
