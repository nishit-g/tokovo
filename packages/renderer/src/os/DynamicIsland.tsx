/**
 * DynamicIsland - iOS Dynamic Island Container
 *
 * Renders the Dynamic Island UI element at the top of iPhone screens.
 * Priority: HeadsUp Notification > Active Widget > Idle
 */

import React from "react";
import { WorldState, DeviceState } from "@tokovo/core";
import type { WidgetProps } from "@tokovo/react";
import { useRendererRegistries } from "../RegistryContext.js";
import {
  DeviceProfile,
  DynamicIslandConfig,
  getIOSChromeMetrics,
} from "@tokovo/devices";

interface DynamicIslandProps {
  device: DeviceState;
  deviceProfile: DeviceProfile;
  world: WorldState;
  t: number;
  fps: number;
}

/**
 * Idle Dynamic Island - Black pill when nothing is playing
 */
const IdleDynamicIsland: React.FC<{ config: DynamicIslandConfig }> = ({
  config,
}) => (
  <div
    style={{
      position: "absolute",
      top: config.topY,
      left: config.centerX - config.collapsedWidth / 2,
      width: config.collapsedWidth,
      height: config.collapsedHeight,
      background: "#000000",
      borderRadius: config.cornerRadius,
      zIndex: 1004,
    }}
  />
);

