import React from "react";
import {
  requireAppStateForDevice,
  type PluginViewProps,
} from "@tokovo/core";
import type { XState } from "../runtime/state.js";
import { getThemeMode } from "../runtime/selectors.js";
import { XThemeProvider } from "./ThemeContext.js";
import { Timeline } from "./Timeline.js";
import { TweetDetail } from "./TweetDetail.js";
import { Compose } from "./Compose.js";
import { Profile } from "./Profile.js";
import { Notifications } from "./Notifications.js";
import { Messages } from "./Messages.js";
import { MessageThread } from "./MessageThread.js";

export const XView: React.FC<PluginViewProps> = ({ world, deviceId, t }) => {
  const appState = requireAppStateForDevice<XState>(world, "app_x", deviceId);
  const screen = appState.currentScreen;
  const themeMode = getThemeMode(world, deviceId);

  const renderScreen = () => {
    switch (screen) {
      case "tweet":
        return <TweetDetail world={world} deviceId={deviceId} t={t} />;
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
      case "timeline":
      default:
        return <Timeline world={world} deviceId={deviceId} />;
    }
  };

  return (
    <XThemeProvider mode={themeMode}>
      {renderScreen()}
    </XThemeProvider>
  );
};
