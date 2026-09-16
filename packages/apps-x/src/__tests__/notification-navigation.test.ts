import { expect, it } from "vitest";
import { xNotificationAdapter } from "../notifications/adapter.js";

it("opens an authored conversation through the app event contract", () => {
  const intent = {
    id: "notice",
    deviceId: "phone",
    appId: "app_x",
    deliverAtFrame: 0,
    content: { title: "Update", body: "New message" },
    threadId: "thread-1",
  };
  expect(xNotificationAdapter.defaultAction?.(intent).appEvent).toEqual({
    appId: "app_x",
    type: "SET_SCREEN",
    payload: { screen: "thread", threadId: "thread-1" },
  });
  expect(
    xNotificationAdapter.defaultAction?.({ ...intent, threadId: undefined })?.appEvent?.payload,
  ).toEqual({ screen: "notifications" });
});
