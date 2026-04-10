import React from "react";
import type { PluginViewProps } from "@tokovo/core";
import { getThemeMode } from "../runtime/selectors.js";
import { InstagramThemeProvider } from "./ThemeContext.js";
import { HomeFeed } from "./HomeFeed.js";
import { StoryViewer } from "./StoryViewer.js";
import { NotificationsScreen } from "./Notifications.js";
import { Inbox } from "./Inbox.js";
import { DMThread } from "./DMThread.js";
import { ProfileScreen } from "./Profile.js";
import { ComposerScreen } from "./Composer.js";

export const InstagramView: React.FC<PluginViewProps> = ({ world, deviceId, t }) => {
  const screen =
    (world.appState?.app_instagram as { currentScreen?: string } | undefined)?.currentScreen ??
    "home";
  const themeMode = getThemeMode(world);

  return (
    <InstagramThemeProvider mode={themeMode}>
      {screen === "story" ? (
        <StoryViewer world={world} />
      ) : screen === "notifications" ? (
        <NotificationsScreen world={world} />
      ) : screen === "inbox" ? (
        <Inbox world={world} />
      ) : screen === "thread" ? (
        <DMThread world={world} deviceId={deviceId} t={t} />
      ) : screen === "profile" ? (
        <ProfileScreen world={world} />
      ) : screen === "composer" ? (
        <ComposerScreen world={world} deviceId={deviceId} t={t} />
      ) : (
        <HomeFeed world={world} />
      )}
    </InstagramThemeProvider>
  );
};

export * from "./ThemeContext.js";
export * from "./AppShell.js";
