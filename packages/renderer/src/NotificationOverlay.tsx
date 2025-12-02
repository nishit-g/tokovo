import React from "react";
import { Notification } from "@tokovo/core";

export const NotificationOverlay: React.FC<{ notifications?: Notification[]; variant?: "ios" | "android" }> = ({ notifications = [], variant = "ios" }) => {
    if (!notifications || notifications.length === 0) return null;

    // Only show the latest notification for now
    const latest = notifications[notifications.length - 1];

    const isAndroid = variant === "android";

    return (
        <div style={{
            position: "absolute",
            top: isAndroid ? 40 : 20,
            left: "50%",
            transform: "translateX(-50%)",
            width: "92%",
            zIndex: 100,
            pointerEvents: "none" // Let clicks pass through
        }}>
            <div style={{
                backgroundColor: isAndroid ? "#303030" : "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(20px)",
                borderRadius: isAndroid ? 24 : 36,
                padding: "30px 40px",
                boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
                display: "flex",
                alignItems: "center",
                gap: 30,
                color: isAndroid ? "white" : "black",
                animation: "slideDown 0.5s cubic-bezier(0.16, 1, 0.3, 1)"
            }}>
                <div style={{
                    width: 100,
                    height: 100,
                    borderRadius: 20,
                    backgroundColor: "#25D366", // WhatsApp Green
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: 50,
                    color: "white"
                }}>
                    W
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 36, fontWeight: "bold", marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                        <span>{latest.title}</span>
                        <span style={{ fontSize: 28, opacity: 0.5, fontWeight: "normal" }}>now</span>
                    </div>
                    <div style={{ fontSize: 36, opacity: 0.8 }}>
                        {latest.body}
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes slideDown {
                    from { transform: translateY(-150%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};
