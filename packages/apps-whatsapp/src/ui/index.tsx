import React from "react";
import { WorldState, AppSurface } from "@tokovo/core";

// Screens
import { ChatScreen } from "./screens/ios/ChatScreen";
import { ChatListScreen } from "./screens/ios/ChatListScreen";

import { WhatsAppState } from "../types";

export interface WhatsappChatViewProps {
    world: WorldState;
    t?: number;
    deviceId?: string;
    platform?: "ios" | "android";
    width?: number;
    height?: number;
    safeAreaInsets?: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
}

export const WhatsappChatView: React.FC<WhatsappChatViewProps> = ({
    world,
    t,
    deviceId,
    platform = "ios",
    width,
    height,
    safeAreaInsets
}) => {
    // 1. Resolve App State & Screen
    const appState = (world.appState?.["app_whatsapp"] || world.appState?.["whatsapp"]) as WhatsAppState;
    const currentScreen = appState?.screen || "chat"; // Default to chat for now

    // 2. Resolve Dimensions (Resolution Independence)
    // Receive logical dimensions from parent (TokovoRenderer's AppSurface)
    // If undefined, assume standard logical width (393)
    const activeWidth = width || 393;
    const activeHeight = height || 2556;

    // 3. Render Appropriate Screen
    // Strategy Pattern for Screen Navigation
    let activeScreenContent;

    switch (currentScreen) {
        case "list":
        case "chats":
            activeScreenContent = (
                <ChatListScreen
                    world={world}
                    width={activeWidth}
                    height={activeHeight}
                    safeAreaInsets={safeAreaInsets}
                />
            );
            break;
        case "chat":
        default:
            activeScreenContent = (
                <ChatScreen
                    world={world}
                    deviceId={deviceId}
                    width={activeWidth}
                    height={activeHeight}
                    safeAreaInsets={safeAreaInsets}
                />
            );
            break;
    }

    // 4. Return Content (Hoisted AppSurface handles scaling now)
    return (
        <div style={{ width: "100%", height: "100%", backgroundColor: "#000" }}>
            {activeScreenContent}
        </div>
    );
};

// Main Entry
export const ui = {
    WhatsappChatView
};
