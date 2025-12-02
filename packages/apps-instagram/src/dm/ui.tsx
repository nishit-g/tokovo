import React, { useEffect, useRef } from "react";
import { WorldState } from "@tokovo/core";

// --- Icons (Scaled 3x: 24 -> 72) ---
const BackIcon = () => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 18l-6-6 6-6" />
    </svg>
);

const VideoCallIcon = () => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 7l-7 5 7 5V7z" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
);

const AudioCallIcon = () => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
);

const CameraIcon = () => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{backgroundColor: "#0095f6", borderRadius: "50%", padding: 12}}>
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
    </svg>
);

const MicIcon = () => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
);

const ImageIcon = () => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <polyline points="21 15 16 10 5 21"/>
    </svg>
);

const StickerIcon = () => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z" />
        <path d="M15 3v6h6" />
    </svg>
);


// --- Components ---

const Header: React.FC<{ contactName: string }> = ({ contactName }) => (
    <div style={{
        height: 270, // 90 * 3
        backgroundColor: "white",
        display: "flex",
        alignItems: "center",
        padding: "0 45px", // 15 * 3
        borderBottom: "3px solid #dbdbdb",
        marginTop: 150, // Below status bar (approx)
        zIndex: 10
    }}>
        <div style={{ display: "flex", alignItems: "center", gap: 15, color: "black", fontSize: 51 }}>
            <BackIcon />
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 30, marginLeft: 30 }}>
             <div style={{ width: 96, height: 96, borderRadius: "50%", backgroundColor: "#dbdbdb" }} />
             <div style={{ display: "flex", flexDirection: "column" }}>
                 <div style={{ fontSize: 48, fontWeight: "600", color: "black" }}>{contactName}</div>
                 <div style={{ fontSize: 36, color: "#8e8e8e" }}>Active now</div>
             </div>
        </div>

        <div style={{ display: "flex", gap: 60 }}>
            <AudioCallIcon />
            <VideoCallIcon />
        </div>
    </div>
);

const MessageBubble: React.FC<{ msg: any; layout?: any }> = ({ msg, layout }) => {
    const isMe = msg.from === "me";

    // Animation logic from layout engine
    const animation = layout?.messageAnimations?.[msg.id] || { opacity: 1, translateY: 0 };
    const { opacity, translateY } = animation;

    return (
        <div style={{
            alignSelf: isMe ? "flex-end" : "flex-start",
            display: "flex",
            flexDirection: "row",
            alignItems: "flex-end",
            gap: 15,
            opacity,
            transform: `translateY(${translateY}px)`
        }}>
            {!isMe && <div style={{ width: 84, height: 84, borderRadius: "50%", backgroundColor: "#dbdbdb", marginBottom: 12 }} />}
            <div style={{
                backgroundColor: isMe ? "#3797f0" : "#efefef",
                color: isMe ? "white" : "black",
                padding: "24px 36px", // 8*3, 12*3
                borderRadius: 54, // 18*3
                maxWidth: "75%",
                fontSize: 51, // 17*3
                lineHeight: "66px", // 22*3
                position: "relative",
                marginBottom: 6,
            }}>
                <div>{msg.text}</div>
            </div>
        </div>
    );
};

const MessageList: React.FC<{ messages: any[]; layout?: any }> = ({ messages, layout }) => {
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (layout?.scrollToBottom) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages.length, layout?.scrollToBottom]);

    return (
        <div style={{
            flex: 1,
            padding: "30px 48px", // 10*3, 16*3
            display: "flex",
            flexDirection: "column",
            gap: 12,
            overflowY: "auto",
            backgroundColor: "white"
        }}>
            {messages.map((msg: any) => (
                <MessageBubble key={msg.id} msg={msg} layout={layout} />
            ))}
            <div ref={bottomRef} />
        </div>
    );
};

const InputArea: React.FC<{ text?: string }> = ({ text }) => (
    <div style={{
        minHeight: 180, // 60*3
        backgroundColor: "white",
        display: "flex",
        alignItems: "center",
        padding: "0 30px",
        gap: 30
    }}>
        <div style={{
            flex: 1,
            minHeight: 132, // 44*3
            backgroundColor: "#efefef",
            borderRadius: 66, // 22*3
            padding: "0 48px",
            display: "flex",
            alignItems: "center",
            gap: 30,
            fontSize: 51,
            color: "black",
        }}>
            <div style={{ width: 72, height: 72, borderRadius: "50%", backgroundColor: "#0095f6", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                     <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                     <circle cx="12" cy="13" r="4" />
                </svg>
            </div>
            <div style={{ flex: 1, color: text ? "black" : "#8e8e8e" }}>
                {text || "Message..."}
            </div>
            {!text && (
                 <>
                    <MicIcon />
                    <ImageIcon />
                    <StickerIcon />
                 </>
            )}
            {text && (
                <div style={{ color: "#0095f6", fontWeight: "600", fontSize: 51 }}>Send</div>
            )}
        </div>
    </div>
);

const Keyboard: React.FC<{ visible: boolean }> = ({ visible }) => {
    if (!visible) return <div style={{ height: 102, backgroundColor: "white" }} />; // Home indicator spacer (34*3)
    return (
        <div style={{
            height: 870, // 290*3
            backgroundColor: "#D1D5DB",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: 72,
            color: "#555",
            borderTop: "3px solid #ccc"
        }}>
            Keyboard
        </div>
    );
};

const Root: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div style={{ backgroundColor: "white", height: "100%", display: "flex", flexDirection: "column" }}>
        {children}
    </div>
);

export const InstagramDM = {
    Root,
    Header,
    MessageList,
    InputArea
};

export const InstagramChatView: React.FC<{ world: WorldState; t: number; layout?: any }> = ({ world, t, layout }) => {
    const conversationId = Object.keys(world.conversations)[0];
    const conversation = world.conversations[conversationId];
    const messages = conversation ? conversation.messages : [];

    // Check typing state
    const isTyping = conversation?.typing?.["other"] || false;
    const draftText = ""; // logic to get draft text

    return (
        <InstagramDM.Root>
            <InstagramDM.Header contactName="Alice" />
            <InstagramDM.MessageList messages={messages} layout={layout} />
            {isTyping && (
                <div style={{
                    padding: "24px 36px",
                    marginLeft: 132, // 48 + 84 (avatar)
                    marginBottom: 12,
                    backgroundColor: "#efefef",
                    borderRadius: 54,
                    alignSelf: "flex-start",
                    width: "fit-content",
                }}>
                    <div style={{ fontSize: 42, color: "#8e8e8e" }}>typing...</div>
                </div>
            )}
            <InstagramDM.InputArea text={draftText} />
            <Keyboard visible={false} />
        </InstagramDM.Root>
    );
};
