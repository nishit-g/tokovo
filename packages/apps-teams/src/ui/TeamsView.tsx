import React from "react";
import { useSafeAreaInsets } from "@tokovo/react";
import type { PluginViewProps } from "@tokovo/core";
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
import { CalendarIcon, CallsIcon, ChatIcon, MoreIcon, TeamsIcon } from "../components/shared/Icons.js";
import { ChatListScreen } from "../components/screens/ChatListScreen.js";
import { ChannelFeedScreen } from "../components/screens/ChannelFeedScreen.js";
import { ThreadScreen } from "../components/screens/ThreadScreen.js";
import { CallOverlayScreen } from "../components/screens/CallOverlayScreen.js";
import { createTeamsInitialState } from "../runtime/initial-state.js";
import { TeamsThemeProvider, useTeamsTheme } from "../theme/index.js";

const CallsFallbackIcon = CallsIcon ?? ChatIcon;

function getState(world: PluginViewProps["world"]): TeamsState {
  const state = world.appState?.[TEAMS_APP_ID];
  if (state && typeof state === "object" && "ui" in state) {
    return state as TeamsState;
  }
  return createTeamsInitialState();
}

const TABS = [
  { id: TEAMS_TABS.CHAT, label: "Chat", Icon: ChatIcon },
  { id: TEAMS_TABS.TEAMS, label: "Teams", Icon: TeamsIcon },
  { id: TEAMS_TABS.CALENDAR, label: "Calendar", Icon: CalendarIcon },
  { id: TEAMS_TABS.CALLS, label: "Calls", Icon: CallsFallbackIcon },
  { id: TEAMS_TABS.MORE, label: "More", Icon: MoreIcon },
] as const;

function resolvePlatform(
  platform: PluginViewProps["platform"],
  deviceId: string | undefined,
): "ios" | "android" {
  if (platform) return platform;
  const normalized = (deviceId ?? "").toLowerCase();
  return normalized.includes("android") ||
    normalized.includes("pixel") ||
    normalized.includes("galaxy") ||
    normalized.includes("samsung")
    ? "android"
    : "ios";
}

function resolveDarkMode(appTheme?: string): boolean {
  if (!appTheme) return false;
  return /(dark|night|midnight)/i.test(appTheme);
}

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
  const safeArea = useSafeAreaInsets();
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
        paddingTop: safeArea.top,
        paddingBottom: state.screen === "call_overlay" ? 0 : safeArea.bottom,
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

export const TeamsView: React.FC<PluginViewProps> = ({
  world,
  deviceId,
  platform,
}) => {
  const state = getState(world);
  const resolvedDeviceId = deviceId ?? Object.keys(world.devices ?? {})[0];
  const appTheme = resolvedDeviceId
    ? world.devices?.[resolvedDeviceId]?.appTheme
    : undefined;
  const resolvedPlatform = resolvePlatform(platform, resolvedDeviceId);

  return (
    <TeamsThemeProvider
      platform={resolvedPlatform}
      darkMode={resolveDarkMode(appTheme)}
      themeId={appTheme}
    >
      <TeamsSurface state={state} />
    </TeamsThemeProvider>
  );
};
