import React from "react";
import type { PluginViewProps } from "@tokovo/core";
import type { XState } from "../runtime/state";
import { Timeline } from "./Timeline";
import { TweetDetail } from "./TweetDetail";
import { Compose } from "./Compose";
import { Profile } from "./Profile";
import { Notifications } from "./Notifications";
import { Messages } from "./Messages";
import { MessageThread } from "./MessageThread";

export const XView: React.FC<PluginViewProps> = ({ world }) => {
  const appState = world.appState?.["app_x"] as XState | undefined;
  const screen = appState?.currentScreen ?? "timeline";

  switch (screen) {
    case "tweet":
      return <TweetDetail world={world} />;
    case "compose":
      return <Compose world={world} />;
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
