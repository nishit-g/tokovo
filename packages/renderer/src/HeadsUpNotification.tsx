import React from "react";
import { NotificationInstance, AppMetadataRegistry, NotificationViewRegistry } from "@tokovo/core";

interface HeadsUpNotificationProps {
    notification: NotificationInstance;
    currentTime: number;
    variant?: "ios" | "android";
    autoDismissAfter?: number; // frames
}

/**
 * Heads-Up Notification
 * Displays at the top of the screen when device is unlocked
 * Slides down and auto-dismisses after configurable duration
 */
export const HeadsUpNotification: React.FC<HeadsUpNotificationProps> = ({
    notification,
    currentTime,
    variant = "ios",
    autoDismissAfter = 150 // 5 seconds at 30fps
}) => {
    const isAndroid = variant === "android";
    const ir = notification.ir;

    // Calculate animation state
    const timeSinceAppear = currentTime - notification.shownAtFrame!;
    const appearDuration = 15; // frames for slide-in animation
    const dismissDuration = 15; // frames for slide-out animation

    // Check if dismissed (manually or auto)
    const shouldAutoDismiss = timeSinceAppear > autoDismissAfter;
    const isDismissed = notification.state === "dismissed" || shouldAutoDismiss;

    // Calculate animation progress
    let opacity = 1;
    let translateY = 0;

    if (timeSinceAppear < appearDuration) {
        // Slide in animation
        const progress = Math.min(1, timeSinceAppear / appearDuration);
        const ease = 1 - Math.pow(1 - progress, 3); // Ease out cubic
        opacity = ease;
        translateY = -120 * (1 - ease); // Slide from above
    } else if (isDismissed) {
        // Slide out animation
        const dismissStartTime = notification.dismissedAtFrame || (notification.shownAtFrame! + autoDismissAfter);
        const timeSinceDismiss = currentTime - dismissStartTime;

        if (timeSinceDismiss < dismissDuration) {
            const progress = timeSinceDismiss / dismissDuration;
            const ease = Math.pow(progress, 2); // Ease in quad
            opacity = 1 - ease;
            translateY = -120 * ease; // Slide up
        } else {
            return null; // Fully dismissed
        }
    }

    // Get app branding from Registry
    const appMeta = AppMetadataRegistry.get(ir.appId);

    // Dynamic Island / Pill calculation (simplified)
    const pillWidth = "92%";
    const pillTop = 165;

    // Check registry for custom view
    const CustomView = NotificationViewRegistry.get(ir.appId);

    return (
        <div style={{
            position: "absolute",
            top: pillTop, // Below dynamic island
            left: "50%",
            transform: `translateX(-50%) translateY(${translateY}px)`,
            width: pillWidth,
            opacity,
            zIndex: 200,
            pointerEvents: "none"
        }}>
            {/* OS CONTAINER LAYER */}
            <div style={{
                backgroundColor: isAndroid ? "rgba(30, 30, 30, 0.95)" : "rgba(255, 255, 255, 0.96)",
                backdropFilter: "blur(40px)",
                WebkitBackdropFilter: "blur(40px)",
                borderRadius: isAndroid ? 28 : 44,
                padding: "20px 24px",
                boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0,0,0,0.04)",
                display: "flex",
                flexDirection: "column", // Stack Header + Content
                // gap: 12,
                color: isAndroid ? "white" : "black",
                border: isAndroid ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.05)",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
            }}>
                {/* STANDARD OS HEADER */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 4
                }}>
                    {/* App Icon */}
                    <div style={{
                        width: 38,
                        height: 38,
                        borderRadius: 9,
                        background: appMeta.themeColor,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        fontSize: 20,
                        color: "white",
                        flexShrink: 0,
                        overflow: "hidden"
                    }}>
                        {appMeta.icon}
                    </div>

                    <span style={{
                        fontSize: 26, // Scaled down logical
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        opacity: 0.6
                    }}>
                        {appMeta.displayName || "APP"}
                    </span>

                    <span style={{ marginLeft: "auto", fontSize: 26, opacity: 0.4 }}>
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
                            // Detect if this is a "Messaging Style" notification
                            // Rule: If it has a custom icon inside the IR (different from app icon), treat as Avatar
                            const hasCustomIcon = !!ir.icon;
                            const isEmoji = hasCustomIcon && /^\p{Emoji}/u.test(ir.icon || "");

                            if (hasCustomIcon) {
                                return (
                                    <div style={{
                                        display: "flex",
                                        gap: 15,
                                        alignItems: "flex-start",
                                        width: "100%",
                                        marginTop: 6
                                    }}>
                                        {/* Avatar */}
                                        <div style={{
                                            width: 50,
                                            height: 50,
                                            borderRadius: "50%",
                                            backgroundColor: "#f0f0f0",
                                            flexShrink: 0,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: 28,
                                            overflow: "hidden"
                                        }}>
                                            {isEmoji ? ir.icon : (
                                                <span style={{ color: "#999", fontSize: 20, fontWeight: 600 }}>
                                                    {ir.title.charAt(0)}
                                                </span>
                                            )}
                                        </div>

                                        <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 32, fontWeight: 600 }}>{ir.title}</div>
                                            <div style={{ fontSize: 32, opacity: 0.9, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                                {ir.body}
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            // Standard Layout
                            return (
                                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                    <div style={{ fontSize: 30, fontWeight: 600 }}>{ir.title}</div>
                                    <div style={{ fontSize: 30, opacity: 0.9, lineHeight: 1.3 }}>{ir.body}</div>
                                </div>
                            );
                        })()
                    )}
                </div>
            </div>
        </div>
    );
};
