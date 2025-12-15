import React from "react";
import { MessageData } from "../../types";
import { getTheme } from "./theme";

// Sub-components can be extracted to separate files if they grow complex

const TextContent: React.FC<{ text: string }> = ({ text }) => (
    <div style={{
        fontSize: 16,
        lineHeight: "21px",
        color: "#000",
        fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
        wordWrap: "break-word",
        whiteSpace: "pre-wrap"
    }}>
        {text}
    </div>
);

const ImageContent: React.FC<{ url: string; caption?: string }> = ({ url, caption }) => (
    <div style={{ display: "flex", flexDirection: "column" }}>
        <img
            src={url}
            alt="Shared image"
            style={{
                borderRadius: 8,
                maxWidth: "100%",
                marginBottom: caption ? 4 : 0,
                display: "block"
            }}
        />
        {caption && <TextContent text={caption} />}
    </div>
);

const VideoContent: React.FC<{ url?: string; thumbnail?: string; caption?: string; duration?: number }> = ({ url, thumbnail, caption, duration }) => (
    <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ position: "relative", borderRadius: 8, overflow: "hidden" }}>
            <img
                src={thumbnail || "https://placehold.co/300x200?text=Video"}
                alt="Video thumbnail"
                style={{ width: "100%", display: "block" }}
            />
            {/* Play Button Overlay */}
            <div style={{
                position: "absolute", inset: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                backgroundColor: "rgba(0,0,0,0.3)"
            }}>
                <div style={{
                    width: 48, height: 48, borderRadius: 24,
                    backgroundColor: "rgba(0,0,0,0.6)",
                    display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </div>
            </div>
            {duration && (
                <span style={{
                    position: "absolute", bottom: 8, left: 8,
                    fontSize: 12, color: "white", padding: "2px 6px",
                    backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 4
                }}>
                    {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}
                </span>
            )}
        </div>
        {caption && <div style={{ marginTop: 4 }}><TextContent text={caption} /></div>}
    </div>
);

const SystemContent: React.FC<{ text: string }> = ({ text }) => {
    const theme = getTheme("ios");
    return (
        <div style={{
            alignSelf: "center",
            backgroundColor: "rgba(0,0,0,0.2)", // "Encyclopedia" style
            borderRadius: 8,
            padding: "4px 8px",
            fontSize: 12,
            color: "#333", // Or theme.colors.systemText
            marginBottom: 8,
            marginTop: 8,
            textAlign: "center",
            maxWidth: "80%",
            boxShadow: "0 1px 1px rgba(255,255,255,0.4)"
        }}>
            {text}
        </div>
    );
};


export const MessageContent: React.FC<{ message: MessageData }> = ({ message }) => {
    switch (message.type) {
        case "text":
            return <TextContent text={message.text} />;
        case "image":
            return <ImageContent url={message.imageUrl} caption={message.caption} />;
        case "video":
            return <VideoContent url={message.videoUrl} thumbnail={message.thumbnailUrl} duration={message.duration} caption={message.caption} />;

        // case "voice": return <VoiceContent ... /> // TODO

        case "system":
            return <SystemContent text={message.text} />;

        default:
            return <TextContent text="[Unsupported message type]" />;
    }
};
