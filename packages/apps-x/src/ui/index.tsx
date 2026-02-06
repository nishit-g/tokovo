import React from "react";
import type { PluginViewProps } from "@tokovo/core";
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
  const appState = world.appState?.["app_x"] as XState | undefined;
  const screen = appState?.currentScreen ?? "timeline";
  const themeMode = getThemeMode(world);

  const renderScreen = () => {
    switch (screen) {
      case "tweet":
        return <TweetDetail world={world} />;
      case "compose":
        return <Compose world={world} deviceId={deviceId} t={t} />;
      case "profile":
        return <Profile world={world} />;
      case "notifications":
        return <Notifications world={world} />;
      case "messages":
        return <Messages world={world} />;
      case "thread":
        return <MessageThread world={world} />;
      case "timeline":
      default:
        return <Timeline world={world} />;
    }
  };

  return (
    <XThemeProvider mode={themeMode}>
      {renderScreen()}
    </XThemeProvider>
  );
};
