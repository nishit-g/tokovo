import { describe, expect, it } from "vitest";
import type { DeviceState, TimelineEvent } from "@tokovo/core";
import { deviceReducer } from "../reducer.js";

function baseDevice(): DeviceState {
  return {
    id: "phone",
    profileId: "iphone16",
    isLocked: false,
    foregroundAppId: "app_whatsapp",
  };
}

function event(
  at: number,
  payload: Record<string, unknown>,
): TimelineEvent {
  return {
    kind: "DEVICE",
    type: "SET_SCREEN_RECORDING",
    deviceId: "phone",
    at,
    payload,
  } as TimelineEvent;
}

describe("deviceReducer screen recording", () => {
  it("stores the authored countdown and capture configuration", () => {
    const next = deviceReducer(
      { phone: baseDevice() },
      event(90, {
        enabled: true,
        presentation: "compact",
        microphoneEnabled: true,
        countdownFrames: 90,
      }),
    );

    expect(next.phone.screenRecording).toMatchObject({
      isCapturing: true,
      presentation: "compact",
      microphoneEnabled: true,
      requestedAtFrame: 90,
      captureStartedAtFrame: 180,
      previousPresentation: "idle",
      presentationChangedAtFrame: 90,
    });
  });

  it("morphs presentation without restarting an active capture", () => {
    const devices = {
      phone: {
        ...baseDevice(),
        screenRecording: {
          isCapturing: true,
          presentation: "compact" as const,
          microphoneEnabled: false,
          requestedAtFrame: 0,
          captureStartedAtFrame: 90,
          presentationChangedAtFrame: 0,
        },
      },
    };
    const next = deviceReducer(
      devices,
      event(150, {
        enabled: true,
        presentation: "expanded",
        microphoneEnabled: true,
      }),
    );

    expect(next.phone.screenRecording).toMatchObject({
      isCapturing: true,
      presentation: "expanded",
      previousPresentation: "compact",
      microphoneEnabled: true,
      requestedAtFrame: 0,
      captureStartedAtFrame: 90,
      presentationChangedAtFrame: 150,
    });
  });

  it("keeps capture on through every presentation until an explicit stop", () => {
    let devices: Record<string, DeviceState> = deviceReducer(
      { phone: baseDevice() },
      event(0, {
        enabled: true,
        presentation: "compact",
        countdownFrames: 0,
      }),
    );

    for (const [at, presentation] of [
      [30, "expanded"],
      [60, "hidden"],
      [90, "compact"],
    ] as const) {
      devices = deviceReducer(
        devices,
        event(at, { enabled: true, presentation }),
      );
      expect(devices.phone.screenRecording).toMatchObject({
        isCapturing: true,
        presentation,
        requestedAtFrame: 0,
        captureStartedAtFrame: 0,
      });
    }

    devices = deviceReducer(
      devices,
      event(120, { enabled: false, feedbackFrames: 72 }),
    );
    expect(devices.phone.screenRecording).toMatchObject({
      isCapturing: false,
      completion: "saved",
      captureStoppedAtFrame: 120,
    });
  });

  it("ends an active capture with deterministic save feedback", () => {
    const devices = {
      phone: {
        ...baseDevice(),
        screenRecording: {
          isCapturing: true,
          presentation: "compact" as const,
          microphoneEnabled: false,
          requestedAtFrame: 0,
          captureStartedAtFrame: 90,
          presentationChangedAtFrame: 0,
        },
      },
    };
    const next = deviceReducer(
      devices,
      event(180, { enabled: false, feedbackFrames: 72 }),
    );

    expect(next.phone.screenRecording).toMatchObject({
      isCapturing: false,
      completion: "saved",
      captureStoppedAtFrame: 180,
      feedbackEndsAtFrame: 252,
      previousPresentation: "compact",
      presentationChangedAtFrame: 180,
    });
  });

  it("cancels cleanly when stopped during the countdown", () => {
    const devices = {
      phone: {
        ...baseDevice(),
        screenRecording: {
          isCapturing: true,
          presentation: "compact" as const,
          microphoneEnabled: false,
          requestedAtFrame: 30,
          captureStartedAtFrame: 120,
          presentationChangedAtFrame: 30,
        },
      },
    };
    const next = deviceReducer(
      devices,
      event(60, { enabled: false, feedbackFrames: 72 }),
    );

    expect(next.phone.screenRecording).toMatchObject({
      isCapturing: false,
      completion: "cancelled",
      previousPresentation: "countdown",
    });
  });
});
