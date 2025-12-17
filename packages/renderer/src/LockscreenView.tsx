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

// APP_LOGOS Removed. Using AppMetadataRegistry.

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
    notification: Notification; // Is actually NotificationInstance
    variant?: "ios" | "android";
}> = ({ notification, variant = "ios" }) => {
    const ir = notification.ir;
    if (!ir) return null; // Safety check

    // Decoupled: Use Registry
    // Since this is a React component, we might need to handle the case where "icon" is a string or component.
    // Ideally we pass it as a prop or context, but for now we look it up.
    // Note: In strict React, side-effect imports inside render are bad, but this is a static registry.
    const { AppMetadataRegistry } = require("@tokovo/core");
    const meta = AppMetadataRegistry.get(ir.appId);

    const appIcon = typeof meta.icon === "string" ? (
        <div style={{
            width: 66,
            height: 66,
            borderRadius: 15,
            background: meta.themeColor || "#8E8E93",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 30,
            color: "white"
        }}>{meta.icon}</div>
    ) : (
        // It's a React Node (SVG)
        meta.icon
    );

    const appName = meta.displayName || "APP";

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
                {appIcon}
                <span style={{
                    fontSize: 30,
                    opacity: 0.6,
                    fontWeight: 600,
                    letterSpacing: 1.5
                }}>
                    {appName.toUpperCase()}
                </span>
                <span style={{ marginLeft: "auto", fontSize: 27, opacity: 0.4 }}>
                    now
                </span>
            </div>

            {/* Content */}
            <div style={{ fontSize: 45, fontWeight: 600, marginBottom: 9 }}>
                {ir.title}
            </div>
            <div style={{ fontSize: 42, opacity: 0.9, lineHeight: 1.35 }}>
                {ir.body}
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
