import React from "react";
import { CallState } from "@tokovo/core";
import type { DeviceProfile } from "@tokovo/devices";
import { getIOSChromeMetrics } from "@tokovo/devices";

const iconBase = {
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "none",
};

const MuteIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 3.75a2.75 2.75 0 0 0-2.75 2.75v4.5a2.75 2.75 0 1 0 5.5 0V6.5A2.75 2.75 0 0 0 12 3.75Z" {...iconBase} />
    <path d="M7.5 10.5v.5a4.5 4.5 0 1 0 9 0v-.5" {...iconBase} />
    <path d="M12 15.5v4" {...iconBase} />
    <path d="M9.5 19.5h5" {...iconBase} />
  </svg>
);

const KeypadIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    {[5, 12, 19].flatMap((x) =>
      [5, 12, 19].map((y) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="1.7" />
      )),
    )}
  </svg>
);

const SpeakerIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M5 9h3.25L13 5.5v13l-4.75-3.5H5z" {...iconBase} />
    <path d="M16 9.25a3.75 3.75 0 0 1 0 5.5" {...iconBase} />
    <path d="M18.5 7a7 7 0 0 1 0 10" {...iconBase} />
  </svg>
);

const AddCallIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 5v14" {...iconBase} />
    <path d="M5 12h14" {...iconBase} />
  </svg>
);

const ContactsIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="8" r="3.5" {...iconBase} />
    <path d="M5.5 19a6.5 6.5 0 0 1 13 0" {...iconBase} />
  </svg>
);

const VideoIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="3.5" y="6.5" width="11" height="11" rx="2.5" {...iconBase} />
    <path d="M14.5 10l5-2.5v9L14.5 14z" {...iconBase} />
  </svg>
);

const PhoneIcon = ({ size, rotate = 0 }: { size: number; rotate?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    style={{ transform: `rotate(${rotate}deg)` }}
  >
    <path
      d="M7.2 4.4h2.2c.5 0 .9.35 1 .84l.48 2.55a1 1 0 0 1-.29.9l-1.35 1.3a14 14 0 0 0 4.31 4.31l1.3-1.35a1 1 0 0 1 .9-.29l2.55.48c.49.1.84.52.84 1v2.2c0 .59-.5 1.06-1.08 1.02-7.82-.5-14.11-6.8-14.61-14.61A1.03 1.03 0 0 1 7.2 4.4Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CallTimer: React.FC<{ startedAt: number; currentTime: number; fps?: number }> = ({
  startedAt,
  currentTime,
  fps = 30,
}) => {
  const elapsedFrames = Math.max(0, currentTime - startedAt);
  const elapsedSeconds = Math.floor(elapsedFrames / fps);
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  return (
    <span style={{ fontVariantNumeric: "tabular-nums" }}>
      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </span>
  );
};

function getDisplayInitial(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  return Array.from(trimmed)[0] ?? "?";
}

interface ControlButtonProps {
  icon: React.ReactNode;
  label: string;
  size: number;
  labelSize: number;
  variant?: "default" | "accept" | "decline";
  active?: boolean;
}

const ControlButton: React.FC<ControlButtonProps> = ({
  icon,
  label,
  size,
  labelSize,
  variant = "default",
  active = false,
}) => {
  const background =
    variant === "accept"
      ? "#34C759"
      : variant === "decline"
        ? "#FF3B30"
        : active
          ? "rgba(255,255,255,0.28)"
          : "rgba(255,255,255,0.14)";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: labelSize * 0.55,
        minWidth: size,
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          background,
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(30px) saturate(160%)",
          WebkitBackdropFilter: "blur(30px) saturate(160%)",
          boxShadow:
            variant === "accept" || variant === "decline"
              ? "0 18px 34px rgba(0,0,0,0.26)"
              : "inset 0 1px 0 rgba(255,255,255,0.18), 0 18px 32px rgba(0,0,0,0.24)",
          border:
            variant === "default"
              ? "1px solid rgba(255,255,255,0.12)"
              : "none",
        }}
      >
        {icon}
      </div>
      <div
        style={{
          fontSize: labelSize,
          color: "rgba(255,255,255,0.86)",
          letterSpacing: -0.35,
          textTransform: "lowercase",
        }}
      >
        {label}
      </div>
    </div>
  );
};

