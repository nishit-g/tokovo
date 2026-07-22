import React from "react";
import { useAppViewport } from "@tokovo/react";
import {
  requireAppStateForDevice,
  type PluginViewProps,
} from "@tokovo/core";
import { TEAMS_APP_ID, TEAMS_TABS } from "../constants.js";
import type { TeamsState } from "../types/index.js";
import {
  appBodyStyle,
  createTeamsRootVars,
  injectTeamsStyles,
  shellStyle,
  tabBarStyle,
  tabItemStyle,
} from "../styles.js";
import {
  CalendarIcon,
  CallsIcon,
  ChatIcon,
  MoreIcon,
  TeamsIcon,
} from "../components/shared/Icons.js";
import { ChatListScreen } from "../components/screens/ChatListScreen.js";
import { ChannelFeedScreen } from "../components/screens/ChannelFeedScreen.js";
import { ThreadScreen } from "../components/screens/ThreadScreen.js";
import { CallOverlayScreen } from "../components/screens/CallOverlayScreen.js";
import { TeamsThemeProvider, useTeamsTheme } from "../theme/index.js";

const TABS = [
  { id: TEAMS_TABS.CHAT, label: "Chat", Icon: ChatIcon },
  { id: TEAMS_TABS.TEAMS, label: "Teams", Icon: TeamsIcon },
  { id: TEAMS_TABS.CALENDAR, label: "Calendar", Icon: CalendarIcon },
  { id: TEAMS_TABS.CALLS, label: "Calls", Icon: CallsIcon },
  { id: TEAMS_TABS.MORE, label: "More", Icon: MoreIcon },
] as const;

function BottomTabs({ activeTab }: { activeTab: TeamsState["ui"]["activeTab"] }) {
  return (
    <div style={tabBarStyle}>
      {TABS.map((tab) => {
        const active = tab.id === activeTab;
        return (
          <div key={tab.id} style={tabItemStyle(active)}>
            <tab.Icon
              size={20}
              color={active ? "var(--teams-tab-active)" : "var(--teams-tab-inactive)"}
            />
            <span>{tab.label}</span>
          </div>
        );
      })}
    </div>
  );
}

const TeamsSurface: React.FC<{ state: TeamsState }> = ({ state }) => {
  const { interactiveInsets: contentInsets } = useAppViewport();
  const theme = useTeamsTheme();

  React.useEffect(() => {
    injectTeamsStyles();
  }, []);

  return (
    <div
      className="tokovo-teams"
      style={{
        ...createTeamsRootVars(theme),
        ...shellStyle,
        paddingTop: contentInsets.top,
        paddingBottom: state.screen === "call_overlay" ? 0 : contentInsets.bottom,
      }}
    >
      <div style={appBodyStyle}>
        {state.screen === "chat_list" ? <ChatListScreen state={state} /> : null}
        {state.screen === "channel_feed" ? <ChannelFeedScreen state={state} /> : null}
        {state.screen === "dm_thread" || state.screen === "channel_thread" ? (
          <ThreadScreen state={state} />
        ) : null}
        {state.screen === "call_overlay" ? <CallOverlayScreen state={state} /> : null}
      </div>
      {state.screen !== "call_overlay" ? <BottomTabs activeTab={state.ui.activeTab} /> : null}
    </div>
  );
};

export const TeamsView: React.FC<PluginViewProps> = ({ world, deviceId, platform }) => {
  const state = requireAppStateForDevice<TeamsState>(
    world,
    TEAMS_APP_ID,
    deviceId,
  );
  const device = world.devices[deviceId];
  if (!device) {
    throw new Error(`TEAMS_DEVICE_MISSING: "${deviceId}" is not in world state.`);
  }
  const appTheme = device.appTheme;

  return (
    <TeamsThemeProvider
      platform={platform}
      darkMode={device.os.appearance === "dark"}
      themeId={appTheme}
    >
      <TeamsSurface state={state} />
    </TeamsThemeProvider>
  );
};
