import React from "react";
import type { XState } from "../runtime/state.js";
import { ComposeScreen } from "../components/screens/ComposeScreen.js";
import { MessagesScreen } from "../components/screens/MessagesScreen.js";
import { NotificationsScreen } from "../components/screens/NotificationsScreen.js";
import { ProfileScreen } from "../components/screens/ProfileScreen.js";
import { ThreadScreen } from "../components/screens/ThreadScreen.js";
import { TimelineScreen } from "../components/screens/TimelineScreen.js";
import { TweetScreen } from "../components/screens/TweetScreen.js";
import type { XScreenProps } from "../components/screens/types.js";

export function renderXScreen(route: XState["route"], props: XScreenProps): React.ReactNode {
  switch (route.screen) {
    case "timeline": return <TimelineScreen {...props} />;
    case "tweet": return <TweetScreen {...props} />;
    case "compose": return <ComposeScreen {...props} />;
    case "profile": return <ProfileScreen {...props} />;
    case "notifications": return <NotificationsScreen {...props} />;
    case "messages": return <MessagesScreen {...props} />;
    case "thread": return <ThreadScreen {...props} />;
    default: {
      const exhaustive: never = route.screen;
      throw new Error(`X_SCREEN_UNSUPPORTED: "${String(exhaustive)}"`);
    }
  }
}
