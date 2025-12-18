import type { DeviceState } from "@tokovo/core";
import type { NotificationInstance } from "./types";

/**
 * Normalizes a notification from any shape to canonical shape
 */
function normalizeNotification(n: any): NotificationInstance {
    // If it has nested ir, flatten it
    const ir = n.ir || {};

    return {
        id: n.id,
        deviceId: n.deviceId || "",
        appId: n.appId || ir.appId || "",
        title: n.title || ir.title || "",
        body: n.body || ir.body || "",
        icon: n.icon || ir.icon,
        preview: n.preview || ir.preview,
        actions: n.actions || ir.actions,
        replyable: n.replyable || ir.replyable,
        category: n.category || ir.category,
        metadata: n.metadata || ir.metadata,
        groupKey: n.groupKey || ir.groupKey,
        threadId: n.threadId || ir.threadId,
        createdAtFrame: n.createdAtFrame ?? n.at ?? n.deliveredAtFrame ?? 0,
        shownAtFrame: n.shownAtFrame,
        dismissedAtFrame: n.dismissedAtFrame ?? n.dismissedAt,
        state: n.state || "pending",
        mode: n.mode || ir.mode || "both",
        priority: n.priority || ir.priority || "default",
        deliverWhen: n.deliverWhen || ir.deliverWhen,
        tapped: n.tapped,
        animationState: n.animationState,
        // Keep legacy ir for backward compat
        ir: n.ir,
    };
}

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
        // Check both locations for backwards compatibility:
        // - device.notificationCenter.items (new - from devices reducer)
        // - device.os.notifications (legacy)
        const rawNotifications = device.notificationCenter?.items || device.os?.notifications || [];

        // Normalize all notifications to canonical shape
        const notifications = rawNotifications.map(normalizeNotification);
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

        // 2. Sort by creation time (FIFO)
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
