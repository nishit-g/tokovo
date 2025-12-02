import { LayoutConfig } from "./types";

export const defaultLayoutConfig: LayoutConfig = {
    cinematicMode: "NONE",
    chat: {
        bubbleWidth: 0.75, // 75% of screen width
        baseBubbleHeight: 60,
        charsPerLine: 30,
        lineHeight: 40,
        verticalGap: 15,
        topPadding: 120, // Space for header
        bottomPadding: 100, // Space for input
        messageAppearDuration: 15, // frames
        messageAppearOffset: 10, // px
        scrollEasingDuration: 20, // frames
        maxScrollCatchupSpeed: 50, // px/frame
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
