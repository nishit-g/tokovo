import React from "react";
import { UpdatesIcon, CallsTabIcon, CommunitiesIcon, ChatsIcon, SettingsIcon } from "./Icons";
import { getTheme } from "./theme";

export const TabNavigation: React.FC<{
    activeTab?: string;
    safeAreaBottom?: number;
}> = ({ activeTab = "chats", safeAreaBottom = 34 }) => {
    const theme = getTheme("ios");
    const primaryColor = theme.colors.primary; // Blue usually
    const inactiveColor = "#8E8E93";

    const tabs = [
        { id: "updates", label: "Updates", Icon: UpdatesIcon },
        { id: "calls", label: "Calls", Icon: CallsTabIcon },
        { id: "communities", label: "Communities", Icon: CommunitiesIcon },
        { id: "chats", label: "Chats", Icon: ChatsIcon },
        { id: "settings", label: "Settings", Icon: SettingsIcon },
    ];

    return (
        <div style={{
            backgroundColor: "rgba(250, 250, 250, 0.9)", // Translucent bar
            backdropFilter: "blur(20px)",
            borderTop: "0.5px solid rgba(0,0,0,0.3)",
            display: "flex",
            justifyContent: "space-between",
            paddingBottom: safeAreaBottom,
            paddingTop: 8,
            paddingLeft: 16,
            paddingRight: 16,
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000
        }}>
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const color = isActive ? primaryColor : inactiveColor;

                return (
                    <div key={tab.id} style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        cursor: "pointer",
                        flex: 1
                    }}>
                        <tab.Icon color={color} filled={isActive} />
                        <div style={{
                            fontSize: 10,
                            marginTop: 4,
                            fontWeight: "500",
                            color: color
                        }}>
                            {tab.label}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
