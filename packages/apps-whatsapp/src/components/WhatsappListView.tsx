import React from "react";
import { Platform, getAppConfig, getTokens, WorldState } from "@tokovo/core";

// Icons
const NewChatIcon = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
        <path d="M12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20Z" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 11.37V12.63C16 14.7 14.67 16.27 12.63 16.27H11.37C9.33 16.27 8 14.7 8 12.63V11.37C8 9.33 9.33 7.73 11.37 7.73H12.63C14.67 7.73 16 9.33 16 11.37Z" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M14.5 10.5H16.5" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

interface WhatsappListViewProps {
    world: WorldState;
    platform?: Platform;
}

export const WhatsappListView: React.FC<WhatsappListViewProps> = ({ world, platform = "ios" }) => {
    const config = getAppConfig("whatsapp", platform) as any;
    const tokens = getTokens(platform);

    // Sort conversations by last message time (simulated)
    // In real app, we'd check timestamps. Here we just take keys.
    const conversationIds = Object.keys(world.conversations);

    return (
        <div style={{
            height: "100%",
            backgroundColor: "#FFFFFF",
            fontFamily: tokens.fontFamily,
            display: "flex",
            flexDirection: "column"
        }}>
            {/* Main Header */}
            <div style={{
                height: 280, // expanded header
                backgroundColor: "#F6F6F6",
                paddingTop: config.statusBarHeight,
                borderBottom: "1px solid rgba(0,0,0,0.1)",
                display: "flex",
                flexDirection: "column",
                paddingLeft: 48,
                paddingRight: 48
            }}>
                {/* Top Row: Edit / New Chat */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    height: 120
                }}>
                    <span style={{ fontSize: 48, color: "#007AFF" }}>Edit</span>
                    <NewChatIcon />
                </div>

                {/* Title */}
                <div style={{
                    fontSize: 90,
                    fontWeight: "700",
                    color: "#000",
                    marginTop: 12
                }}>
                    Chats
                </div>
            </div>

            {/* List */}
            <div style={{ flex: 1, overflowY: "auto" }}>
                {conversationIds.length === 0 ? (
                     <div style={{
                         display: "flex",
                         flexDirection: "column",
                         alignItems: "center",
                         justifyContent: "center",
                         height: "100%",
                         opacity: 0.5,
                         gap: 20
                     }}>
                         <span style={{ fontSize: 48 }}>No chats yet</span>
                     </div>
                ) : (
                    conversationIds.map(id => {
                        const convo = world.conversations[id];
                        const lastMsg = convo.messages[convo.messages.length - 1];
                        const name = convo.name || "Unknown";
                        const preview = lastMsg
                            ? (lastMsg.type === "image" ? "📷 Photo" :
                               (lastMsg.type === "video" ? "🎥 Video" :
                               (lastMsg.type === "voice" ? "🎤 Voice Message" : lastMsg.text)))
                            : "";
                        const time = lastMsg?.timestamp || "Yesterday";

                        return (
                            <div key={id} style={{
                                display: "flex",
                                height: 220,
                                paddingLeft: 48,
                                alignItems: "center",
                                backgroundColor: "#FFF"
                            }}>
                                {/* Avatar */}
                                <div style={{
                                    width: 150,
                                    height: 150,
                                    borderRadius: "50%",
                                    backgroundColor: "#EEE",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: 60,
                                    marginRight: 36,
                                    color: "#AAA"
                                }}>
                                    {name.charAt(0).toUpperCase()}
                                </div>

                                {/* Content */}
                                <div style={{
                                    flex: 1,
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    borderBottom: "1px solid rgba(0,0,0,0.1)",
                                    paddingRight: 48
                                }}>
                                    {/* Top Row: Name + Time */}
                                    <div style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        marginBottom: 12
                                    }}>
                                        <span style={{
                                            fontSize: 48,
                                            fontWeight: "600",
                                            color: "#000"
                                        }}>
                                            {name}
                                        </span>
                                        <span style={{
                                            fontSize: 42,
                                            color: "#8E8E93"
                                        }}>
                                            {time}
                                        </span>
                                    </div>

                                    {/* Bottom Row: Preview + Unread/Status */}
                                    <div style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center"
                                    }}>
                                        <span style={{
                                            fontSize: 42,
                                            color: "#8E8E93",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            maxWidth: 600
                                        }}>
                                            {preview}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Bottom Tab Bar (Simulated) */}
            <div style={{
                height: 240,
                backgroundColor: "#F6F6F6",
                borderTop: "1px solid rgba(0,0,0,0.2)",
                display: "flex",
                justifyContent: "space-around",
                alignItems: "center",
                paddingBottom: 40
            }}>
                 {/* Icons for Status, Calls, Communities, Chats, Settings */}
                 {/* Simplified for now */}
                 <div style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: 0.5 }}>
                     <div style={{ width: 60, height: 60, borderRadius: "50%", border: "2px solid #000", marginBottom: 10 }}></div>
                     <span style={{ fontSize: 30 }}>Status</span>
                 </div>
                 <div style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: 0.5 }}>
                     <div style={{ width: 60, height: 60, border: "2px solid #000", marginBottom: 10 }}></div>
                     <span style={{ fontSize: 30 }}>Calls</span>
                 </div>
                 <div style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: 0.5 }}>
                     <div style={{ width: 60, height: 60, border: "2px solid #000", marginBottom: 10 }}></div>
                     <span style={{ fontSize: 30 }}>Communities</span>
                 </div>
                 <div style={{ display: "flex", flexDirection: "column", alignItems: "center", color: "#007AFF" }}>
                     <div style={{ width: 60, height: 60, backgroundColor: "#007AFF", borderRadius: 10, marginBottom: 10 }}></div>
                     <span style={{ fontSize: 30, fontWeight: "600" }}>Chats</span>
                 </div>
                 <div style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: 0.5 }}>
                     <div style={{ width: 60, height: 60, border: "2px solid #000", marginBottom: 10 }}></div>
                     <span style={{ fontSize: 30 }}>Settings</span>
                 </div>
            </div>
        </div>
    );
};
