import React, { useEffect, useRef } from "react";
import { WorldState } from "@tokovo/core";

// --- Icons (Simple SVG placeholders) ---
const BackIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
    </svg>
);

const VideoCallIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 7l-7 5 7 5V7z" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
);

const PhoneIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
);

const PlusIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const CameraIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
    </svg>
);

const MicIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
);

const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34B7F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

// --- Components ---

const Header: React.FC<{ contactName: string }> = ({ contactName }) => (
    <div style={{
        height: 90, // Slightly taller
        backgroundColor: "rgba(245, 245, 245, 0.95)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        padding: "0 15px",
        borderBottom: "1px solid #d1d1d6",
        marginTop: 50, // Below status bar
        zIndex: 10
    }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#007AFF", fontSize: 17 }}>
            <BackIcon />
            <span style={{ marginRight: 5 }}>98</span>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#8E8E93", marginBottom: 2 }} />
            <div style={{ fontSize: 14, fontWeight: "600", color: "black" }}>{contactName}</div>
        </div>

        <div style={{ display: "flex", gap: 20 }}>
            <VideoCallIcon />
            <PhoneIcon />
        </div>
    </div>
);

const MessageBubble: React.FC<{ msg: any; t: number }> = ({ msg, t }) => {
    const isMe = msg.from === "me";

    // Animation logic
    const age = t - msg.at;
    const opacity = Math.min(Math.max(age / 10, 0), 1); // Fade in over 10 frames
    const translateY = Math.max(20 - age * 2, 0); // Slide up

    return (
        <div style={{
            alignSelf: isMe ? "flex-end" : "flex-start",
            backgroundColor: isMe ? "#DCF8C6" : "#FFFFFF",
            padding: "8px 12px",
            borderRadius: 16,
            borderTopLeftRadius: !isMe ? 4 : 16,
            borderTopRightRadius: isMe ? 4 : 16,
            maxWidth: "75%",
            fontSize: 17,
            lineHeight: "22px",
            boxShadow: "0 1px 1px rgba(0,0,0,0.1)",
            position: "relative",
            marginBottom: 4,
            opacity,
            transform: `translateY(${translateY}px)`
        }}>
            <div>{msg.text}</div>
            <div style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: 4,
                marginTop: 2,
                fontSize: 11,
                color: "rgba(0,0,0,0.45)"
            }}>
                <span>10:42</span> {/* Mock time for now */}
                {isMe && <CheckIcon />}
            </div>
        </div>
    );
};

const MessageList: React.FC<{ messages: any[]; t: number }> = ({ messages, t }) => {
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom (Step 3 part 1)
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages.length]);

    return (
        <div style={{
            flex: 1,
            padding: "10px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 6,
            overflowY: "auto",
            backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')", // WhatsApp Doodle background
            backgroundSize: "cover"
        }}>
            {messages.map((msg: any) => (
                <MessageBubble key={msg.id} msg={msg} t={t} />
            ))}
            <div ref={bottomRef} />
        </div>
    );
};

const InputArea: React.FC<{ text?: string }> = ({ text }) => (
    <div style={{
        minHeight: 60,
        backgroundColor: "#F6F6F6",
        display: "flex",
        alignItems: "center",
        padding: "0 10px",
        borderTop: "1px solid #d1d1d6",
        gap: 10
    }}>
        <PlusIcon />
        <div style={{
            flex: 1,
            minHeight: 36,
            backgroundColor: "white",
            borderRadius: 18,
            padding: "8px 16px",
            display: "flex",
            alignItems: "center",
            fontSize: 17,
            color: text ? "black" : "#C7C7CC",
            border: "1px solid #E5E5EA"
        }}>
            {text || "iMessage"}
        </div>
        {text ? (
            <div style={{ color: "#007AFF", fontWeight: "bold" }}>Send</div>
        ) : (
            <>
                <CameraIcon />
                <MicIcon />
            </>
        )}
    </div>
);

const Keyboard: React.FC<{ visible: boolean }> = ({ visible }) => {
    if (!visible) return <div style={{ height: 34 }} />; // Home indicator spacer
    return (
        <div style={{
            height: 290,
            backgroundColor: "#D1D5DB",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: 24,
            color: "#555",
            borderTop: "1px solid #ccc"
        }}>
            Keyboard
        </div>
    );
};

const Root: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div style={{ backgroundColor: "#E5E5EA", height: "100%", display: "flex", flexDirection: "column" }}>
        {children}
    </div>
);

export const WhatsApp = {
    Root,
    Header,
    MessageList,
    InputArea
};

export const WhatsappChatView: React.FC<{ world: WorldState; t: number }> = ({ world, t }) => {
    const conversationId = Object.keys(world.conversations)[0];
    const conversation = world.conversations[conversationId];
    const messages = conversation ? conversation.messages : [];

    // Determine if typing (mock logic for now, ideally from state)
    const isTyping = false; // logic to check if 'me' is typing
    const draftText = ""; // logic to get draft text

    return (
        <WhatsApp.Root>
            <WhatsApp.Header contactName="Alice" />
            <WhatsApp.MessageList messages={messages} t={t} />
            <WhatsApp.InputArea text={draftText} />
            <Keyboard visible={isTyping} />
        </WhatsApp.Root>
    );
};
