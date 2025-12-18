import type { DeviceState } from "@tokovo/core";
import type { NotificationInstance } from "./types";

/**
 * Notification Scheduler
 * 
 * Determines which notifications are visible at a given time `t`.
 * Moves the "Smart Queue" logic from View to Engine.
 * 
 * NOTE: Reducer now produces canonical NotificationInstance shape.
 * No normalization needed - fields are flat and properly typed.
 * 
 * Rules:
 * 1. Notifications must have a minimum gap between them.
 * 2. They play sequentially based on creation time.
 * 3. Heads-up duration is enforced here.
 */
export const NotificationScheduler = {
    /**
     * Compute the current visual state of notifications.
     */
    schedule(device: DeviceState, t: number): { headsUp: NotificationInstance | null } {
        // Read from notificationCenter.items (canonical location)
        const notifications = (device.notificationCenter?.items || []) as NotificationInstance[];
        const isLocked = device.isLocked;

        // Configuration
        const HEADS_UP_DURATION = 150; // 5 seconds @ 30fps
        const GAP = 10; // Frames between notifications

        // 0. Fast exit if no notifications or DND
        if (notifications.length === 0 || device.os?.dnd) {
            return { headsUp: null };
        }

        // 1. Filter candidates for Heads-Up
        // - Must not be dismissed
        // - Must not be lockscreen-only
        const candidates = notifications.filter(n => {
            if (n.mode === "lockscreen") return false;
            if (n.state === "dismissed" && n.dismissedAtFrame) return false;
            return true;
        });

        if (candidates.length === 0) return { headsUp: null };

        // 2. Sort by creation time (FIFO) - use canonical createdAtFrame
        const sorted = [...candidates].sort((a, b) => a.createdAtFrame - b.createdAtFrame);

        // 3. Simulate the Timeline to find what's active NOW
        let lastEndTime = 0;
        let active: NotificationInstance | null = null;

        for (const n of sorted) {
            const effectiveStart = Math.max(n.createdAtFrame, lastEndTime > 0 ? lastEndTime + GAP : 0);
            const effectiveEnd = effectiveStart + HEADS_UP_DURATION;
            lastEndTime = effectiveEnd;

            // Is `t` inside this window?
            if (t >= effectiveStart && t < effectiveEnd) {
                // Update shownAtFrame for animation
                active = {
                    ...n,
                    shownAtFrame: effectiveStart,
                };
                break;
            }
        }

        return { headsUp: active };
    }
};
