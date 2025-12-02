import { LayoutContext, LockscreenLayoutState, NotificationLayout } from "../types";

export function computeLockscreenLayout(ctx: LayoutContext): LockscreenLayoutState {
    const { world, t, activeDeviceId, config } = ctx;
    const lockConfig = config!.lockscreen!;

    const device = world.devices[activeDeviceId];
    const notifications = device?.notifications || [];

    const notificationLayouts: NotificationLayout[] = [];
    let currentY = lockConfig.topPadding;

    // Layout notifications
    // Show only the last N notifications
    const visibleNotifications = notifications.slice(-lockConfig.stackMaxNotifications);

    for (const notification of visibleNotifications) {
        // Calculate height
        // Heuristic: base height + text length
        const textLength = (notification.title?.length || 0) + (notification.body?.length || 0);
        const lines = Math.ceil(Math.max(1, textLength) / lockConfig.charsPerLine);
        const height = lockConfig.baseNotificationHeight + (lines * lockConfig.lineHeight);

        // Animation: Slide in
        // Assuming we have an 'at' time for notifications, but the type might not have it.
        // If not, we just show them.
        // Let's assume we want them to appear instantly for now.

        notificationLayouts.push({
            id: notification.id,
            y: currentY,
            height,
            opacity: 1,
            translateY: 0
        });

        currentY += height + lockConfig.notificationGap;
    }

    return {
        kind: "LOCKSCREEN",
        notificationLayouts,
        meta: {}
    };
}
