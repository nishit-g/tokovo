import React from "react";
import type { DeviceTransitionStyle } from "@tokovo/core";

type TransitionPlatform = "ios" | "android";

interface AppTransitionProps {
  children: React.ReactNode;
  platform: TransitionPlatform;
  style: DeviceTransitionStyle;
  isOpening: boolean;
  isClosing: boolean;
  progress: number;
  originX?: number;
  originY?: number;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function minimumJerk(value: number): number {
  const t = clamp01(value);
  return t * t * t * (10 + t * (-15 + t * 6));
}

function resolvedStyle(
  platform: TransitionPlatform,
  style: DeviceTransitionStyle,
): Exclude<DeviceTransitionStyle, "platform-default" | "platform-unlock"> {
  if (style === "platform-default") {
    return platform === "ios" ? "ios-container-zoom" : "android-container-transform";
  }
  if (style === "platform-unlock") {
    throw new Error("APP_TRANSITION_STYLE_INVALID: platform-unlock is only valid for unlock.");
  }
  if (
    (platform === "ios" && style !== "ios-container-zoom") ||
    (platform === "android" && style !== "android-container-transform")
  ) {
    throw new Error(
      `APP_TRANSITION_PLATFORM_MISMATCH: ${style} cannot paint a ${platform} transition.`,
    );
  }
  return style;
}

export const AppTransition: React.FC<AppTransitionProps> = ({
  children,
  platform,
  style,
  isOpening,
  isClosing,
  progress,
  originX = 0.5,
  originY = 0.5,
}) => {
  const painter = resolvedStyle(platform, style);
  const eased = minimumJerk(progress);
  const visibility = isClosing ? 1 - eased : isOpening ? eased : 1;
  const scale =
    painter === "ios-container-zoom" ? 0.78 + visibility * 0.22 : 0.72 + visibility * 0.28;
  const translateY = painter === "android-container-transform" ? (1 - visibility) * 2.4 : 0;
  const radius = painter === "ios-container-zoom" ? (1 - visibility) * 54 : (1 - visibility) * 32;
  const clipInset = painter === "android-container-transform" ? (1 - visibility) * 7 : 0;

  return (
    <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}>
      <div
        data-device-transition={painter}
        style={{
          width: "100%",
          height: "100%",
          transform: `translate3d(0, ${translateY}%, 0) scale(${scale})`,
          transformOrigin: `${originX * 100}% ${originY * 100}%`,
          opacity: visibility,
          borderRadius: radius,
          clipPath: clipInset > 0 ? `inset(${clipInset}% round ${radius}px)` : undefined,
          overflow: "hidden",
          willChange: "transform, opacity, clip-path",
        }}
      >
        {children}
      </div>
    </div>
  );
};

interface FaceIDAnimationProps {
  progress: number;
}

const FaceIDAnimation: React.FC<FaceIDAnimationProps> = ({ progress }) => {
  const scanningProgress = clamp01(progress / 0.72);
  const successProgress = clamp01((progress - 0.72) / 0.28);
  const scanLineY = 50 + Math.sin(scanningProgress * Math.PI * 4) * 40;
  const success = successProgress > 0;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        pointerEvents: "none",
        opacity: 1 - successProgress,
      }}
    >
      <svg width="180" height="180" viewBox="0 0 180 180" aria-hidden>
        <path
          d="M10 50V20Q10 10 20 10h30"
          stroke={success ? "#34C759" : "white"}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M130 10h30q10 0 10 10v30"
          stroke={success ? "#34C759" : "white"}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M10 130v30q0 10 10 10h30"
          stroke={success ? "#34C759" : "white"}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M130 170h30q10 0 10-10v-30"
          stroke={success ? "#34C759" : "white"}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
        {!success ? (
          <line
            x1="30"
            y1={scanLineY}
            x2="150"
            y2={scanLineY}
            stroke="rgba(255,255,255,.62)"
            strokeWidth="2"
          />
        ) : (
          <path
            d="M55 90l25 25 45-50"
            stroke="#34C759"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={100}
            strokeDashoffset={100 - successProgress * 100}
          />
        )}
      </svg>
    </div>
  );
};

const AndroidUnlockIndicator: React.FC<{ progress: number }> = ({ progress }) => {
  const reveal = minimumJerk(clamp01(progress / 0.58));
  const exit = minimumJerk(clamp01((progress - 0.58) / 0.22));
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        placeItems: "center",
        zIndex: 1000,
        pointerEvents: "none",
        opacity: reveal * (1 - exit),
        transform: `scale(${0.86 + reveal * 0.14})`,
      }}
    >
      <div
        style={{
          width: 92,
          height: 92,
          borderRadius: 46,
          background: "rgba(22, 24, 29, .78)",
          boxShadow: "0 10px 34px rgba(0,0,0,.34)",
          display: "grid",
          placeItems: "center",
          color: "white",
        }}
      >
        <svg width="42" height="42" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M7 10V7.5a5 5 0 0 1 9.2-2.7"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
          />
          <rect x="5" y="10" width="14" height="10" rx="4" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
};

interface UnlockTransitionProps {
  platform: TransitionPlatform;
  progress: number;
  children: React.ReactNode;
}

export const UnlockTransition: React.FC<UnlockTransitionProps> = ({
  platform,
  progress,
  children,
}) => {
  const authEnd = platform === "ios" ? 0.7 : 0.64;
  const contentProgress = minimumJerk((progress - authEnd) / (1 - authEnd));
  const translateY = platform === "ios" ? (1 - contentProgress) * 100 : (1 - contentProgress) * 8;
  const scale = platform === "ios" ? 1 : 0.985 + contentProgress * 0.015;

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {platform === "ios" ? (
        <FaceIDAnimation progress={clamp01(progress / authEnd)} />
      ) : (
        <AndroidUnlockIndicator progress={clamp01(progress / authEnd)} />
      )}
      <div
        data-device-transition={`${platform}-unlock`}
        style={{
          width: "100%",
          height: "100%",
          transform: `translate3d(0, ${translateY}%, 0) scale(${scale})`,
          opacity: contentProgress,
          borderRadius: platform === "android" ? (1 - contentProgress) * 28 : 0,
          overflow: "hidden",
          willChange: "transform, opacity",
        }}
      >
        {children}
      </div>
    </div>
  );
};
