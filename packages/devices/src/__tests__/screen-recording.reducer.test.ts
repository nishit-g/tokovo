import { describe, expect, it } from "vitest";
import type { DeviceState, TimelineEvent } from "@tokovo/core";
import { deviceReducer } from "../reducer.js";

function baseDevice(): DeviceState {
  return {
    id: "phone",
    profileId: "iphone16",
    isLocked: false,
    foregroundAppId: "app_whatsapp",
    notifications: [],
  };
}

describe("deviceReducer screen recording", () => {
  it("creates countdown and active frames when recording starts", () => {
    const devices = { phone: baseDevice() };
    const next = deviceReducer(devices, {
      kind: "DEVICE",
      type: "SET_SCREEN_RECORDING",
      deviceId: "phone",
      at: 90,
      payload: { enabled: true, mode: "compact" },
    } as TimelineEvent);

    expect(next.phone.screenRecording).toMatchObject({
      enabled: true,
      mode: "compact",
      startedAtFrame: 90,
      activeSinceFrame: 135,
    });
  });

  it("keeps stop feedback after recording ends", () => {
    const devices = {
      phone: {
        ...baseDevice(),
        screenRecording: {
          enabled: true,
          mode: "compact" as const,
          startedAtFrame: 0,
          activeSinceFrame: 45,
        },
      },
    };
    const next = deviceReducer(devices, {
      kind: "DEVICE",
      type: "SET_SCREEN_RECORDING",
      deviceId: "phone",
      at: 180,
      payload: { enabled: false },
    } as TimelineEvent);

    expect(next.phone.screenRecording).toMatchObject({
      enabled: false,
      stoppedAtFrame: 180,
      stopFeedbackUntilFrame: 210,
    });
  });
});
