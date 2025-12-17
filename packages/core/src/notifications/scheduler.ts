import { DeviceState, NotificationInstance } from "../types";

/**
 * Notification Scheduler
 * 
 * Determines which notifications are visible at a given time `t`.
 * Moves the "Smart Queue" logic from View to Engine.
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
        const notifications = device.os?.notifications || [];
        const isLocked = device.isLocked;

        // Configuration
        const HEADS_UP_DURATION = 150; // 5 seconds @ 30fps
        const GAP = 10; // Frames between notifications

        // 0. Fast exit if no notifications or DND
        if (notifications.length === 0 || device.os?.dnd) {
            return { headsUp: null };
        }

        // 1. Filter candidates for Heads-Up
        // - Must not be dismissed (unless auto-dismissed by time)
        // - Must not be lockscreen-only
        const candidates = notifications.filter(n => {
            const mode = n.mode || "both";
            if (mode === "lockscreen") return false;
            // If explicit user dismissal happened, ignore
            if (n.state === "dismissed" && n.dismissedAtFrame) return false;
            // If we are locked and it's sensitive, maybe hide? (For now simplify: show if not specific logic)
            return true;
        });

        if (candidates.length === 0) return { headsUp: null };

        // 2. Sort by creation time (FIFO)
        const sorted = [...candidates].sort((a, b) => a.createdAtFrame - b.createdAtFrame);

        // 3. Simulate the Timeline to find what's active NOW
        // We must replay the schedule from the first candidate to see where they land.
        let lastEndTime = 0;
        let active: NotificationInstance | null = null;

        for (const n of sorted) {
            // effectiveStart = max(created, lastEndTime + GAP)
            // The earliest a notification can show is when it was created,
            // OR after the previous one finished + gap.
            const effectiveStart = Math.max(n.createdAtFrame, lastEndTime > 0 ? lastEndTime + GAP : 0);

            const effectiveEnd = effectiveStart + HEADS_UP_DURATION;
            lastEndTime = effectiveEnd;

            // Is `t` inside this window?
            if (t >= effectiveStart && t < effectiveEnd) {
                // Determine visibility based on lock state
                // If locked, heads-up might not show if we are on lockscreen (which handles its own list)
                // But typically heads-up shows on top of lockscreen too for new arrivals.
                // For now, let's assume HeadsUp always shows if active.

                // CLONE and UPDATE shownAtFrame
                // The renderer needs `shownAtFrame` to drive the entry animation.
                // Since we delayed it, we must lie to the renderer about when it "started" logic-wise.
                active = {
                    ...n,
                    shownAtFrame: effectiveStart
                };
                break;
            }
        }

        return { headsUp: active };
    }
};
