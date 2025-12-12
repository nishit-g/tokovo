import React from "react";
import { Notification } from "@tokovo/core";
import { LayoutState, LockscreenLayoutState } from "@tokovo/core";

/**
 * iOS 16+ Lockscreen View
 * - Time at top (below Dynamic Island)
 * - Date below time
 * - Notifications stacked at BOTTOM (iOS 16+ style)
 * - Flashlight & Camera buttons
 */

interface LockscreenViewProps {
    notifications?: Notification[];
    layout?: LayoutState;
    variant?: "ios" | "android";
    time?: string;
    date?: string;
}

export const LockscreenView: React.FC<LockscreenViewProps> = ({
    notifications = [],
    layout,
    variant = "ios",
    time = "9:41",
    date
}) => {
    const isAndroid = variant === "android";
    const lockscreenLayout = layout?.kind === "LOCKSCREEN" ? (layout as LockscreenLayoutState) : null;
    const displayDate = date || formatDate();

    // Filter active notifications for lockscreen
    const activeNotifications = notifications.filter(n => {
        if (n.dismissedAt !== undefined) return false;
        const mode = n.mode || "both";
        return mode === "lockscreen" || mode === "both";
    });

    return (
        <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isAndroid
                ? "linear-gradient(180deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)"
                : "linear-gradient(180deg, #000000 0%, #1C1C1E 100%)",
            display: "flex",
            flexDirection: "column",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
            color: "white"
        }}>
            {/* Time Display - Top area after Dynamic Island */}
            <div style={{
                marginTop: 330,
                textAlign: "center"
            }}>
                <div style={{
                    fontSize: isAndroid ? 240 : 270,
                    fontWeight: isAndroid ? "400" : "200",
                    letterSpacing: isAndroid ? 0 : -6,
                    lineHeight: 1,
                    fontVariantNumeric: "tabular-nums"
                }}>
                    {time}
                </div>
                <div style={{
                    marginTop: 18,
                    fontSize: 60,
                    fontWeight: "400",
                    opacity: 0.9,
                    letterSpacing: 1
                }}>
                    {displayDate}
                </div>
            </div>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* iOS 16+ Style Notifications - Bottom Stack */}
            {activeNotifications.length > 0 && (
                <div style={{
                    paddingBottom: 240,
                    paddingLeft: 45,
                    paddingRight: 45
                }}>
                    {/* Notification Stack - shows latest on top */}
                    {activeNotifications.slice(-3).reverse().map((notification, index) => {
                        // Get layout for animation if available
                        const nl = lockscreenLayout?.notificationLayouts.find(l => l.id === notification.id);
                        const opacity = nl?.opacity ?? 1;
                        const translateY = nl?.translateY ?? 0;

                        // Stack effect: Each card slightly smaller and offset
                        const stackOffset = index * 12;
                        const stackScale = 1 - (index * 0.02);

                        return (
                            <div
                                key={notification.id}
                                style={{
                                    marginBottom: index === 0 ? 0 : -135, // Overlap cards
                                    opacity: opacity * (1 - index * 0.15),
                                    transform: `translateY(${translateY + stackOffset}px) scale(${stackScale})`,
                                    transformOrigin: "bottom center",
                                    zIndex: 10 - index
                                }}
                            >
                                <NotificationCard
                                    notification={notification}
                                    variant={variant}
                                />
                            </div>
                        );
                    })}

                    {/* Notification count if more than shown */}
                    {activeNotifications.length > 3 && (
                        <div style={{
                            textAlign: "center",
                            marginTop: 24,
                            fontSize: 36,
                            opacity: 0.6
                        }}>
                            +{activeNotifications.length - 3} more notification{activeNotifications.length > 4 ? 's' : ''}
                        </div>
                    )}
                </div>
            )}

            {/* Bottom Controls Area */}
            <div style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 240,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0 75px"
            }}>
                {!isAndroid && (
                    <>
                        <ControlButton icon="flashlight" />
                        <ControlButton icon="camera" />
                    </>
                )}
            </div>

            {/* Home Indicator */}
            <div style={{
                position: "absolute",
                bottom: 24,
                left: "50%",
                transform: "translateX(-50%)",
                width: 405,
                height: 15,
                backgroundColor: "rgba(255, 255, 255, 0.6)",
                borderRadius: 15
            }} />
        </div>
    );
};

/**
 * Bottom control button (Flashlight/Camera)
 */
const ControlButton: React.FC<{ icon: "flashlight" | "camera" }> = ({ icon }) => (
    <div style={{
        width: 150,
        height: 150,
        borderRadius: "50%",
        backgroundColor: "rgba(255, 255, 255, 0.25)",
        backdropFilter: "blur(20px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    }}>
        <svg width="60" height="60" viewBox="0 0 24 24" fill="white">
            {icon === "flashlight" ? (
                <path d="M9 2v6l-2 2v12h10V10l-2-2V2H9zm2 2h2v4h-2V4zm-1 7h4v9h-4v-9z" />
            ) : (
                <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2" fill="none" />
            )}
        </svg>
    </div>
);

/**
 * iOS 16+ Style Notification Card
 */
const NotificationCard: React.FC<{
    notification: Notification;
    variant?: "ios" | "android";
}> = ({ notification, variant = "ios" }) => {
    const isAndroid = variant === "android";

    const APP_ICONS: Record<string, { bg: string; icon: string; name: string }> = {
        app_whatsapp: { bg: "#25D366", icon: "W", name: "WhatsApp" },
        app_instagram: { bg: "linear-gradient(135deg, #833AB4, #FD1D1D, #FCAF45)", icon: "📷", name: "Instagram" },
        app_messages: { bg: "#34C759", icon: "💬", name: "Messages" },
    };

    const appInfo = APP_ICONS[notification.appId] || { bg: "#8E8E93", icon: "📱", name: "App" };

    return (
        <div style={{
            backgroundColor: isAndroid ? "rgba(48, 48, 48, 0.95)" : "rgba(30, 30, 30, 0.85)",
            backdropFilter: "blur(60px)",
            WebkitBackdropFilter: "blur(60px)",
            borderRadius: 48,
            padding: "33px 42px",
            color: "white"
        }}>
            {/* Header with app icon and name */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                marginBottom: 15
            }}>
                {/* Small app icon */}
                <div style={{
                    width: 54,
                    height: 54,
                    borderRadius: 12,
                    background: appInfo.bg,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: 27,
                    color: "white"
                }}>
                    {appInfo.icon}
                </div>
                <span style={{
                    fontSize: 33,
                    opacity: 0.7,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    fontWeight: "500"
                }}>
                    {appInfo.name}
                </span>
                <span style={{ marginLeft: "auto", fontSize: 30, opacity: 0.5 }}>
                    now
                </span>
            </div>

            {/* Title and body */}
            <div style={{
                fontSize: 42,
                fontWeight: "600",
                marginBottom: 9
            }}>
                {notification.title}
            </div>
            <div style={{
                fontSize: 39,
                opacity: 0.9,
                lineHeight: 1.3
            }}>
                {notification.body}
            </div>
        </div>
    );
};

/**
 * Format current date for display
 */
function formatDate(): string {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    const now = new Date();
    const day = days[now.getDay()];
    const month = months[now.getMonth()];
    const date = now.getDate();

    return `${day}, ${month} ${date}`;
}
