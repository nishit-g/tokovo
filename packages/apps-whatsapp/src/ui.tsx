import React from "react";
import { WorldState } from "@tokovo/core";

// Sub-components
const Header: React.FC<{ contactName: string }> = ({ contactName }) => (
    <div style={{
        height: 80,
        backgroundColor: "#f0f2f5",
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        borderBottom: "1px solid #e0e0e0",
        marginTop: 60 // Below status bar
    }}>
        <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#ccc", marginRight: 15 }} />
        <div style={{ fontSize: 24, fontWeight: "bold" }}>{contactName}</div>
    </div>
);

const MessageList: React.FC<{ messages: any[] }> = ({ messages }) => (
    <div style={{ flex: 1, padding: 20, display: "flex", flexDirection: "column", gap: 10, overflowY: "auto" }}>
        {messages.map((msg: any) => (
            <div key={msg.id} style={{
                alignSelf: msg.from === "me" ? "flex-end" : "flex-start",
                backgroundColor: msg.from === "me" ? "#dcf8c6" : "#fff",
                padding: 15,
                borderRadius: 10,
                maxWidth: "70%",
                fontSize: 20,
                boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
            }}>
                {msg.text}
            </div>
        ))}
    </div>
);

const InputArea: React.FC<{ text?: string }> = ({ text }) => (
    <div style={{
        height: 80,
        backgroundColor: "#f0f2f5",
        display: "flex",
        alignItems: "center",
        padding: "0 20px"
    }}>
        <div style={{
            flex: 1,
            height: 50,
            backgroundColor: "white",
            borderRadius: 25,
            padding: "0 20px",
            display: "flex",
            alignItems: "center",
            fontSize: 20,
            color: text ? "black" : "#999"
        }}>
            {text || "Type a message"}
        </div>
    </div>
);

const Keyboard: React.FC<{ visible: boolean }> = ({ visible }) => {
    if (!visible) return <div style={{ height: 40 }} />; // Bottom spacer
    return (
        <div style={{
            height: 400,
            backgroundColor: "#d1d5db",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: 30,
            color: "#555"
        }}>
            Keyboard
        </div>
    );
};

const Root: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div style={{ backgroundColor: "#ece5dd", height: "100%", display: "flex", flexDirection: "column" }}>
        {children}
    </div>
);

export const WhatsApp = {
    Root,
    Header,
    MessageList,
    InputArea
};

export const WhatsappChatView: React.FC<{ world: WorldState }> = ({ world }) => {
    const conversationId = Object.keys(world.conversations)[0];
    const conversation = world.conversations[conversationId];
    const messages = conversation ? conversation.messages : [];

    // Determine if typing (mock logic for now, ideally from state)
    const isTyping = false; // logic to check if 'me' is typing
    const draftText = ""; // logic to get draft text

    return (
        <WhatsApp.Root>
            <WhatsApp.Header contactName="Alice" />
            <WhatsApp.MessageList messages={messages} />
            <WhatsApp.InputArea text={draftText} />
            <Keyboard visible={isTyping} />
        </WhatsApp.Root>
    );
};
