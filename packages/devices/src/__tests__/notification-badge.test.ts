import { expect, it } from "vitest";
import { DEFAULT_OS_STATE, type DeviceState, type TimelineEvent } from "@tokovo/core";
import { deviceReducer } from "../reducer.js";

it("synchronizes dock, page and folder copies without changing unrelated badges", () => {
  const icon = { appId: "app_chat", label: "Chat", icon: "/chat.svg", badge: 4 };
  const phone: DeviceState = {
    id: "phone", profileId: "iphone16", isLocked: false, os: DEFAULT_OS_STATE,
    homeScreen: { dock: [{ ...icon }], pages: [{ apps: [
      { ...icon }, { type: "folder", name: "Social", apps: [{ ...icon }, { ...icon, appId: "other" }] },
    ] }] },
  };
  const update = (count: number) => deviceReducer({ phone }, {
    kind: "DEVICE", type: "SET_BADGE", deviceId: "phone", at: 30, payload: { appId: "app_chat", count },
  } as TimelineEvent).phone.homeScreen!;
  for (const count of [2, 0]) {
    const result = update(count);
    const badge = count || undefined;
    expect(result.dock[0].badge).toBe(badge);
    expect(result.pages[0].apps[0]).toMatchObject({ badge });
    expect(result.pages[0].apps[1]).toMatchObject({ apps: [{ badge }, { badge: 4 }] });
  }
  expect(phone.homeScreen!.dock[0].badge).toBe(4);
});
