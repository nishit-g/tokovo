import { describe, expect, it } from "vitest";
import type { ScreenRecordingState } from "@tokovo/core";
import { iPhone16Profile } from "../iphone16/profile.js";
import { getIOSChromeMetrics } from "../ios/chrome-metrics.js";
import { projectDynamicIsland } from "../dynamic-island/project.js";

const profileIsland = iPhone16Profile.dynamicIsland;
const chromeIsland = getIOSChromeMetrics(iPhone16Profile).dynamicIsland;
if (!profileIsland || !chromeIsland) {
  throw new Error("iPhone 16 test profile must define Dynamic Island metrics");
}

function recording(
  overrides: Partial<ScreenRecordingState> = {},
): ScreenRecordingState {
  return {
    isCapturing: true,
    presentation: "compact",
    microphoneEnabled: false,
    requestedAtFrame: 0,
    captureStartedAtFrame: 90,
    previousPresentation: "idle",
    presentationChangedAtFrame: 0,
    ...overrides,
  };
}

describe("projectDynamicIsland", () => {
  it("projects the authentic countdown anatomy", () => {
    const projection = projectDynamicIsland({
      profile: iPhone16Profile,
      screenRecording: recording(),
      currentFrame: 30,
      fps: 30,
      locale: "en-US",
    });

    expect(projection).toMatchObject({
      phase: "countdown",
      presentation: "compact",
      recording: { countdownValue: "2", title: "Screen Recording" },
    });
    expect(projection?.geometry.width).toBeGreaterThan(
      profileIsland.collapsedWidth,
    );
  });

  it("uses a red-dot-only compact state with elapsed time kept for expansion", () => {
    const projection = projectDynamicIsland({
      profile: iPhone16Profile,
      screenRecording: recording(),
      currentFrame: 150,
      fps: 30,
      locale: "en-US",
    });

    expect(projection).toMatchObject({
      phase: "recording",
      presentation: "compact",
      recording: { elapsedLabel: "00:02" },
    });
    expect(projection?.geometry.left).toBeLessThan(
      profileIsland.centerX - profileIsland.collapsedWidth / 2,
    );
  });

  it("expands to the full stop control only when explicitly requested", () => {
    const projection = projectDynamicIsland({
      profile: iPhone16Profile,
      screenRecording: recording({
        presentation: "expanded",
        previousPresentation: "compact",
        presentationChangedAtFrame: 120,
      }),
      currentFrame: 132,
      fps: 30,
    });

    expect(projection).toMatchObject({
      phase: "recording",
      presentation: "expanded",
      suppressesStatusBar: true,
    });
    expect(projection?.geometry.width).toBe(
      chromeIsland.recordingExpandedWidth,
    );
    expect(projection?.geometry.width).toBeLessThan(
      profileIsland.expandedWidth,
    );
  });

  it("returns to physical idle chrome when the indicator is dismissed", () => {
    const projection = projectDynamicIsland({
      profile: iPhone16Profile,
      screenRecording: recording({
        presentation: "hidden",
        previousPresentation: "compact",
        presentationChangedAtFrame: 120,
      }),
      currentFrame: 132,
      fps: 30,
    });

    expect(projection).toMatchObject({ phase: "idle", presentation: "idle" });
    expect(projection?.suppressesStatusBar).toBe(false);
    expect(projection?.geometry.width).toBe(
      profileIsland.collapsedWidth,
    );
  });

  it("projects a save banner after a completed capture", () => {
    const projection = projectDynamicIsland({
      profile: iPhone16Profile,
      screenRecording: recording({
        isCapturing: false,
        completion: "saved",
        captureStoppedAtFrame: 180,
        feedbackEndsAtFrame: 252,
        previousPresentation: "compact",
        presentationChangedAtFrame: 180,
      }),
      currentFrame: 195,
      fps: 30,
    });

    expect(projection?.phase).toBe("idle");
    expect(projection?.completionBanner).toMatchObject({
      title: "Screen Recording",
      body: "Screen Recording video saved to Photos",
      progress: 1,
    });
  });

  it("provides a device-owned fallback for generic activities", () => {
    const projection = projectDynamicIsland({
      profile: iPhone16Profile,
      dynamicIsland: {
        visible: true,
        presentation: "compact",
        activity: "timer",
        updatedAtFrame: 0,
        content: { elapsedLabel: "04:12" },
      },
      currentFrame: 15,
      fps: 30,
    });

    expect(projection).toMatchObject({
      phase: "activity",
      presentation: "compact",
      activity: { kind: "timer", elapsedLabel: "04:12" },
    });
  });
});
