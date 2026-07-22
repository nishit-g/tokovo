/**
 * Android StatusBar Strategy
 *
 * Deterministic Android status bar projected from the active visual profile.
 */

import React from "react";
import { STATUS_BAR_PRESETS } from "@tokovo/core";
import { DeterministicImage } from "@tokovo/react";
import type { StatusBarStrategyProps } from "../registries/index.js";
import {
  SignalBarsIcon,
  WifiIcon,
  BatteryIcon,
  DNDIcon,
  NetworkTypeLabel,
  formatTime,
} from "./shared-icons.js";
import { resolveDevicePlatformVisuals } from "../visual-system.js";

const NotificationIcon: React.FC<{
  icon?: string;
  count: number;
  color: string;
  scale: number;
}> = ({ icon, count, color, scale }) => {
  const imageSource = icon && /^(?:https?:|data:|\/)/u.test(icon) ? icon : undefined;
  return (
    <div style={{ position: "relative", width: 9.5 * scale, height: 9.5 * scale }}>
      {imageSource ? (
        <DeterministicImage
          src={imageSource}
          alt=""
          style={{
            width: 9.5 * scale,
            height: 9.5 * scale,
            objectFit: "contain",
            filter:
              color === "#FFFFFF"
                ? "grayscale(1) brightness(0) invert(1)"
                : "grayscale(1) brightness(0)",
          }}
        />
      ) : (
        <span style={{ color, fontSize: 8 * scale, lineHeight: `${9.5 * scale}px` }}>
          {icon || "•"}
        </span>
      )}
      {count > 1 && (
        <div
          style={{
            position: "absolute",
            top: -2 * scale,
            right: -3 * scale,
            background: "#ff3b30",
            borderRadius: 10,
            padding: `0 ${1.5 * scale}px`,
            fontSize: 5.5 * scale,
            fontWeight: 600,
            color: "white",
            minWidth: 4 * scale,
            textAlign: "center",
          }}
        >
          {count > 9 ? "9+" : count}
        </div>
      )}
    </div>
  );
};

export const AndroidStatusBarStrategy: React.FC<StatusBarStrategyProps> = ({
  os,
  notificationIcons = [],
  theme,
  deviceProfile,
}) => {
  const displayTime = formatTime(os.clock);
  const displayBattery = os.battery;
  const isCharging = os.charging;
  const network = os.network;
  const wifiStrength = os.wifiStrength;
  const cellStrength = os.cellStrength;
  const isDND = os.dnd;
  const resolvedTheme = typeof theme === "string" ? STATUS_BAR_PRESETS[theme] : theme;
  const textColor = resolvedTheme?.iconColor ?? "#FFFFFF";
  const backgroundColor = resolvedTheme?.backgroundColor ?? "transparent";
  const fontFamily = resolveDevicePlatformVisuals(deviceProfile, os.appearance, os.locale, os)
    .typography.primaryFamily;
  const scale = deviceProfile.pointScale;
  const statusHeight = 28 * scale;

  return (
    <div
      style={{
        width: "100%",
        height: statusHeight,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: `0 ${15 * scale}px`,
        boxSizing: "border-box",
        fontSize: 12 * scale,
        fontWeight: "500",
        color: textColor,
        backgroundColor,
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 20,
        fontFamily,
      }}
    >
      {/* Left side - Time and notification icons */}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <span>{displayTime}</span>
        {notificationIcons.slice(0, 5).map((n, i) => (
          <NotificationIcon key={i} icon={n.icon} count={n.count} color={textColor} scale={scale} />
        ))}
        {notificationIcons.length > 5 && <span style={{ fontSize: 9 * scale }}>•</span>}
      </div>

      {/* Right side - Status icons */}
      <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
        {isDND && <DNDIcon color={textColor} scale={scale} />}
        {network !== "wifi" && (
          <NetworkTypeLabel
            network={network}
            color={textColor}
            fontSize={9 * scale}
            fontFamily={fontFamily}
          />
        )}
        <SignalBarsIcon color={textColor} strength={cellStrength} scale={scale} />
        {network === "wifi" && <WifiIcon color={textColor} strength={wifiStrength} scale={scale} />}
        <BatteryIcon
          color={textColor}
          percentage={displayBattery}
          charging={isCharging}
          scale={scale}
        />
      </div>
    </div>
  );
};
