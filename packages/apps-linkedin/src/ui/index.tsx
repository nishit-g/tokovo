import React from "react";
import {
  requireAppStateForDevice,
  type PluginViewProps,
} from "@tokovo/core";
import type { LinkedInState } from "../runtime/state.js";
import { getThemeMode } from "../runtime/selectors.js";
import { LinkedInThemeProvider } from "./ThemeContext.js";
import { LinkedInAppShell } from "./AppShell.js";
import { Feed } from "./Feed.js";
import { PostDetail } from "./PostDetail.js";
import { Compose } from "./Compose.js";
import { Profile } from "./Profile.js";
import { Notifications } from "./Notifications.js";
import { Messages } from "./Messages.js";
import { MessageThread } from "./MessageThread.js";
import { BottomNav } from "./components.js";

export const LinkedInView: React.FC<PluginViewProps> = ({ world, deviceId, t }) => {
  const appState = requireAppStateForDevice<LinkedInState>(
    world,
    "app_linkedin",
    deviceId,
  );
  const screen = appState.currentScreen;
  const themeMode = getThemeMode(world, deviceId);
  const showNav =
    screen === "feed" ||
    screen === "profile" ||
    screen === "notifications" ||
    screen === "messages";

  const renderScreen = () => {
    switch (screen) {
      case "post":
        return <PostDetail world={world} deviceId={deviceId} />;
      case "compose":
        return <Compose world={world} deviceId={deviceId} t={t} />;
      case "profile":
        return <Profile world={world} deviceId={deviceId} />;
      case "notifications":
        return <Notifications world={world} deviceId={deviceId} />;
      case "messages":
        return <Messages world={world} deviceId={deviceId} />;
      case "thread":
        return <MessageThread world={world} deviceId={deviceId} t={t} />;
      case "feed":
      default:
        return <Feed world={world} deviceId={deviceId} />;
    }
  };

  // Map screen names to nav tab names
  const getActiveTab = () => {
    switch (screen) {
      case "feed":
        return "home" as const;
      case "notifications":
        return "notifications" as const;
      case "profile":
      case "messages":
        return null;
      default:
        return "home" as const;
    }
  };

  return (
    <LinkedInThemeProvider mode={themeMode}>
      <LinkedInAppShell>
        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {renderScreen()}
          </div>
          {showNav && <BottomNav active={getActiveTab()} />}
        </div>
      </LinkedInAppShell>
    </LinkedInThemeProvider>
  );
};
