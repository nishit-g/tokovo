import React from "react";
import { InstagramView } from "../types";

const HomeIcon = ({ active }: { active: boolean }) => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill={active ? "white" : "none"} stroke="white" strokeWidth={active ? "0" : "2"} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
);

const SearchIcon = ({ active }: { active: boolean }) => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={active ? "3" : "2"} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const ReelsIcon = ({ active }: { active: boolean }) => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill={active ? "white" : "none"} stroke="white" strokeWidth={active ? "0" : "2"} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
);

const ShopIcon = ({ active }: { active: boolean }) => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill={active ? "white" : "none"} stroke="white" strokeWidth={active ? "0" : "2"} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
);

const ProfileIcon = ({ active }: { active: boolean }) => (
    <div style={{
        width: 60,
        height: 60,
        borderRadius: "50%",
        border: active ? "2px solid white" : "none",
        padding: 2
    }}>
        <div style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            backgroundColor: "#555",
            // backgroundImage: `url(...)` // TODO: Add user avatar
        }} />
    </div>
);

export const BottomNav: React.FC<{ currentView: InstagramView }> = ({ currentView }) => {
    return (
        <div style={{
            height: 150,
            backgroundColor: "black",
            borderTop: "1px solid #222",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
            paddingBottom: 30 // Home indicator spacing
        }}>
            <HomeIcon active={currentView === 'feed'} />
            <SearchIcon active={currentView === 'explore'} />
            <ReelsIcon active={currentView === 'reels'} />
            <ShopIcon active={false} />
            <ProfileIcon active={currentView === 'profile'} />
        </div>
    );
};
