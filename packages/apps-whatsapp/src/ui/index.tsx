import React from "react";
import { WorldState } from "@tokovo/core";
import { injectWhatsAppStyles } from "../styles";
import { WhatsAppThemeProvider } from "../theme/context";

// Screens
import { ChatScreen } from "../components/screens/ChatScreen";
import { ChatListScreen } from "../components/screens/ChatListScreen";

import { WhatsAppState } from "../types";

export interface WhatsappChatViewProps {
  world: WorldState;
  t?: number;
  deviceId?: string;
  platform?: "ios" | "android";
  width?: number;
  height?: number;
  safeAreaInsets?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export const WhatsappChatView: React.FC<WhatsappChatViewProps> = ({
  world,
  t: _t,
  deviceId,
  platform = "ios",
  width,
  height,
  safeAreaInsets,
}) => {
  const resolvedDeviceId =
    deviceId ?? Object.keys(world.devices || {})[0];
  const appTheme =
    resolvedDeviceId && world.devices?.[resolvedDeviceId]?.appTheme
      ? world.devices[resolvedDeviceId]?.appTheme
      : undefined;

  // 1. Resolve App State & Screen
  const appState = world.appState?.["app_whatsapp"] as WhatsAppState;
  const currentScreen = appState?.currentScreen || "chat";

  // 2. Resolve Dimensions (Resolution Independence)
  // Receive logical dimensions from parent (TokovoRenderer's AppSurface)
  // If undefined, assume standard logical width (393)
  const activeWidth = width || 393;
  const activeHeight = height || 2556;

  // 3. Render Appropriate Screen
  // Strategy Pattern for Screen Navigation
  let activeScreenContent;

  switch (currentScreen) {
    case "list":
    case "chats":
    case "chats-list":
      activeScreenContent = (
        <ChatListScreen
          world={world}
          width={activeWidth}
          height={activeHeight}
          safeAreaInsets={safeAreaInsets}
        />
      );
      break;
    case "chat":
    default:
      activeScreenContent = (
        <ChatScreen
          world={world}
          deviceId={deviceId}
          width={activeWidth}
          height={activeHeight}
          safeAreaInsets={safeAreaInsets}
        />
      );
      break;
  }

  // 4. Return Content (Hoisted AppSurface handles scaling now)
  React.useEffect(() => {
    injectWhatsAppStyles();
  }, []);

  return (
    <WhatsAppThemeProvider platform={platform} themeId={appTheme}>
      <div style={{ width: "100%", height: "100%", backgroundColor: "#000" }}>
        {activeScreenContent}
      </div>
    </WhatsAppThemeProvider>
  );
};

// Main Entry
export const ui = {
  WhatsappChatView,
};