interface CallOverlayProps {
  call: CallState;
  currentTime: number;
  variant?: "ios" | "android";
  deviceProfile?: DeviceProfile;
}

export const CallOverlay: React.FC<CallOverlayProps> = ({
  call,
  currentTime,
  variant = "ios",
  deviceProfile,
}) => {
  if (variant !== "ios" || call.status === "ended") {
    return null;
  }

  const metrics = deviceProfile ? getIOSChromeMetrics(deviceProfile) : null;
  const pointScale = metrics?.pointScale ?? 3;
  const safeTop = deviceProfile?.safeArea?.top ?? 47 * pointScale;
  const safeBottom = deviceProfile?.safeArea?.bottom ?? 34 * pointScale;
  const pulse =
    call.status === "incoming"
      ? 0.92 + 0.08 * (0.5 + 0.5 * Math.sin(currentTime * 0.12))
      : 1;
  const isIncoming = call.status === "incoming" || call.status === "ringing";
  const callerMetadata = call.callerMetadata;
  const posterBackground = call.callerAvatar
    ? [
        `linear-gradient(180deg, rgba(8,11,18,0.18), rgba(8,11,18,0.78))`,
        `url(${call.callerAvatar}) center/cover no-repeat`,
        "linear-gradient(180deg, #273447 0%, #0b1018 100%)",
      ].join(", ")
    : callerMetadata?.posterColor
      ? [
          `linear-gradient(180deg, ${callerMetadata.posterColor} 0%, rgba(11,16,24,0.9) 100%)`,
          "linear-gradient(180deg, #22324a 0%, #0b1018 100%)",
        ].join(", ")
      : "radial-gradient(70% 60% at 50% 14%, rgba(109,149,255,0.38) 0%, rgba(109,149,255,0.06) 48%, rgba(0,0,0,0) 70%), linear-gradient(180deg, #22324a 0%, #111827 48%, #070b11 100%)";
  const topPillFontSize = 15 * pointScale;
  const iconSize = 29 * pointScale;
  const buttonSize = 84 * pointScale;
  const actionButtonSize = 102 * pointScale;
  const labelSize = 14.5 * pointScale;
  const incomingNameSize = 61 * pointScale;
  const activeNameSize = 46 * pointScale;
  const statusSize = 21 * pointScale;
  const topPadding = safeTop + 18 * pointScale;
  const bottomPadding = safeBottom + 20 * pointScale;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "#0a0d14",
        background: posterBackground,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
        color: "white",
        zIndex: 7000,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(5,8,14,0.78) 0%, rgba(5,8,14,0.9) 18%, rgba(4,6,11,0.97) 48%, rgba(3,5,9,1) 100%)",
          backdropFilter: "blur(34px) saturate(128%)",
          WebkitBackdropFilter: "blur(34px) saturate(128%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(62% 42% at 50% 10%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.02) 46%, rgba(255,255,255,0) 72%)",
          mixBlendMode: "screen",
          opacity: 0.18,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          height: "100%",
          padding: `${topPadding}px ${20 * pointScale}px ${bottomPadding}px`,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              padding: `${7 * pointScale}px ${16 * pointScale}px`,
              borderRadius: 999,
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(34px) saturate(160%)",
              WebkitBackdropFilter: "blur(34px) saturate(160%)",
              border: "1px solid rgba(255,255,255,0.09)",
              fontSize: topPillFontSize,
              letterSpacing: -0.4,
              color: "rgba(255,255,255,0.9)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
            }}
          >
            {call.isVideo ? "FaceTime Video" : "Phone"}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12 * pointScale,
            marginTop: isIncoming ? 18 * pointScale : 38 * pointScale,
            flex: 1,
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: isIncoming ? 164 * pointScale : 130 * pointScale,
              height: isIncoming ? 164 * pointScale : 130 * pointScale,
              borderRadius: "50%",
              background:
                call.callerAvatar
                  ? `url(${call.callerAvatar}) center/cover no-repeat`
                  : "linear-gradient(135deg, rgba(255,255,255,0.34) 0%, rgba(255,255,255,0.12) 100%)",
              border: "1px solid rgba(255,255,255,0.14)",
              boxShadow: isIncoming
                ? "0 44px 120px rgba(0,0,0,0.48), 0 0 0 18px rgba(255,255,255,0.03)"
                : "0 28px 70px rgba(0,0,0,0.38)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${pulse})`,
              fontSize: (isIncoming ? 58 : 46) * pointScale,
              fontWeight: 500,
              color: "white",
            }}
          >
            {!call.callerAvatar ? getDisplayInitial(call.callerName).toUpperCase() : null}
          </div>

          <div
            style={{
              fontSize: isIncoming ? incomingNameSize : activeNameSize,
              fontWeight: 400,
              lineHeight: 1.04,
              letterSpacing: -1.8,
              textAlign: "center",
              maxWidth: 0.82 * (metrics?.logicalWidth ?? 430) * pointScale,
              textWrap: "balance",
            }}
          >
            {call.callerName}
          </div>

          <div
            style={{
              fontSize: statusSize,
              color: "rgba(255,255,255,0.76)",
              letterSpacing: -0.45,
            }}
          >
            {isIncoming
              ? "incoming call"
              : call.status === "connecting"
                ? "connecting…"
                : (call.answeredAt ?? call.startedAt) !== undefined
                  ? <CallTimer startedAt={call.answeredAt ?? call.startedAt ?? currentTime} currentTime={currentTime} />
                  : "active call"}
          </div>

          {callerMetadata?.posterStyle === "modern" && (
            <div
              style={{
                marginTop: 2 * pointScale,
                fontSize: 12 * pointScale,
                color: "rgba(255,255,255,0.56)",
                letterSpacing: -0.18,
              }}
            >
              call screening available
            </div>
          )}
        </div>

        {isIncoming ? (
          <div
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                padding: `0 ${14 * pointScale}px`,
                maxWidth: 344 * pointScale,
              }}
            >
            <ControlButton
              icon={<PhoneIcon size={iconSize} rotate={135} />}
              label="decline"
              size={actionButtonSize}
              labelSize={labelSize}
              variant="decline"
            />
            <ControlButton
              icon={call.isVideo ? <VideoIcon size={iconSize} /> : <PhoneIcon size={iconSize} rotate={-45} />}
              label="accept"
              size={actionButtonSize}
              labelSize={labelSize}
              variant="accept"
            />
          </div>
        ) : (
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 20 * pointScale,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: `${18 * pointScale}px ${24 * pointScale}px`,
                width: "100%",
                maxWidth: 354 * pointScale,
                justifyItems: "center",
              }}
            >
              <ControlButton
                icon={<MuteIcon size={iconSize} />}
                label="mute"
                size={buttonSize}
                labelSize={labelSize}
                active={!!call.isMuted}
              />
              <ControlButton
                icon={<KeypadIcon size={iconSize} />}
                label="keypad"
                size={buttonSize}
                labelSize={labelSize}
              />
              <ControlButton
                icon={<SpeakerIcon size={iconSize} />}
                label="speaker"
                size={buttonSize}
                labelSize={labelSize}
                active={!!call.isSpeakerOn}
              />
              <ControlButton
                icon={<AddCallIcon size={iconSize} />}
                label="add call"
                size={buttonSize}
                labelSize={labelSize}
              />
              <ControlButton
                icon={<VideoIcon size={iconSize} />}
                label="FaceTime"
                size={buttonSize}
                labelSize={labelSize}
              />
              <ControlButton
                icon={<ContactsIcon size={iconSize} />}
                label="contacts"
                size={buttonSize}
                labelSize={labelSize}
              />
            </div>

            <ControlButton
              icon={<PhoneIcon size={iconSize} rotate={135} />}
              label="end"
              size={actionButtonSize}
              labelSize={labelSize}
              variant="decline"
            />
          </div>
        )}
      </div>
    </div>
  );
};
