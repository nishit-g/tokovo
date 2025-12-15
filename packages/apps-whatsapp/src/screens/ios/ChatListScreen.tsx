import React from "react";
import { WorldState } from "@tokovo/core";
import { WhatsAppState } from "../../types";

export interface ChatListScreenProps {
    world: WorldState;
    safeAreaInsets?: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
    width: number;
    height: number;
}

export const ChatListScreen: React.FC<ChatListScreenProps> = ({
    world,
    safeAreaInsets,
    width,
    height
}) => {
    // 1. Calculate Safe Areas (Resolution Independence)
    const designWidth = 393;
    const targetWidth = width || 1179;
    const scale = targetWidth / designWidth;

    const physicalSafeTop = safeAreaInsets?.top ?? 177;
    const safeAreaTop = physicalSafeTop / scale;

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            backgroundColor: "#FFFFFF",
            position: "relative",
            paddingTop: safeAreaTop
        }}>
            {/* Header */}
            <div style={{
                padding: "16px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #EFEFEF"
            }}>
                <div style={{ fontSize: 32, fontWeight: "bold", color: "#000" }}>Chats</div>
                <div style={{ color: "#007AFF", fontSize: 17 }}>Edit</div>
            </div>

            {/* List */}
            <div style={{ padding: "0 20px" }}>
                {/* Mock Item 1 */}
                <div style={{
                    display: "flex",
                    padding: "12px 0",
                    borderBottom: "1px solid #F0F0F0",
                    gap: 12
                }}>
                    <div style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: "#E0E0E0" }} />
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <div style={{ fontWeight: 600, fontSize: 17 }}>Berozgaar Engineers 🛠️</div>
                            <div style={{ color: "#8E8E93", fontSize: 15 }}>10:42 AM</div>
                        </div>
                        <div style={{ color: "#8E8E93", fontSize: 15, marginTop: 4 }}>
                            Sameer: Meeee! 🙋‍♂️ I'm free!
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
