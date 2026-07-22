/**
 * iOS StatusBar Strategy
 *
 * Deterministic iOS-style status bar projected from the active visual profile.
 */

import React from "react";
import { STATUS_BAR_PRESETS } from "@tokovo/core";
import type { StatusBarStrategyProps } from "../registries/index.js";
import {
  SignalBarsIcon,
  WifiIcon,
  BatteryIcon,
  DNDIcon,
  NetworkTypeLabel,
  formatTime,
} from "./shared-icons.js";
import { getIOSChromeMetrics } from "../ios/chrome-metrics.js";
import { resolveDevicePlatformVisuals } from "../visual-system.js";

/**
 * Resolve theme prop to actual colors.
 * Handles:
 * - "light" | "dark" → preset colors
 * - ResolvedStatusBarTheme → use directly
 */
function resolveThemeColors(theme: StatusBarStrategyProps["theme"]): {
  textColor: string;
  bgColor: string;
} {
  if (typeof theme === "string" || !theme) {
    const preset = STATUS_BAR_PRESETS[theme || "light"];
    return {
      textColor: preset.iconColor,
      bgColor: preset.backgroundColor,
    };
  }
  // Full theme object
  return {
    textColor: theme.iconColor,
    bgColor: theme.backgroundColor,
  };
}

export const IOSStatusBarStrategy: React.FC<StatusBarStrategyProps> = ({
  os,
  time = "9:41",
  theme = "light",
  batteryPercentage = 100,
  deviceProfile,
}) => {
  // Read from device.os if available, otherwise use props
  const displayTime = os ? formatTime(os.clock) : time;
  const displayBattery = os?.battery ?? batteryPercentage;
  const isCharging = os?.charging ?? false;
  const network = os?.network ?? "wifi";
  const wifiStrength = os?.wifiStrength ?? 3;
  const cellStrength = os?.cellStrength ?? 4;
  const isDND = os?.dnd ?? false;

  // Resolve theme to actual colors
  const { textColor, bgColor } = resolveThemeColors(theme);
  const metrics = deviceProfile ? getIOSChromeMetrics(deviceProfile) : null;
  const pointScale = metrics?.pointScale ?? 3;
  const statusBar = metrics?.statusBar ?? {
    height: 132,
    paddingTop: 45,
    paddingX: 72,
    timeFontSize: 51,
    timeLetterSpacing: 0.5,
    iconGap: 15,
    iconOffsetY: 6,
    networkFontSize: 36,
  };
  if (!deviceProfile) {
    throw new Error("IOS_STATUS_BAR_DEVICE_PROFILE_REQUIRED");
  }
  const fontFamily = resolveDevicePlatformVisuals(deviceProfile, "light").typography.primaryFamily;

  return (
    <div
      style={{
        width: "100%",
        height: statusBar.height,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: `${statusBar.paddingTop}px ${statusBar.paddingX}px 0 ${statusBar.paddingX}px`,
        boxSizing: "border-box",
        color: textColor,
        backgroundColor: bgColor,
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 20,
      }}
    >
      {/* Left side - Time */}
      <div
        style={{
          fontSize: statusBar.timeFontSize,
          fontWeight: "600",
          fontFamily,
          letterSpacing: statusBar.timeLetterSpacing,
        }}
      >
        {displayTime}
      </div>

      {/* Right side - Status icons */}
      <div
        style={{
          display: "flex",
          gap: statusBar.iconGap,
          alignItems: "center",
          marginTop: statusBar.iconOffsetY,
        }}
      >
        {isDND && <DNDIcon color={textColor} scale={pointScale} />}
        {network !== "wifi" && (
          <NetworkTypeLabel
            network={network}
            color={textColor}
            fontSize={statusBar.networkFontSize}
            fontFamily={fontFamily}
          />
        )}
        <SignalBarsIcon color={textColor} strength={cellStrength} scale={pointScale} />
        {network === "wifi" && (
          <WifiIcon color={textColor} strength={wifiStrength} scale={pointScale} />
        )}
        <BatteryIcon
          color={textColor}
          percentage={displayBattery}
          charging={isCharging}
          scale={pointScale}
        />
      </div>
    </div>
  );
};
