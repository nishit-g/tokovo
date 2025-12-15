import React, { useMemo } from "react";
import { WorldState, Platform, AppSurface } from "@tokovo/core";
import { Header as IOSHeader } from "./components/ios/Header";
import { MessageList as IOSMessageList } from "./components/ios/MessageList";
import { InputArea as IOSInputArea } from "./components/ios/InputArea";
import { WhatsAppState, MessageData } from "./types";

// =============================================================================
// PLATFORM SEGREGATION LAYER
// =============================================================================
// Future-proof: This allows easy addition of Android components later.
const PlatformComponents = {
    ios: {
        Header: IOSHeader,
        MessageList: IOSMessageList,
        InputArea: IOSInputArea,
    },
    // android: { ... }
};

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
    // 1. Resolve Platform
    // Architecture: Device Segregation (Renderer passes platform)
    // Fallback components (safety)
    const Components = PlatformComponents[platform] || PlatformComponents.ios;

    // 2. Resolve App State
    const appState = (world.appState?.["app_whatsapp"] || world.appState?.["whatsapp"]) as WhatsAppState;
    const conversationId = appState?.conversationId || Object.keys(world.conversations || {})[0];
    const conversation = world.conversations?.[conversationId];

    // 3. Prepare Data
    const contactName = conversation?.name || "Unknown";
    const rawMessages = (conversation?.messages || []) as any[];

    // Map runtime messages to strict MessageData
    // Runtime might have loose types, we ensure UI gets strict shape
    // This mapping layer protects the UI from runtime messiness
    const messages: MessageData[] = rawMessages.map(m => {
        const base = {
            id: m.id,
            from: m.from,
            timestamp: m.timestamp,
            status: m.status,
            at: m.at
        };

        switch (m.type) {
            case "image":
                return { ...base, type: "image", imageUrl: m.imageUrl, caption: m.caption };
            case "video":
                return { ...base, type: "video", videoUrl: m.videoUrl, thumbnailUrl: m.thumbnailUrl, duration: m.duration, caption: m.caption };
            case "voice":
                return { ...base, type: "voice", duration: m.duration || 0 };
            case "system":
                return { ...base, type: "system", text: m.text, systemType: m.systemType };
            case "text":
            default:
                return { ...base, type: "text", text: m.text || "" };
        }
    });

    // 4. Calculate Safe Areas & Scaling (Resolution Independence)
    // Design Width: 393 (Logical 1x)
    // Target Dimensions: Provided by Renderer (or fallback standard)
    const designWidth = 393;
    const targetWidth = width || 1179; // Default fallback (iPhone 16)
    const targetHeight = height || 2556;

    // Calculate Scale
    const scale = targetWidth / designWidth;

    // Safe Areas (Physical -> Logical)
    // If safeAreaInsets not provided, assume generous safe areas
    const physicalSafeTop = safeAreaInsets?.top ?? 177; // ~59px * 3
    const physicalSafeBottom = safeAreaInsets?.bottom ?? 102; // ~34px * 3

    const safeAreaTop = physicalSafeTop / scale;
    const safeAreaBottom = physicalSafeBottom / scale;

    // 5. Time Simulation
    // Apps don't need to know the time for the status bar anymore.
    // The Device Wrapper handles that.

    return (
        <AppSurface
            designWidth={designWidth}
            targetWidth={targetWidth}
            targetHeight={targetHeight}
            backgroundColor="#000"
        >
            <div style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                backgroundColor: "#ECE5DD", // Chat BG
                position: "relative"
            }}>
                {/* STATUS BAR handled by Device Wrapper */}

                <Components.Header
                    contactName={contactName}
                    avatarUrl={conversation?.avatar}
                    status="online"
                    safeAreaTop={safeAreaTop}
                />

                <Components.MessageList
                    messages={messages}
                    ownerName={world.devices?.[deviceId || "main_phone"]?.ownerName || "me"}
                />

                <Components.InputArea
                    text=""
                    showCursor={false}
                    safeAreaBottom={safeAreaBottom}
                />
            </div>
        </AppSurface>
    );
};

// Main Entry
export const ui = {
    WhatsappChatView
};
