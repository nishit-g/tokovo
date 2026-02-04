import React from "react";
import { useDeviceRegistries } from "@tokovo/devices";
import { DeviceState, NotificationInstance } from "@tokovo/core";
import {
  Keyboard,
  KeyboardState,
  getKeyboardHeight,
  getKeyboardSlideProgress,
} from "@tokovo/device-keyboard";

interface DeviceFrameProps {
  profileId?: string;
  isLocked?: boolean;
  notifications?: NotificationInstance[];
  children: React.ReactNode;
  variant?: "ios" | "android";
  device?: DeviceState;
  keyboardState?: KeyboardState;
  currentFrame?: number;
  fps?: number;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  profileId,
  isLocked,
  notifications: _notifications,
  children,
  variant,
  device,
  keyboardState,
  currentFrame = 0,
  fps = 30,
}) => {
  const deviceRegistries = useDeviceRegistries();

  const FallbackFrame: React.FC<{
    statusBar?: React.ReactNode;
    children: React.ReactNode;
  }> = ({ statusBar, children: frameChildren }) => (
    <>
      {statusBar}
      {frameChildren}
    </>
  );

  const resolvedProfileId = profileId || device?.profileId || "iphone16";
  const profile = deviceRegistries.devices.get(resolvedProfileId);
  const platform = variant ?? profile?.platform ?? "ios";

  // Strategy pattern: Select frame component from registry
  const FrameComponent =
    deviceRegistries.frames.getWithFallback(resolvedProfileId, "iphone16") ??
    FallbackFrame;

  // Determine props to pass to the FrameComponent
  const frameProps = {};
  if (variant) {
    Object.assign(frameProps, { variant });
  }

  const StatusBarStrategy =
    deviceRegistries.statusBars.getWithFallback(platform, "ios");

  // StatusBar reads from device.os if available
  const statusBar = (
    StatusBarStrategy && (
      <StatusBarStrategy
        os={device?.os}
        theme={platform === "android" ? "dark" : "light"}
      />
    )
  );

  const keyboardSlideProgress = keyboardState
    ? getKeyboardSlideProgress(keyboardState, currentFrame, fps)
    : 0;
  const keyboardPadding = keyboardState
    ? getKeyboardHeight() * keyboardSlideProgress
    : 0;

  return (
    <FrameComponent {...frameProps} statusBar={statusBar}>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          paddingBottom: keyboardPadding,
        }}
      >
        {children}
      </div>
      {keyboardState && (
        <Keyboard state={keyboardState} currentFrame={currentFrame} fps={fps} />
      )}
      {isLocked && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(20px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: 300,
            color: "white",
            zIndex: 2000,
          }}
        >
          <div style={{ fontSize: 48, fontWeight: "bold", marginBottom: 60 }}>
            Locked
          </div>
          <div
            style={{
              width: "90%",
              display: "flex",
              flexDirection: "column",
              gap: 24,
            }}
          ></div>
        </div>
      )}
    </FrameComponent>
  );
};
