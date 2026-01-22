import React from "react";
import { UpdatesIcon, CallsTabIcon, CommunitiesIcon, ChatsIcon, SettingsIcon } from "./Icons";
import { whatsappColors, typography, spacing } from "./theme";

// =============================================================================
// TYPES
// =============================================================================

export interface TabNavigationProps {
  activeTab?: "status" | "calls" | "communities" | "chats" | "settings";
  safeAreaBottom?: number;
  unreadChatsCount?: number;
  missedCallsCount?: number;
}

// =============================================================================
// BADGE COMPONENT
// =============================================================================

const TabBadge: React.FC<{ count: number; isMuted?: boolean }> = ({ count, isMuted }) => {
  if (count <= 0) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: -4,
        right: -8,
        backgroundColor: isMuted ? whatsappColors.textSecondary : whatsappColors.primary,
        color: "white",
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        padding: "0 5px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: "600",
      }}
    >
      {count > 99 ? "99+" : count}
    </div>
  );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab = "chats",
  safeAreaBottom = 34,
  unreadChatsCount = 0,
  missedCallsCount = 0,
}) => {
  // Use GREEN for active, not blue!
  const activeColor = whatsappColors.tabActive;
  const inactiveColor = whatsappColors.tabInactive;

  const tabs = [
    { id: "status", label: "Status", Icon: UpdatesIcon, badge: 0 },
    { id: "calls", label: "Calls", Icon: CallsTabIcon, badge: missedCallsCount },
    { id: "communities", label: "Communities", Icon: CommunitiesIcon, badge: 0 },
    { id: "chats", label: "Chats", Icon: ChatsIcon, badge: unreadChatsCount },
    { id: "settings", label: "Settings", Icon: SettingsIcon, badge: 0 },
  ] as const;

  return (
    <div
      style={{
        backgroundColor: "rgba(249, 249, 249, 0.94)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: `0.5px solid ${whatsappColors.separator}`,
        display: "flex",
        justifyContent: "space-around",
        paddingBottom: safeAreaBottom,
        paddingTop: 6,
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
                color: color,
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
