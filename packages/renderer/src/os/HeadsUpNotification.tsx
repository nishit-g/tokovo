import React from "react";
import { NotificationInstance, AppMetadataRegistry, NotificationViewRegistry, AppSurface } from "@tokovo/core";
import { AndroidNotificationStrategy } from "../strategies/AndroidNotificationStrategy";
import { IOSNotificationStrategy } from "../strategies/IOSNotificationStrategy";


interface HeadsUpNotificationProps {
    notification: NotificationInstance;
    currentTime: number;
    variant?: "ios" | "android";
    autoDismissAfter?: number; // frames
    density?: number;
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
    autoDismissAfter = 150,
    density = 3
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

    // Select Strategy
    const Strategy = isAndroid ? AndroidNotificationStrategy : IOSNotificationStrategy;

    // Scale Logic: Enterprise Grade
    // Use the actual device density to scale Logical -> Physical
    const SCALE = density;

    return (
        <div style={{
            position: "absolute",
            top: pillTop,
            left: "50%",
            transform: `translateX(-50%) translateY(${translateY}px)`,
            width: pillWidth, // This is PHYSICAL width (e.g. 92% of 1290)
            opacity,
            zIndex: 200,
            pointerEvents: "none",
            // AppSurface parent needs to handle the scaled content flow
            display: "flex",
            justifyContent: "center"
        }}>
            <AppSurface
                scale={SCALE}
                width={`calc(100% / ${SCALE})`} // Logical width = Physical / Scale
                style={{ transformOrigin: "top center" }} // Center alignment
            >
                <Strategy notification={notification} />
            </AppSurface>
        </div>
    );
};
