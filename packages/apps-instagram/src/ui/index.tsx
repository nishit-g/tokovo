import React from "react";
import {
  requireAppStateForDevice,
  type PluginViewProps,
} from "@tokovo/core";
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
  const state = requireAppStateForDevice<import("../runtime/state.js").InstagramState>(
    world,
    "app_instagram",
    deviceId,
  );
  const screen = state.currentScreen;
  const themeMode = getThemeMode(world, deviceId);

  return (
    <InstagramThemeProvider mode={themeMode}>
      {screen === "story" ? (
        <StoryViewer world={world} deviceId={deviceId} />
      ) : screen === "notifications" ? (
        <NotificationsScreen world={world} deviceId={deviceId} />
      ) : screen === "inbox" ? (
        <Inbox world={world} deviceId={deviceId} />
      ) : screen === "thread" ? (
        <DMThread world={world} deviceId={deviceId} t={t} />
      ) : screen === "profile" ? (
        <ProfileScreen world={world} deviceId={deviceId} />
      ) : screen === "composer" ? (
        <ComposerScreen world={world} deviceId={deviceId} t={t} />
      ) : (
        <HomeFeed world={world} deviceId={deviceId} />
      )}
    </InstagramThemeProvider>
  );
};

export * from "./ThemeContext.js";
export * from "./AppShell.js";
