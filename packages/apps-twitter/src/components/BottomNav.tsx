/**
 * Bottom Navigation Component
 * 
 * Home, Search, Grok, Notifications, Messages tabs.
 */

import React from "react";
import { twitterColors, twitterLayout, twitterSpacing } from "../config";

// =============================================================================
// TYPES
// =============================================================================

export type TabId = "home" | "search" | "grok" | "notifications" | "messages";

export interface BottomNavProps {
    activeTab?: TabId;
    unreadNotifications?: number;
    unreadMessages?: number;
}

// =============================================================================
// ICONS
// =============================================================================

const HomeIcon: React.FC<{ active: boolean; size: number }> = ({ active, size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? twitterColors.text.primary : "none"} stroke={twitterColors.text.primary} strokeWidth={active ? 0 : 2}>
        {active ? (
            <path d="M12 1.696L.622 8.807l1.06 1.696L3 9.679V19.5A2.5 2.5 0 0 0 5.5 22h5V14h3v8h5.5a2.5 2.5 0 0 0 2.5-2.5V9.679l1.318.824 1.06-1.696L12 1.696z" />
        ) : (
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        )}
    </svg>
);

const SearchIcon: React.FC<{ active: boolean; size: number }> = ({ active, size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={twitterColors.text.primary} strokeWidth={active ? 3 : 2}>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const GrokIcon: React.FC<{ active: boolean; size: number }> = ({ active, size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? twitterColors.text.primary : "none"} stroke={twitterColors.text.primary} strokeWidth={active ? 0 : 2}>
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
);

const NotificationsIcon: React.FC<{ active: boolean; size: number }> = ({ active, size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? twitterColors.text.primary : "none"} stroke={twitterColors.text.primary} strokeWidth={active ? 0 : 2}>
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
);

const MessagesIcon: React.FC<{ active: boolean; size: number }> = ({ active, size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={active ? twitterColors.text.primary : "none"} stroke={twitterColors.text.primary} strokeWidth={active ? 0 : 2}>
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
    </svg>
);

// =============================================================================
// BADGE
// =============================================================================

const Badge: React.FC<{ count: number }> = ({ count }) => {
    if (count <= 0) return null;

    const displayCount = count > 99 ? "99+" : count.toString();

    return (
        <div style={{
            position: "absolute",
            top: -6,
            right: -12,
            minWidth: 48,
            height: 48,
            backgroundColor: twitterColors.brand.blue,
            borderRadius: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 12px",
        }}>
            <span style={{
                fontSize: 30,
                fontWeight: 700,
                color: "white",
                fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
            }}>
                {displayCount}
            </span>
        </div>
    );
};

// =============================================================================
// BOTTOM NAV COMPONENT
// =============================================================================

export const BottomNav: React.FC<BottomNavProps> = ({
    activeTab = "home",
    unreadNotifications = 0,
    unreadMessages = 0,
}) => {
    const iconSize = 72;

    const tabs: { id: TabId; icon: React.FC<{ active: boolean; size: number }>; badge?: number }[] = [
        { id: "home", icon: HomeIcon },
        { id: "search", icon: SearchIcon },
        { id: "grok", icon: GrokIcon },
        { id: "notifications", icon: NotificationsIcon, badge: unreadNotifications },
        { id: "messages", icon: MessagesIcon, badge: unreadMessages },
    ];

    return (
        <div style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            height: twitterLayout.bottomNavHeight + twitterLayout.safeAreaBottom,
            backgroundColor: "rgba(0, 0, 0, 0.95)",
            backdropFilter: "blur(12px)",
            borderTop: `1px solid ${twitterColors.ui.border}`,
            paddingBottom: twitterLayout.safeAreaBottom,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
            zIndex: 100,
        }}>
            {tabs.map(({ id, icon: Icon, badge }) => (
                <div
                    key={id}
                    style={{
                        position: "relative",
                        padding: 24,
                    }}
                >
                    <Icon active={activeTab === id} size={iconSize} />
                    {badge !== undefined && <Badge count={badge} />}
                </div>
            ))}
        </div>
    );
};

export default BottomNav;
