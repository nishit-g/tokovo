import React from "react";
import { WorldState } from "@tokovo/core";

// --- Icons ---
const BackIcon = () => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
    </svg>
);

const VideoIcon = () => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 7l-7 5 7 5V7z" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
);

const InfoIcon = () => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
);

const CameraIcon = () => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
    </svg>
);

const MicIcon = () => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
);

const ImageIcon = () => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
    </svg>
);

const StickerIcon = () => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

// --- Components ---

const Header: React.FC<{ contactName: string }> = ({ contactName }) => (
    <div style={{
        height: 200,
        display: "flex",
        alignItems: "center",
        padding: "0 45px",
        marginTop: 150,
        zIndex: 10,
        color: "white"
    }}>
        <BackIcon />
        <div style={{ flex: 1, display: "flex", alignItems: "center", marginLeft: 30 }}>
            <div style={{ width: 90, height: 90, borderRadius: "50%", backgroundColor: "#333", marginRight: 20 }} />
            <div style={{ fontSize: 42, fontWeight: "600" }}>{contactName}</div>
        </div>
        <div style={{ display: "flex", gap: 60 }}>
            <VideoIcon />
            <InfoIcon />
        </div>
    </div>
);

const MessageBubble: React.FC<{ msg: any; layout?: any }> = ({ msg, layout }) => {
    const isMe = msg.from === "me";
    const animation = layout?.messageAnimations?.[msg.id] || { opacity: 1, translateY: 0 };
    const { opacity, translateY } = animation;

    return (
        <div style={{
            alignSelf: isMe ? "flex-end" : "flex-start",
            backgroundColor: isMe ? "#3797F0" : "#262626", // Instagram Blue or Dark Grey
            color: "white",
            padding: "30px 42px",
            borderRadius: 60,
            maxWidth: "70%",
            fontSize: 48,
            lineHeight: "60px",
            marginBottom: 12,
            opacity,
            transform: `translateY(${translateY}px)`
        }}>
            {msg.text}
        </div>
    );
};

const MessageList: React.FC<{ messages: any[]; layout?: any }> = ({ messages, layout }) => {
    const scrollY = layout?.scrollY || 0;

    return (
        <div style={{
            flex: 1,
            position: "relative",
            overflow: "hidden"
        }}>
            <div style={{
                padding: "30px 45px",
                display: "flex",
                flexDirection: "column",
                gap: 15,
                transform: `translateY(-${scrollY}px)`,
                transition: "transform 0.3s ease-out",
                minHeight: "100%",
                justifyContent: "flex-end" // Instagram starts from bottom
            }}>
                {messages.map((msg: any) => (
                    <MessageBubble key={msg.id} msg={msg} layout={layout} />
                ))}
            </div>
        </div>
    );
};

const InputArea: React.FC = () => (
    <div style={{
        height: 180,
        display: "flex",
        alignItems: "center",
        padding: "0 45px",
        gap: 30,
        marginBottom: 60
    }}>
        <div style={{
            flex: 1,
            height: 130,
            backgroundColor: "#262626",
            borderRadius: 65,
            display: "flex",
            alignItems: "center",
            padding: "0 40px",
            gap: 30
        }}>
            <CameraIcon />
            <div style={{ flex: 1, fontSize: 48, color: "#888" }}>Message...</div>
            <MicIcon />
            <ImageIcon />
            <StickerIcon />
        </div>
    </div>
);

export const InstagramChatView: React.FC<{ world: WorldState; t: number; layout?: any }> = ({ world, t, layout }) => {
    const conversationId = Object.keys(world.conversations)[0];
    const conversation = world.conversations[conversationId];
    const messages = conversation ? conversation.messages : [];

    return (
        <div style={{
            backgroundColor: "black",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            color: "white"
        }}>
            <Header contactName="instagram_user" />
            <MessageList messages={messages} layout={layout} />
            <InputArea />
        </div>
    );
};
