import React from "react";
import { WorldState, Platform, ChatLayoutState } from "@tokovo/core";
import { Header, GroupHeader } from "./components/Header";
import { MessageList } from "./components/MessageList";
import { InputArea } from "./components/InputArea";

// RE-EXPORT components for compatibility if needed
export const WhatsApp = {
    Header,
    MessageList,
    InputArea,
};

export const WhatsappChatView: React.FC<{ world: WorldState; t: number; layout?: ChatLayoutState; deviceId?: string; platform?: Platform }> = ({ world, t, layout, deviceId, platform = "ios" }) => {
    // Default to first conversation if specific not provided via prop.
    // In a real app, `currentChatId` should be passed or derived.
    // For single-chat simulations, this works.
    const conversationId = Object.keys(world.conversations)[0];

    const conversation = world.conversations[conversationId];
    const messages = conversation ? conversation.messages : [];
    const isTyping = conversation?.typing?.["other"] || false;
    const draftText = ""; // Could come from state

    // Get device owner for POV alignment
    const activeDeviceId = deviceId || world.camera?.activeDeviceId || Object.keys(world.devices)[0];
    const device = world.devices[activeDeviceId];
    const ownerName = device?.ownerName || "me";

    // Check if it's a group
    const isGroup = conversation?.type === "group";
    const groupName = conversation?.name || "Group";
    const memberCount = conversation?.members?.length || 0;

    return (
        <div style={{
            backgroundColor: "#F6F6F6",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', sans-serif"
        }}>
            {/* Header */}
            {isGroup ? (
                 <GroupHeader groupName={groupName} memberCount={memberCount} platform={platform} />
            ) : (
                <Header contactName={conversation?.name || "Alice"} status="online" platform={platform} />
            )}

            {/* Message List */}
            <MessageList
                messages={messages}
                layout={layout as ChatLayoutState}
                isTyping={isTyping}
                conversationType={conversation?.type}
                ownerName={ownerName}
                platform={platform}
            />

            {/* Input Area */}
            <InputArea text={draftText} platform={platform} />

            {/* Home Indicator Spacer */}
            <div style={{
                height: 34, // Standard iOS home indicator height area
                backgroundColor: "#F6F6F6",
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-end",
                paddingBottom: 8
            }}>
                <div style={{
                    width: 134,
                    height: 5,
                    backgroundColor: "#000",
                    borderRadius: 2.5,
                    opacity: 0.3
                }} />
            </div>
        </div>
    );
};
