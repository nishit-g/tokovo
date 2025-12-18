import React from "react";
import { AppSurface } from "@tokovo/core";
import type { NotificationInstance } from "../types";
import { NotificationStrategyRegistry } from "../registries";
import { IOSNotificationStrategy } from "../strategies/IOSNotificationStrategy";


interface HeadsUpNotificationProps {
    notification: NotificationInstance;
    currentTime: number;
    /** Theme for visual style - looks up from NotificationStrategyRegistry */
    variant?: string;
    autoDismissAfter?: number; // frames
    deviceWidth?: number; // Physical device width (e.g., 1290 for iPhone 16)
}

/**
 * Heads-Up Notification
 * Displays at the top of the screen when device is unlocked
 * Slides down and auto-dismisses after configurable duration
 * 
 * Supports custom themes via NotificationStrategyRegistry:
 * @example
 * ```typescript
 * NotificationStrategyRegistry.register("ghibli", GhibliNotificationStrategy);
 * <HeadsUpNotification variant="ghibli" ... />
 * ```
 */
export const HeadsUpNotification: React.FC<HeadsUpNotificationProps> = ({
    notification,
    currentTime,
    variant = "ios",
    autoDismissAfter = 150,
    deviceWidth = 1290, // Default to iPhone 16 width
}) => {
    // Calculate animation state
    const timeSinceAppear = currentTime - (notification.shownAtFrame || 0);
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
        const dismissStartTime = notification.dismissedAtFrame || ((notification.shownAtFrame || 0) + autoDismissAfter);
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

    // Position below Dynamic Island
    // DI ends at ~146px (topY:36 + height:110), add margin for proper spacing  
    const pillTop = 180; // Below Dynamic Island with some margin

    // ★ REGISTRY LOOKUP - Get strategy from registry with iOS fallback
    const Strategy = NotificationStrategyRegistry.get(variant) || IOSNotificationStrategy;

    // AppSurface scaling: design at 393px logical, scale to physical device width
    const DESIGN_WIDTH = 393; // Standard iPhone logical width

    return (
        <div style={{
            position: "absolute",
            top: pillTop,
            left: "50%",
            transform: `translateX(-50%) translateY(${translateY}px)`,
            width: "92%", // Use 92% of device width
            opacity,
            zIndex: 200,
            pointerEvents: "none",
        }}>
            <AppSurface
                designWidth={DESIGN_WIDTH}
                targetWidth={deviceWidth * 0.92} // 92% of device width
                backgroundColor="transparent"
            >
                <Strategy notification={notification} />
            </AppSurface>
        </div>
    );
};
