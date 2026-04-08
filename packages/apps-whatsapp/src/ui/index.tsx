import React from "react";
import { WorldState } from "@tokovo/core";
import { injectWhatsAppStyles } from "../styles.js";
import { WhatsAppThemeProvider } from "../theme/ThemeContext.js";

// Screens
import { ChatScreen } from "../components/screens/ChatScreen.js";
import { ChatListScreen } from "../components/screens/ChatListScreen.js";
import { StatusScreen } from "../components/screens/StatusScreen.js";
import { CommunitiesScreen } from "../components/screens/CommunitiesScreen.js";
import { CallsScreen } from "../components/screens/CallsScreen.js";
import { ProfileScreen } from "../components/screens/ProfileScreen.js";
import { SettingsScreen } from "../components/screens/SettingsScreen.js";

import { WhatsAppState } from "../types/index.js";

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
  const currentScreen = appState?.currentScreen || "chats";

  // 2. Resolve Dimensions (Resolution Independence)
  // Receive logical dimensions from parent (TokovoRenderer's AppSurface)
  // If undefined, assume standard logical width (393)
  const activeWidth = width || 393;
  const activeHeight = height || 852;

  // 3. Render Appropriate Screen
  // Strategy Pattern for Screen Navigation
  let activeScreenContent;

  switch (currentScreen) {
    case "main":
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
    case "status":
      activeScreenContent = (
        <StatusScreen
          world={world}
          width={activeWidth}
          height={activeHeight}
          safeAreaInsets={safeAreaInsets}
        />
      );
      break;
    case "communities":
      activeScreenContent = (
        <CommunitiesScreen
          world={world}
          width={activeWidth}
          height={activeHeight}
          safeAreaInsets={safeAreaInsets}
        />
      );
      break;
    case "calls":
      activeScreenContent = (
        <CallsScreen
          world={world}
          width={activeWidth}
          height={activeHeight}
          safeAreaInsets={safeAreaInsets}
        />
      );
      break;
    case "settings":
      activeScreenContent = (
        <SettingsScreen
          world={world}
          width={activeWidth}
          height={activeHeight}
          safeAreaInsets={safeAreaInsets}
        />
      );
      break;
    case "profile":
      activeScreenContent = (
        <ProfileScreen
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
          deviceId={resolvedDeviceId}
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
      <div style={{ width: "100%", height: "100%" }}>
        {activeScreenContent}
      </div>
    </WhatsAppThemeProvider>
  );
};

// Main Entry
export const ui = {
  WhatsappChatView,
};
