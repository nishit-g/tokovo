import React from "react";
import { UpdatesIcon, CallsTabIcon, CommunitiesIcon, ChatsIcon, SettingsIcon } from "./Icons.js";
import {
  useTheme,
  useWhatsAppLocale,
  useWhatsAppPresentation,
} from "../experience/ExperienceContext.js";
import type { WhatsAppTabId } from "../presentation/strategy.js";
import { formatWhatsAppNumber } from "../localization/index.js";

export interface TabNavigationProps {
  activeTab?: "updates" | "calls" | "communities" | "chats" | "settings";
  contentInsetBottom: number;
  unreadChatsCount?: number;
  missedCallsCount?: number;
}

const TabBadge: React.FC<{ count: number; isMuted?: boolean }> = ({ count, isMuted }) => {
  const theme = useTheme();
  const { uiSpacing: spacing, uiTypography: typography } = theme;
  if (count <= 0) return null;

  return (
    <div
      aria-hidden="true"
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
  contentInsetBottom,
  unreadChatsCount = 0,
  missedCallsCount = 0,
}) => {
  const theme = useTheme();
  const { locale, t } = useWhatsAppLocale();
  const presentation = useWhatsAppPresentation();
  const { uiSpacing: spacing, uiTypography: typography } = theme;
  const activeColor =
    presentation.navigation.activeColor === "headerText"
      ? theme.colors.headerText
      : theme.colors.accent;
  const inactiveColor = theme.colors.timestamp;

  const allTabs = [
    { id: "updates", label: t("nav.updates"), Icon: UpdatesIcon, badge: 0 },
    {
      id: "calls",
      label: t("nav.calls"),
      Icon: CallsTabIcon,
      badge: missedCallsCount,
    },
    {
      id: "communities",
      label: t("nav.communities"),
      Icon: CommunitiesIcon,
      badge: 0,
    },
    { id: "chats", label: t("nav.chats"), Icon: ChatsIcon, badge: unreadChatsCount },
    { id: "settings", label: t("nav.settings"), Icon: SettingsIcon, badge: 0 },
  ] as const satisfies ReadonlyArray<{
    id: WhatsAppTabId;
    label: string;
    Icon: React.FC<{ color?: string; filled?: boolean }>;
    badge: number;
  }>;
  const tabs = allTabs.filter((tab) => presentation.navigation.tabs.includes(tab.id));

  return (
    <nav
      aria-label={t("app.name")}
      style={{
        backgroundColor: theme.colors.background,
        borderTop: `0.5px solid ${theme.colors.divider}`,
        display: "flex",
        justifyContent: "space-around",
        paddingBottom: contentInsetBottom,
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
          <button
            key={tab.id}
            type="button"
            aria-label={`${tab.label}${
              tab.id === "chats" && tab.badge > 0
                ? `, ${t("a11y.unreadMessages", {
                    count: formatWhatsAppNumber(locale, tab.badge),
                  })}`
                : tab.id === "calls" && tab.badge > 0
                  ? `, ${t("a11y.missedCalls", {
                      count: formatWhatsAppNumber(locale, tab.badge),
                    })}`
                  : ""
            }`}
            aria-current={isActive ? "page" : undefined}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
              flex: 1,
              position: "relative",
              padding: 0,
              border: 0,
              color: "inherit",
              background: "transparent",
              font: "inherit",
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
          </button>
        );
      })}
    </nav>
  );
};

export default TabNavigation;
