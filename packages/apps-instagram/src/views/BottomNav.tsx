import React from "react";
import { InstagramView } from "../types";

// ============================================================================
// AUTHENTIC INSTAGRAM iOS BOTTOM NAV ICONS
// ============================================================================

// Home icon - Filled house shape (Instagram-specific)
const HomeIcon = ({ active }: { active: boolean }) => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
        {active ? (
            // Filled version
            <path
                d="M12 2L3 9V22H9V15H15V22H21V9L12 2Z"
                fill="white"
            />
        ) : (
            // Outline version
            <path
                d="M12 3L4 10V21H10V15H14V21H20V10L12 3Z"
                stroke="white"
                strokeWidth="1.8"
                strokeLinejoin="round"
                fill="none"
            />
        )}
    </svg>
);

// Search/Explore icon - Magnifying glass
const SearchIcon = ({ active }: { active: boolean }) => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
        <circle
            cx="10.5"
            cy="10.5"
            r="7"
            stroke="white"
            strokeWidth={active ? "2.5" : "1.8"}
        />
        <line
            x1="15.5"
            y1="15.5"
            x2="21"
            y2="21"
            stroke="white"
            strokeWidth={active ? "2.5" : "1.8"}
            strokeLinecap="round"
        />
    </svg>
);

// Reels icon - Clapperboard style
const ReelsIcon = ({ active }: { active: boolean }) => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
        {active ? (
            <>
                <rect x="3" y="3" width="18" height="18" rx="3" fill="white" />
                <polygon points="10,8 17,12 10,16" fill="black" />
            </>
        ) : (
            <>
                <rect x="3" y="3" width="18" height="18" rx="3" stroke="white" strokeWidth="1.8" fill="none" />
                <polygon points="10,8 17,12 10,16" stroke="white" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
            </>
        )}
    </svg>
);

// Create/Add icon - Plus in square
const CreateIcon = ({ active }: { active: boolean }) => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
        <rect
            x="3"
            y="3"
            width="18"
            height="18"
            rx="3"
            stroke="white"
            strokeWidth={active ? "2.2" : "1.8"}
            fill="none"
        />
        <line
            x1="12"
            y1="8"
            x2="12"
            y2="16"
            stroke="white"
            strokeWidth={active ? "2.2" : "1.8"}
            strokeLinecap="round"
        />
        <line
            x1="8"
            y1="12"
            x2="16"
            y2="12"
            stroke="white"
            strokeWidth={active ? "2.2" : "1.8"}
            strokeLinecap="round"
        />
    </svg>
);

// Profile icon - Avatar with optional ring
const ProfileIcon = ({ active, avatarUrl }: { active: boolean; avatarUrl?: string }) => (
    <div style={{
        width: 72,
        height: 72,
        borderRadius: "50%",
        border: active ? "6px solid white" : "none",
        padding: active ? 0 : 6,
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    }}>
        <div style={{
            width: active ? 60 : 60,
            height: active ? 60 : 60,
            borderRadius: "50%",
            backgroundColor: "#444",
            backgroundImage: avatarUrl ? `url(${avatarUrl})` : "linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #FCAF45 100%)",
            backgroundSize: "cover",
            backgroundPosition: "center"
        }} />
    </div>
);

// ============================================================================
// BOTTOM NAVIGATION COMPONENT
// ============================================================================

export const BottomNav: React.FC<{ currentView: InstagramView }> = ({ currentView }) => {
    return (
        <div style={{
            height: 156, // 52pt * 3
            backgroundColor: "#000",
            borderTop: "1px solid #262626",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
            paddingBottom: 30, // Home indicator spacing
            paddingTop: 12
        }}>
            <HomeIcon active={currentView === 'feed'} />
            <SearchIcon active={currentView === 'explore'} />
            <ReelsIcon active={currentView === 'reels'} />
            <CreateIcon active={false} />
            <ProfileIcon active={currentView === 'profile'} />
        </div>
    );
};
