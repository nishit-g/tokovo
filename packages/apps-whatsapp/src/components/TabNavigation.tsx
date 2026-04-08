import React from "react";
import {
  UpdatesIcon,
  CallsTabIcon,
  CommunitiesIcon,
  ChatsIcon,
  SettingsIcon,
} from "./Icons.js";
import { spacing, typography } from "./theme.js";
import { useTheme } from "../theme/ThemeContext.js";

export interface TabNavigationProps {
  activeTab?: "updates" | "calls" | "communities" | "chats" | "settings";
  safeAreaBottom?: number;
  unreadChatsCount?: number;
  missedCallsCount?: number;
}

const TabBadge: React.FC<{ count: number; isMuted?: boolean }> = ({
  count,
  isMuted,
}) => {
  const theme = useTheme();
  if (count <= 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: spacing.tabBadgeOffsetTop,
        right: spacing.tabBadgeOffsetRight,
        backgroundColor: isMuted ? theme.colors.timestamp : theme.colors.unreadBadge,
        color: theme.colors.unreadBadgeText,
        borderRadius: spacing.badgeRadius,
        minWidth: spacing.badgeMinWidth,
        height: spacing.badgeHeight,
        padding: `0 ${spacing.badgePadding}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...typography.badge,
        fontFamily: theme.typography.fontFamily,
      }}
    >
      {count > 99 ? "99+" : count}
    </div>
  );
};

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab = "chats",
  safeAreaBottom = 34,
  unreadChatsCount = 0,
  missedCallsCount = 0,
}) => {
  const theme = useTheme();
  const activeColor = theme.colors.accent;
  const inactiveColor = theme.colors.timestamp;

  const tabs = [
    { id: "updates", label: "Updates", Icon: UpdatesIcon, badge: 0 },
    { id: "calls", label: "Calls", Icon: CallsTabIcon, badge: missedCallsCount },
    { id: "communities", label: "Communities", Icon: CommunitiesIcon, badge: 0 },
    { id: "chats", label: "Chats", Icon: ChatsIcon, badge: unreadChatsCount },
    { id: "settings", label: "Settings", Icon: SettingsIcon, badge: 0 },
  ] as const;

  return (
    <div
      style={{
        backgroundColor: `${theme.colors.headerBackground}F2`,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: `0.5px solid ${theme.colors.divider}`,
        display: "flex",
        justifyContent: "space-around",
        paddingBottom: safeAreaBottom,
        paddingTop: spacing.tabPaddingTop,
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const color = isActive ? activeColor : inactiveColor;

        return (
          <div
            key={tab.id}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
              flex: 1,
              position: "relative",
            }}
          >
            <div style={{ position: "relative" }}>
              <tab.Icon color={color} filled={isActive} />
              <TabBadge count={tab.badge} />
            </div>
            <div
              style={{
                ...typography.tabLabel,
                marginTop: 2,
                color,
                fontFamily: theme.typography.fontFamily,
              }}
            >
              {tab.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TabNavigation;