const RecordingDynamicIsland: React.FC<{
  config: DynamicIslandConfig;
  deviceProfile: DeviceProfile;
  currentFrame: number;
  fps: number;
  mode: "minimal" | "compact" | "expanded" | "idle";
  label: string;
  tone?: "recording" | "saved";
}> = ({
  config,
  deviceProfile,
  currentFrame,
  fps,
  mode,
  label,
  tone = "recording",
}) => {
  const metrics = getIOSChromeMetrics(deviceProfile);
  const islandMetrics = metrics.dynamicIsland;
  const isMinimal = mode === "minimal";
  const isSaved = tone === "saved";
  const pointScale = metrics.pointScale;
  const width = isMinimal
    ? islandMetrics?.minimalWidth ?? config.collapsedWidth * 0.58
    : isSaved
      ? islandMetrics?.savedWidth ?? config.collapsedWidth * 1.08
      : islandMetrics?.compactWidth ?? config.collapsedWidth * 0.96;
  const height = isSaved
    ? islandMetrics?.savedHeight ?? config.collapsedHeight * 0.9
    : islandMetrics?.compactHeight ?? config.collapsedHeight * 0.86;
  const dotColor = tone === "saved" ? "#FFFFFF" : "#FF3B30";
  const dotSize = isSaved
    ? islandMetrics?.savedDotSize ?? 4.6 * pointScale
    : islandMetrics?.dotSize ?? 5.6 * pointScale;
  const gap = islandMetrics?.gap ?? 6 * pointScale;
  const horizontalPadding = islandMetrics?.horizontalPadding ?? 12 * pointScale;
  const fontSize = mode === "minimal"
    ? islandMetrics?.countdownFontSize ?? 17 * pointScale
    : isSaved
      ? islandMetrics?.savedFontSize ?? 13 * pointScale
      : islandMetrics?.compactFontSize ?? 14.25 * pointScale;
  const blinkOpacity =
    tone === "saved"
      ? 1
      : 0.45 + 0.55 * (0.5 + 0.5 * Math.sin((currentFrame / fps) * Math.PI * 3));

  return (
    <div
      style={{
        position: "absolute",
        top: config.topY + (config.collapsedHeight - height) / 2,
        left: config.centerX - width / 2,
        width,
        height,
        background: "#000000",
        borderRadius: config.cornerRadius,
        zIndex: 1004,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap,
        padding: `0 ${horizontalPadding}px`,
        boxSizing: "border-box",
        boxShadow:
          tone === "saved"
            ? "0 16px 40px rgba(0,0,0,0.22)"
            : "0 16px 40px rgba(0,0,0,0.28)",
      }}
    >
      <div
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: dotSize,
          background: dotColor,
          opacity: blinkOpacity,
          boxShadow:
            tone === "saved"
              ? "0 0 14px rgba(255,255,255,0.35)"
              : "0 0 14px rgba(255,59,48,0.55)",
        }}
      />
      {!isMinimal && (
        <div
          style={{
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
            fontSize,
            fontWeight: tone === "saved" ? 600 : 700,
            letterSpacing: -0.2 * pointScale,
            color: "white",
            whiteSpace: "nowrap",
            lineHeight: 1.02,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};

/**
 * DynamicIsland Container Component
 */
export const DynamicIsland: React.FC<DynamicIslandProps> = ({
  device,
  deviceProfile,
  world,
  t,
  fps,
}) => {
  const registries = useRendererRegistries();
  // No Dynamic Island on this device?
  if (!deviceProfile.dynamicIsland) {
    return null;
  }

  const config = deviceProfile.dynamicIsland;
  const platform = deviceProfile.platform;

  const recording = device.screenRecording;
  if (recording) {
    if (
      !recording.enabled &&
      recording.stopFeedbackUntilFrame !== undefined &&
      t < recording.stopFeedbackUntilFrame
    ) {
      return (
        <RecordingDynamicIsland
          config={config}
          deviceProfile={deviceProfile}
          currentFrame={t}
          fps={fps}
          mode="compact"
          label="Saved"
          tone="saved"
        />
      );
    }

    if (recording.enabled) {
      const activeSince =
        recording.activeSinceFrame ?? recording.startedAtFrame ?? t;
      if (t < activeSince) {
        const countdown = Math.max(1, Math.ceil((activeSince - t) / (fps / 2)));
        return (
          <RecordingDynamicIsland
            config={config}
            deviceProfile={deviceProfile}
            currentFrame={t}
            fps={fps}
            mode={recording.mode ?? "compact"}
            label={`${countdown}`}
          />
        );
      }

      const elapsedFrames = Math.max(0, t - activeSince);
      const totalSeconds = Math.floor(elapsedFrames / fps);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return (
        <RecordingDynamicIsland
          config={config}
          deviceProfile={deviceProfile}
          currentFrame={t}
          fps={fps}
          mode={recording.mode ?? "compact"}
          label={`${minutes}:${seconds.toString().padStart(2, "0")}`}
        />
      );
    }
  }

  // If device state explicitly requests Dynamic Island content, render it first.
  // This makes system-level indicators deterministic and decoupled from widget registries.
  if (device.dynamicIsland?.visible) {
    const active = device.dynamicIsland.activeContent;
    const mode = device.dynamicIsland.mode ?? "compact";
    if (active === "recording") {
      return (
        <RecordingDynamicIsland
          config={config}
          deviceProfile={deviceProfile}
          currentFrame={t}
          fps={fps}
          mode={mode}
          label="REC"
        />
      );
    }
  }

  // Find the notification that should be displayed as headsUp at current frame
  // A notification is visible in headsUp if: t >= at AND t < (at + duration)
  // 4. CHECK NOTIFICATIONS
  // (Notifications are now handled exclusively by HeadsUpNotification.tsx)
  // Legacy logic removed.

  // Get active background app IDs
  const activeAppIds = device.backgroundApps?.map((a) => a.appId) || [];

  // Resolve which widget should render
  const resolved = registries.plugins.widgets.resolve(
    "dynamicIsland",
    platform,
    activeAppIds,
  );

  // If no widget, show idle state
  if (!resolved) {
    return <IdleDynamicIsland config={config} />;
  }

  // Find the background app state for this widget
  const backgroundApp = device.backgroundApps?.find(
    (a) => a.appId === resolved.appId,
  );

  // Get app state
  const appState = world.appState[resolved.appId] || {};

  // Build widget props
  const widgetProps: WidgetProps = {
    appState,
    backgroundApp,
    deviceProfile: {
      dynamicIsland: config,
    },
    currentFrame: t,
    expansionMode: "compact",
    platform,
  };

  // Get the widget component
  const WidgetComponent = resolved.widget.component;

  return (
    <div
      style={{
        position: "absolute",
        top: config.topY,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1004,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <WidgetComponent {...widgetProps} />
    </div>
  );
};

export default DynamicIsland;
