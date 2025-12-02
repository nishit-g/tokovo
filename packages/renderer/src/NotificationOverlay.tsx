import React from "react";
import { Notification, LayoutState, LockscreenLayoutState } from "@tokovo/core";

export const NotificationOverlay: React.FC<{ notifications?: Notification[]; variant?: "ios" | "android"; layout?: LayoutState }> = ({ notifications = [], variant = "ios", layout }) => {
    // If we have a Lockscreen layout, use it
    const lockscreenLayout = layout?.kind === "LOCKSCREEN" ? (layout as LockscreenLayoutState) : null;

    // If no layout provided or not lockscreen, we might still want to show notifications (e.g. heads-up)
    // But for now, let's assume we only use this for lockscreen stacking or heads-up if layout engine supports it.
    // If layout is missing, fallback to nothing or old behavior? 
    // Let's stick to layout-driven. If no layout, no render.
    if (!lockscreenLayout) return null;

    const isAndroid = variant === "android";

    return (
        <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: "none",
            zIndex: 100
        }}>
            {lockscreenLayout.notificationLayouts.map(nl => {
                const notification = notifications.find(n => n.id === nl.id);
                if (!notification) return null;

                return (
                    <div key={nl.id} style={{
                        position: "absolute",
                        top: nl.y,
                        left: "50%",
                        transform: `translateX(-50%) translateY(${nl.translateY}px)`,
                        width: "92%",
                        opacity: nl.opacity,
                        height: nl.height
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
                            height: "100%",
                            boxSizing: "border-box"
                        }}>
                            <div style={{
                                width: 100,
                                height: 100,
                                borderRadius: 20,
                                backgroundColor: "#25D366", // WhatsApp Green (Mock)
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                fontSize: 50,
                                color: "white"
                            }}>
                                W
                            </div>
                            <div style={{ flex: 1, overflow: "hidden" }}>
                                <div style={{ fontSize: 36, fontWeight: "bold", marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                                    <span>{notification.title}</span>
                                    <span style={{ fontSize: 28, opacity: 0.5, fontWeight: "normal" }}>now</span>
                                </div>
                                <div style={{ fontSize: 36, opacity: 0.8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {notification.body}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
