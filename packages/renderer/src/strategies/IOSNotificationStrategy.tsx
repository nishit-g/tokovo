
import React from 'react';
import { AppMetadataRegistry, NotificationViewRegistry } from "@tokovo/core";
import { NotificationStrategyProps } from "./types";

export const IOSNotificationStrategy: React.FC<NotificationStrategyProps> = ({ notification }) => {
    // Support both structures: notification.ir (legacy) or flat notification object (new)
    const ir = notification.ir || notification;
    const appMeta = AppMetadataRegistry.get(ir.appId);

    // Check registry for custom view (App Content)
    const CustomView = NotificationViewRegistry.get(ir.appId);

    return (
        <div style={{
            backgroundColor: "rgba(255, 255, 255, 0.96)",
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            // Standard iOS notification radius is ~18px logical.
            borderRadius: 18,
            padding: "16px 18px",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0,0,0,0.04)",
            display: "flex",
            flexDirection: "column",
            color: "black",
            border: "1px solid rgba(0,0,0,0.05)",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
        }}>
            {/* STANDARD iOS HEADER */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 2
            }}>
                {/* App Icon */}
                <div style={{
                    width: 20,
                    height: 20,
                    borderRadius: 5,
                    background: appMeta.themeColor,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: 12,
                    color: "white",
                    flexShrink: 0,
                    overflow: "hidden"
                }}>
                    {appMeta.icon}
                </div>

                <span style={{
                    fontSize: 13,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: 0.3,
                    opacity: 0.5,
                    color: "black"
                }}>
                    {appMeta.displayName || "APP"}
                </span>

                <span style={{ marginLeft: "auto", fontSize: 13, opacity: 0.4 }}>
                    now
                </span>
            </div>

            {/* APP CONTENT LAYER */}
            <div style={{ width: "100%" }}>
                {CustomView ? (
                    <CustomView notification={notification} isExpanded={true} />
                ) : (
                    // SMART CONTENT RENDERER
                    (() => {
                        const isMessage = ir.category === 'message' || !!ir.icon;
                        const hasCustomIcon = !!ir.icon;
                        const isEmoji = hasCustomIcon && /^\p{Emoji}/u.test(ir.icon || "");

                        if (isMessage && hasCustomIcon) {
                            return (
                                <div style={{
                                    display: "flex",
                                    gap: 12,
                                    alignItems: "flex-start",
                                    width: "100%",
                                    marginTop: 0
                                }}>
                                    {/* Avatar */}
                                    <div style={{
                                        width: 38,
                                        height: 38,
                                        borderRadius: "50%",
                                        backgroundColor: "#f0f0f0",
                                        flexShrink: 0,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 20,
                                        overflow: "hidden"
                                    }}>
                                        {isEmoji ? ir.icon : (
                                            <span style={{ color: "#999", fontSize: 16, fontWeight: 600 }}>
                                                {ir.title.charAt(0)}
                                            </span>
                                        )}
                                    </div>

                                    <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 15, fontWeight: 600 }}>{ir.title}</div>
                                        <div style={{
                                            fontSize: 15,
                                            opacity: 0.9,
                                            lineHeight: 1.3,
                                            display: "-webkit-box",
                                            WebkitLineClamp: 3,
                                            WebkitBoxOrient: "vertical",
                                            overflow: "hidden"
                                        }}>
                                            {ir.body}
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        // Standard Layout
                        return (
                            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                <div style={{ fontSize: 15, fontWeight: 600 }}>{ir.title}</div>
                                <div style={{ fontSize: 15, opacity: 0.9, lineHeight: 1.25 }}>{ir.body}</div>
                            </div>
                        );
                    })()
                )}
            </div>
        </div>
    );
};
