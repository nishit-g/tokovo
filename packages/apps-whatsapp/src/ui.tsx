import React from "react";
import { WorldState, AppSurface } from "@tokovo/core";

// Screens
import { ChatScreen } from "./screens/ios/ChatScreen";
import { ChatListScreen } from "./screens/ios/ChatListScreen";

import { WhatsAppState } from "./types";

export interface WhatsappChatViewProps {
    world: WorldState;
    t: number;
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
    // Design Width: 393 (Standard 1x)
    const designWidth = 393;
    const targetWidth = width || 1179; // Default fallback (iPhone 16)
    const targetHeight = height || 2556;

    // 3. Render Appropriate Screen
    // Strategy Pattern for Screen Navigation
    let activeScreenContent;

    switch (currentScreen) {
        case "list":
        case "chats":
            activeScreenContent = (
                <ChatListScreen
                    world={world}
                    width={targetWidth}
                    height={targetHeight}
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
                    width={targetWidth}
                    height={targetHeight}
                    safeAreaInsets={safeAreaInsets}
                />
            );
            break;
    }

    // 4. Wrap in AppSurface (Sandbox)
    return (
        <AppSurface
            designWidth={designWidth}
            targetWidth={targetWidth}
            targetHeight={targetHeight}
            backgroundColor="#000"
        >
            {activeScreenContent}
        </AppSurface>
    );
};

// Main Entry
export const ui = {
    WhatsappChatView
};
