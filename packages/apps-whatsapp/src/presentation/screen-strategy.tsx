import React from "react";
import type { WorldState } from "@tokovo/core";
import { CallsScreen } from "../components/screens/CallsScreen.js";
import { ChatListScreen } from "../components/screens/ChatListScreen.js";
import { ChatScreen } from "../components/screens/ChatScreen.js";
import { CommunitiesScreen } from "../components/screens/CommunitiesScreen.js";
import { ProfileScreen } from "../components/screens/ProfileScreen.js";
import { SettingsScreen } from "../components/screens/SettingsScreen.js";
import { UpdatesScreen } from "../components/screens/UpdatesScreen.js";
import { resolveWhatsAppScreenId, type WhatsAppScreenId } from "./strategy.js";

export interface WhatsAppScreenStrategyProps {
  world: WorldState;
  deviceId: string;
  width: number;
  height: number;
  contentInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

type ScreenRenderer = (props: WhatsAppScreenStrategyProps) => React.ReactElement | null;

const SCREEN_RENDERERS: Readonly<Record<WhatsAppScreenId, ScreenRenderer>> = {
  chats: (props) => <ChatListScreen {...props} />,
  updates: (props) => <UpdatesScreen {...props} />,
  communities: (props) => <CommunitiesScreen {...props} />,
  calls: (props) => <CallsScreen {...props} />,
  settings: (props) => <SettingsScreen {...props} />,
  profile: (props) => <ProfileScreen {...props} />,
  chat: (props) => <ChatScreen {...props} />,
};

export function renderWhatsAppScreen(
  screen: string | undefined,
  props: WhatsAppScreenStrategyProps,
): React.ReactElement | null {
  return SCREEN_RENDERERS[resolveWhatsAppScreenId(screen)](props);
}
