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
        const appearAt = notification.at || 0;
        const timeSinceAppear = t - appearAt;

        let opacity = 1;
        let translateY = 0;

        if (timeSinceAppear < lockConfig.appearDuration) {
            const progress = Math.max(0, timeSinceAppear / lockConfig.appearDuration);
            // Cubic bezier approximation for ease-out
            const ease = 1 - Math.pow(1 - progress, 3);

            opacity = ease;
            // Slide down from -50px
            translateY = -50 * (1 - ease);
        }

        notificationLayouts.push({
            id: notification.id,
            y: currentY,
            height,
            opacity,
            translateY
        });

        currentY += height + lockConfig.notificationGap;
    }

    return {
        kind: "LOCKSCREEN",
        notificationLayouts,
        meta: {}
    };
}
