import { LayoutConfig } from "./types";

export const defaultLayoutConfig: LayoutConfig = {
  cinematicMode: "NONE",
  chat: {
    bubbleWidth: 0.78, // 78% max width for bubbles
    baseBubbleHeight: 120, // Base height for message bubble (increased)
    charsPerLine: 26, // Characters per line before wrap
    lineHeight: 66, // Line height for text (3x of 22px)
    verticalGap: 36, // Gap between messages (3x of 12px)
    topPadding: 48, // Padding from top (reduced)
    bottomPadding: 120, // Padding at bottom
    messageAppearDuration: 15, // Animation duration (frames)
    messageAppearOffset: 30, // Slide-in offset
    scrollEasingDuration: 20, // Scroll animation duration
    maxScrollCatchupSpeed: 50, // Max scroll speed
    lockToBottom: true, // Keep scrolled to bottom
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
    autoScroll: false,
  },
  story: {
    defaultStoryDuration: 150, // 5 seconds at 30fps
    progressBarHeight: 4,
    storyGap: 0,
    storyTransitionDuration: 15,
  },
  lockscreen: {
    topPadding: 150,
    notificationGap: 10,
    notificationWidth: 0.9,
    baseNotificationHeight: 100,
    charsPerLine: 40,
    lineHeight: 30,
    stackMaxNotifications: 5,
    appearDuration: 15,
  },
  transition: {
    defaultScale: 1.0,
    zoomedScale: 1.2,
    panDuration: 30,
    zoomDuration: 30,
    notifications: {
      appearDuration: 15,
      dismissDuration: 10,
    },
  },
};
