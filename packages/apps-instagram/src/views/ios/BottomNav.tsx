/**
 * Instagram Bottom Navigation (iOS)
 */

import React from "react";
import { instagramTheme } from "../../config/theme";
import type { InstagramScreen } from "../../types";

interface BottomNavProps {
    activeTab: InstagramScreen;
}

// Icons
const HomeIcon = ({ active }: { active?: boolean }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        {!active && <polyline points="9 22 9 12 15 12 15 22" />}
    </svg>
);

const SearchIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const ReelsIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="2" width="20" height="20" rx="2" />
        <line x1="8" y1="2" x2="8" y2="22" />
        <line x1="16" y1="2" x2="16" y2="22" />
        <line x1="2" y1="8" x2="22" y2="8" />
        <polygon points="10 11 10 17 14 14 10 11" fill="currentColor" />
    </svg>
);

const ShopIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
);

const ProfileIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab }) => {
    const theme = instagramTheme;

    const tabs = [
        { id: "home", icon: HomeIcon },
        { id: "search", icon: SearchIcon },
        { id: "reels", icon: ReelsIcon },
        { id: "shop", icon: ShopIcon },
        { id: "profile", icon: ProfileIcon },
    ] as const;

    return (
        <div style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: theme.spacing.bottomNavHeight,
            backgroundColor: theme.colors.background,
            borderTop: `1px solid ${theme.colors.divider}`,
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            paddingBottom: 20, // Safe area
        }}>
            {tabs.map(({ id, icon: Icon }) => (
                <div
                    key={id}
                    style={{
                        color: activeTab === id ? theme.colors.textPrimary : theme.colors.iconSecondary,
                        cursor: "pointer",
                    }}
                >
                    <Icon active={activeTab === id} />
                </div>
            ))}
        </div>
    );
};
