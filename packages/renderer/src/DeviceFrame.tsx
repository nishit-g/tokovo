import React from "react";
import { iPhone16Frame, PixelFrame, StatusBar } from "@tokovo/devices";
import { DeviceState, NotificationInstance } from "@tokovo/core";
import {
  Keyboard,
  KeyboardState,
  getKeyboardHeight,
} from "@tokovo/device-keyboard";

interface DeviceFrameProps {
  profileId: string;
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
  const FallbackFrame: React.FC<{
    statusBar?: React.ReactNode;
    children: React.ReactNode;
  }> = ({ statusBar, children: frameChildren }) => (
    <>
      {statusBar}
      {frameChildren}
    </>
  );

  // Strategy pattern: Select frame component based on profile ID
  const FrameComponent =
    profileId === "iphone16"
      ? iPhone16Frame
      : profileId === "pixel"
        ? PixelFrame
        : FallbackFrame;

  // Determine props to pass to the FrameComponent
  const frameProps = {};
  if (profileId === "iphone16" || profileId === "pixel") {
    if (variant) {
      Object.assign(frameProps, { variant });
    }
  }

  // StatusBar reads from device.os if available
  const statusBar = (
    <StatusBar
      os={device?.os}
      variant={variant}
      theme={variant === "android" ? "dark" : "light"}
    />
  );

  return (
    <FrameComponent {...frameProps} statusBar={statusBar}>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          paddingBottom: keyboardState?.visible ? getKeyboardHeight() : 0,
          transition: "padding-bottom 0.25s ease-out",
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
