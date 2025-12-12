import React from "react";
import { Notification } from "@tokovo/core";

/**
 * App icon mappings for notifications
 */
const APP_ICONS: Record<string, { bg: string; icon: string }> = {
    app_whatsapp: { bg: "#25D366", icon: "W" },
    app_instagram: { bg: "linear-gradient(135deg, #833AB4, #FD1D1D, #FCAF45)", icon: "📷" },
    app_messages: { bg: "#34C759", icon: "💬" },
    app_facetime: { bg: "#32D74B", icon: "📹" },
    app_phone: { bg: "#32D74B", icon: "📞" },
};

interface HeadsUpNotificationProps {
    notification: Notification;
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

    // Calculate animation state
    const timeSinceAppear = currentTime - notification.at;
    const appearDuration = 15; // frames for slide-in animation
    const dismissDuration = 15; // frames for slide-out animation

    // Check if dismissed (manually or auto)
    const shouldAutoDismiss = timeSinceAppear > autoDismissAfter;
    const isDismissed = notification.dismissedAt !== undefined || shouldAutoDismiss;

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
        const dismissStartTime = notification.dismissedAt || (notification.at + autoDismissAfter);
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

    // Get app icon
    const appInfo = APP_ICONS[notification.appId] || { bg: "#8E8E93", icon: "📱" };

    return (
        <div style={{
            position: "absolute",
            top: 165, // Below dynamic island
            left: "50%",
            transform: `translateX(-50%) translateY(${translateY}px)`,
            width: "92%",
            opacity,
            zIndex: 200,
            pointerEvents: "none"
        }}>
            <div style={{
                backgroundColor: isAndroid ? "rgba(48, 48, 48, 0.98)" : "rgba(255, 255, 255, 0.98)",
                backdropFilter: "blur(30px)",
                WebkitBackdropFilter: "blur(30px)",
                borderRadius: isAndroid ? 30 : 48,
                padding: "30px 36px",
                boxShadow: "0 12px 48px rgba(0, 0, 0, 0.25)",
                display: "flex",
                alignItems: "center",
                gap: 30,
                color: isAndroid ? "white" : "black"
            }}>
                {/* App Icon */}
                <div style={{
                    width: 96,
                    height: 96,
                    borderRadius: 24,
                    background: appInfo.bg,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: 45,
                    color: "white",
                    flexShrink: 0
                }}>
                    {notification.icon || appInfo.icon}
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 9
                    }}>
                        <span style={{
                            fontSize: 39,
                            fontWeight: "600",
                            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif"
                        }}>
                            {notification.title}
                        </span>
                        <span style={{
                            fontSize: 33,
                            opacity: 0.5,
                            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
                        }}>
                            now
                        </span>
                    </div>
                    <div style={{
                        fontSize: 36,
                        opacity: 0.85,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
                    }}>
                        {notification.body}
                    </div>
                </div>
            </div>
        </div>
    );
};
