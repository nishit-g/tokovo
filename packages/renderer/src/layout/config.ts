import { LayoutConfig } from "./types";

export const defaultLayoutConfig: LayoutConfig = {
    cinematicMode: "NONE",
    chat: {
        bubbleWidth: 0.75,
        baseBubbleHeight: 75,
        charsPerLine: 28,
        lineHeight: 54,
        verticalGap: 24,
        topPadding: 120,
        bottomPadding: 100,
        messageAppearDuration: 15,
        messageAppearOffset: 15,
        scrollEasingDuration: 20,
        maxScrollCatchupSpeed: 50,
        lockToBottom: true
    },
    feed: {
        cardWidth: 1.0, // 100% width
        baseCardHeight: 600,
        verticalGap: 20,
        topPadding: 150, // Header + Stories
        bottomPadding: 150, // Bottom nav
        charsPerLine: 40,
        lineHeight: 30,
        scrollEasingDuration: 20,
        maxScrollCatchupSpeed: 50,
        startAtTop: true,
        autoScroll: false
    },
    story: {
        defaultStoryDuration: 150, // 5 seconds at 30fps
        progressBarHeight: 4,
        storyGap: 0,
        storyTransitionDuration: 15
    },
    lockscreen: {
        topPadding: 150,
        notificationGap: 10,
        notificationWidth: 0.9,
        baseNotificationHeight: 100,
        charsPerLine: 40,
        lineHeight: 30,
        stackMaxNotifications: 5,
        appearDuration: 15
    },
    transition: {
        defaultScale: 1.0,
        zoomedScale: 1.2,
        panDuration: 30,
        zoomDuration: 30
    }
};
