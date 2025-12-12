import React from "react";
import { Notification } from "@tokovo/core";
import { LayoutState, LockscreenLayoutState } from "@tokovo/core";

/**
 * iOS 17/18 Lockscreen View
 * - Ultra-thin clock (font-weight: 100)
 * - Single-line date
 * - Notifications stacked at bottom
 * - App logo icons in notifications
 */

// App icons as actual images/gradients
const APP_LOGOS: Record<string, React.ReactNode> = {
    app_whatsapp: (
        <div style={{
            width: 66,
            height: 66,
            borderRadius: 15,
            background: "#25D366",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            </svg>
        </div>
    ),
    app_instagram: (
        <div style={{
            width: 66,
            height: 66,
            borderRadius: 15,
            background: "linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #FCAF45 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="white">
                <rect x="2" y="2" width="20" height="20" rx="5" stroke="white" strokeWidth="2" fill="none" />
                <circle cx="12" cy="12" r="4" stroke="white" strokeWidth="2" fill="none" />
                <circle cx="18" cy="6" r="1.5" fill="white" />
            </svg>
        </div>
    ),
    app_messages: (
        <div style={{
            width: 66,
            height: 66,
            borderRadius: 15,
            background: "#34C759",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
        }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="white">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
            </svg>
        </div>
    )
};

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
            background: "linear-gradient(180deg, #000000 0%, #1C1C1E 100%)",
            display: "flex",
            flexDirection: "column",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
            color: "white"
        }}>
            {/* Time Display - iOS 17 style ultra-thin */}
            <div style={{
                marginTop: 300,
                textAlign: "center"
            }}>
                <div style={{
                    fontSize: 300,
                    fontWeight: 100,  // Ultra-thin
                    letterSpacing: -12,
                    lineHeight: 0.9,
                    fontVariantNumeric: "tabular-nums"
                }}>
                    {time}
                </div>
                <div style={{
                    marginTop: 12,
                    fontSize: 54,
                    fontWeight: 500,
                    opacity: 0.9,
                    letterSpacing: 0
                }}>
                    {displayDate}
                </div>
            </div>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* iOS 16+ Notifications - Bottom Stack */}
            {activeNotifications.length > 0 && (
                <div style={{
                    paddingBottom: 270,
                    paddingLeft: 48,
                    paddingRight: 48
                }}>
                    {activeNotifications.slice(-3).reverse().map((notification, index) => {
                        const nl = lockscreenLayout?.notificationLayouts.find(l => l.id === notification.id);
                        const opacity = nl?.opacity ?? 1;
                        const translateY = nl?.translateY ?? 0;
                        const stackOffset = index * 15;
                        const stackScale = 1 - (index * 0.02);

                        return (
                            <div
                                key={notification.id}
                                style={{
                                    marginBottom: index === 0 ? 0 : -120,
                                    opacity: opacity * (1 - index * 0.2),
                                    transform: `translateY(${translateY + stackOffset}px) scale(${stackScale})`,
                                    transformOrigin: "bottom center",
                                    zIndex: 10 - index
                                }}
                            >
                                <NotificationCard notification={notification} variant={variant} />
                            </div>
                        );
                    })}

                    {activeNotifications.length > 3 && (
                        <div style={{
                            textAlign: "center",
                            marginTop: 30,
                            fontSize: 36,
                            opacity: 0.5
                        }}>
                            +{activeNotifications.length - 3} more
                        </div>
                    )}
                </div>
            )}

            {/* Bottom Buttons */}
            <div style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 270,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0 60px"
            }}>
                {!isAndroid && (
                    <>
                        <LockscreenButton icon="flashlight" />
                        <LockscreenButton icon="camera" />
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
                backgroundColor: "rgba(255, 255, 255, 0.5)",
                borderRadius: 15
            }} />
        </div>
    );
};

/**
 * Lockscreen control button
 */
const LockscreenButton: React.FC<{ icon: "flashlight" | "camera" }> = ({ icon }) => (
    <div style={{
        width: 150,
        height: 150,
        borderRadius: "50%",
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        backdropFilter: "blur(20px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    }}>
        {icon === "flashlight" ? (
            <svg width="54" height="54" viewBox="0 0 24 24" fill="white">
                <path d="M9 2h6v6l2 2v12H7V10l2-2V2zm2 2v4h2V4h-2zm-1 7.5v8h4v-8l-2-2-2 2z" />
            </svg>
        ) : (
            <svg width="54" height="54" viewBox="0 0 24 24" fill="white">
                <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2" fill="none" />
                <circle cx="12" cy="12" r="4" fill="white" />
            </svg>
        )}
    </div>
);

/**
 * Notification Card with app icon
 */
const NotificationCard: React.FC<{
    notification: Notification;
    variant?: "ios" | "android";
}> = ({ notification, variant = "ios" }) => {
    const appLogo = APP_LOGOS[notification.appId] || (
        <div style={{
            width: 66,
            height: 66,
            borderRadius: 15,
            background: "#8E8E93",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 30,
            color: "white"
        }}>📱</div>
    );

    const appNames: Record<string, string> = {
        app_whatsapp: "WHATSAPP",
        app_instagram: "INSTAGRAM",
        app_messages: "MESSAGES"
    };
    const appName = appNames[notification.appId] || "APP";

    return (
        <div style={{
            backgroundColor: "rgba(40, 40, 40, 0.8)",
            backdropFilter: "blur(60px)",
            WebkitBackdropFilter: "blur(60px)",
            borderRadius: 54,
            padding: "36px 42px",
            color: "white"
        }}>
            {/* Header */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
                marginBottom: 15
            }}>
                {appLogo}
                <span style={{
                    fontSize: 30,
                    opacity: 0.6,
                    fontWeight: 600,
                    letterSpacing: 1.5
                }}>
                    {appName}
                </span>
                <span style={{ marginLeft: "auto", fontSize: 27, opacity: 0.4 }}>
                    now
                </span>
            </div>

            {/* Content */}
            <div style={{ fontSize: 45, fontWeight: 600, marginBottom: 9 }}>
                {notification.title}
            </div>
            <div style={{ fontSize: 42, opacity: 0.9, lineHeight: 1.35 }}>
                {notification.body}
            </div>
        </div>
    );
};

/**
 * Format date
 */
function formatDate(): string {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    const now = new Date();
    return `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
}
