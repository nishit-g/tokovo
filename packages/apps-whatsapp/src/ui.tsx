import React, { useMemo } from "react";
import { WorldState, Platform, AppSurface } from "@tokovo/core";
// We need to access device profiles. Assuming a direct import or core export.
// If devices are in core, import from core. If in separate package, we need to check imports.
// Based on previous file reads, iPhone16Profile was in packages/devices.
import { iPhone16Profile } from "@tokovo/devices";
// In a real app we would use a registry, but for now explicitly using iPhone16 as default/example
// until generic registry is cleaner.

import { Header } from "./components/ios/Header";
import { MessageList } from "./components/ios/MessageList";
import { InputArea } from "./components/ios/InputArea";
import { WhatsAppState, MessageData } from "./types";

export const WhatsappChatView: React.FC<{
    world: WorldState;
    t: number;
    deviceId?: string
}> = ({ world, t, deviceId }) => {
    // 1. Resolve Device Profile
    // In future, getDeviceProfile(deviceId)
    const deviceProfile = iPhone16Profile;

    // 2. Resolve App State
    const appState = (world.appState?.["app_whatsapp"] || world.appState?.["whatsapp"]) as WhatsAppState;
    const conversationId = appState?.conversationId || Object.keys(world.conversations || {})[0];
    const conversation = world.conversations?.[conversationId];

    // 3. Prepare Data
    const contactName = conversation?.name || "Unknown";
    const messages = (conversation?.messages || []) as unknown as MessageData[];

    // 4. Calculate Safe Areas (Physical -> Logical)
    // Design Width: 393 (Standard 1x)
    // Target Width: deviceProfile.dimensions.width
    const designWidth = 393;
    const targetWidth = deviceProfile.dimensions.width;
    const scale = targetWidth / designWidth;

    // Safe Areas
    const safeAreaTop = (deviceProfile.camera?.safeAreaTop || 110) / scale;
    const safeAreaBottom = (deviceProfile.camera?.safeAreaBottom || 102) / scale;

    return (
        <AppSurface
            designWidth={designWidth}
            targetWidth={targetWidth}
            targetHeight={deviceProfile.dimensions.height}
            backgroundColor="#000"
        >
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
                    messages={messages.map(m => ({
                        id: m.id,
                        text: m.text,
                        from: m.from,
                        timestamp: m.timestamp,
                        read: m.status === 'read'
                    }))}
                    ownerName={world.devices?.[deviceId || "main_phone"]?.ownerName || "me"}
                />

                <InputArea
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
