import React from "react";
import { WorldState } from "@tokovo/core";
import { AppSurface } from "@tokovo/core";
import { Header } from "../../components/ios/Header";
import { MessageList } from "../../components/ios/MessageList";
import { InputArea } from "../../components/ios/InputArea";
import { TypingIndicator } from "../../components/ios/TypingIndicator";
import { WhatsAppState, MessageData } from "../../types";

export interface ChatScreenProps {
    world: WorldState;
    deviceId?: string;
    safeAreaInsets?: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
    width: number;
    height: number;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
    world,
    deviceId,
    safeAreaInsets,
    width,
    height
}) => {
    // 1. Resolve App State
    const appState = (world.appState?.["app_whatsapp"] || world.appState?.["whatsapp"]) as WhatsAppState;
    const conversationId = appState?.conversationId || Object.keys(world.conversations || {})[0];
    const conversation = world.conversations?.[conversationId];

    // 2. Prepare Data
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

    // 3. Calculate Safe Areas & Scaling (Resolution Independence)
    // Design Width: 393 (Standard 1x)
    const designWidth = 393;
    const targetWidth = width || 1179; // Default fallback (iPhone 16)

    // Calculate Scale
    const scale = targetWidth / designWidth;

    // Safe Areas (Physical -> Logical)
    // If safeAreaInsets not provided, assume generous safe areas
    const physicalSafeTop = safeAreaInsets?.top ?? 177; // ~59px * 3
    const physicalSafeBottom = safeAreaInsets?.bottom ?? 102; // ~34px * 3

    const safeAreaTop = physicalSafeTop / scale;
    const safeAreaBottom = physicalSafeBottom / scale;

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            backgroundColor: "#ECE5DD", // Chat BG
            position: "relative"
        }}>
            <Header
                contactName={contactName}
                avatarUrl={conversation?.avatar}
                status="online"
                safeAreaTop={safeAreaTop}
            />

            <MessageList
                messages={messages}
                ownerName={world.devices?.[deviceId || "main_phone"]?.ownerName || "me"}
                isTyping={conversation?.typing && Object.keys(conversation.typing).some(id => id !== "me")}
            />

            <InputArea
                text=""
                showCursor={false}
                safeAreaBottom={safeAreaBottom}
            />
        </div>
    );
};
