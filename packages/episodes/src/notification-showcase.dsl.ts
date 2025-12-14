/**
 * Notification Showcase Episode
 * 
 * Demonstrates EVERY notification feature:
 * - HeadsUp notifications in Dynamic Island
 * - Different priority levels (passive, active, timeSensitive, critical)
 * - Rich content with preview images
 * - Action buttons
 * - Replyable notifications
 * - Notification updates (real-time changes)
 * - Tap to open app
 * - Swipe to dismiss
 * - Inline reply
 * - Notification grouping
 * - Clear all
 */

import {
    TimelineEvent,
    WorldState,
    notificationDsl,
    DEFAULT_BUS_CONFIG,
} from "@tokovo/core";

// =============================================================================
// INITIAL WORLD STATE
// =============================================================================

export const notificationShowcaseWorld: WorldState = {
    devices: {
        phone: {
            id: "phone",
            profileId: "iphone16",
            isLocked: false,
            foregroundAppId: undefined, // Home screen
            notifications: [],
            backgroundApps: [],
            notificationCenter: {
                items: [],
                headsUp: null,
                headsUpQueue: [],
                groups: [],
            },
        },
    },
    conversations: {},
    appState: {},
    camera: {
        baseView: "APP_VIEW",
        activeDeviceId: "phone",
        layout: { mode: "SINGLE", primaryDeviceId: "phone" },
        activeEffects: [],
        transform: {
            translateX: 0, translateY: 0, scale: 1, rotation: 0,
            originX: 0.5, originY: 0.5, shakeX: 0, shakeY: 0,
        },
        deviceTransforms: {},
    },
    audio: {
        activeSounds: {},
        buses: DEFAULT_BUS_CONFIG,
    },
};

// =============================================================================
// TIMELINE EVENTS
// =============================================================================

export const notificationShowcaseEvents: TimelineEvent[] = [
    // =========================================================================
    // ACT 1: BASIC NOTIFICATIONS (0-5s)
    // =========================================================================

    // Simple WhatsApp message (frame 0 = 0s)
    notificationDsl.show(0, "phone", {
        appId: "app_whatsapp",
        title: "Sarah 💬",
        body: "Hey! Are you coming tonight?",
        priority: "active",
        icon: "💬",
    }),

    // Auto-dismiss after ~3s, then Instagram (frame 90 = 3s)
    notificationDsl.show(90, "phone", {
        appId: "app_instagram",
        title: "mike_photos",
        body: "Liked your photo ❤️",
        priority: "active",
        icon: "📸",
        threadId: "ig_likes",
    }),

    // =========================================================================
    // ACT 2: TIME SENSITIVE NOTIFICATION (5-8s)
    // =========================================================================

    // Time sensitive notification (frame 150 = 5s)
    notificationDsl.show(150, "phone", {
        appId: "app_uber",
        title: "🚗 Your Uber is arriving!",
        body: "John is 2 min away in Toyota Prius",
        priority: "timeSensitive",
        icon: "🚗",
        preview: {
            kind: "text",
            value: "License: ABC 1234",
        },
    }),

    // =========================================================================
    // ACT 3: RICH NOTIFICATION WITH ACTIONS (8-12s)
    // =========================================================================

    // Rich notification with image preview and action buttons (frame 240 = 8s)
    notificationDsl.show(240, "phone", {
        appId: "app_instagram",
        title: "New post from @travel_vibes",
        body: "Just landed in Bali! 🌴✨",
        priority: "active",
        icon: "📸",
        preview: {
            kind: "image",
            value: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400",
            aspectRatio: 1.5,
        },
        actions: [
            { id: "like", label: "❤️ Like" },
            { id: "comment", label: "💬 Comment" },
        ],
        threadId: "ig_posts",
    }),

    // =========================================================================
    // ACT 4: REPLYABLE NOTIFICATION (12-16s)
    // =========================================================================

    // Replyable message notification (frame 360 = 12s)
    notificationDsl.show(360, "phone", {
        appId: "app_whatsapp",
        title: "Sarah 💬",
        body: "What time should I pick you up?",
        priority: "active",
        icon: "💬",
        replyable: true,
        actions: [
            { id: "reply", label: "Reply" },
            { id: "mark_read", label: "Mark as Read" },
        ],
        threadId: "sarah_chat",
    }),

    // User sends a quick reply (frame 420 = 14s)
    notificationDsl.reply(420, "phone", "notif_360_app_whatsapp", "7:30 works!"),

    // =========================================================================
    // ACT 5: NOTIFICATION UPDATE (16-20s)
    // =========================================================================

    // Initial notification (frame 480 = 16s)
    notificationDsl.show(480, "phone", {
        appId: "app_messages",
        title: "Group Chat: Team",
        body: "Alex: Check the new designs",
        priority: "active",
        icon: "💬",
        groupKey: "team_chat",
        threadId: "group_team",
    }),

    // Update notification with more messages (frame 540 = 18s)
    notificationDsl.update(540, "phone", "notif_480_app_messages", {
        body: "3 new messages",
        metadata: { messageCount: 3 },
    }),

    // =========================================================================
    // ACT 6: NOTIFICATION GROUPING (20-25s)
    // =========================================================================

    // Multiple notifications from same app (frame 600-690)
    notificationDsl.show(600, "phone", {
        appId: "app_email",
        title: "Newsletter",
        body: "Your weekly digest is here",
        priority: "passive",
        icon: "📧",
        groupKey: "emails",
    }),

    notificationDsl.show(630, "phone", {
        appId: "app_email",
        title: "Amazon",
        body: "Your order has shipped!",
        priority: "active",
        icon: "📧",
        groupKey: "emails",
    }),

    notificationDsl.show(660, "phone", {
        appId: "app_email",
        title: "GitHub",
        body: "New pull request in tokovo/core",
        priority: "active",
        icon: "📧",
        groupKey: "emails",
    }),

    notificationDsl.show(690, "phone", {
        appId: "app_email",
        title: "Slack",
        body: "[#general] New message from @john",
        priority: "active",
        icon: "📧",
        groupKey: "emails",
    }),

    // =========================================================================
    // ACT 7: USER INTERACTIONS (25-30s)
    // =========================================================================

    // User taps notification to open app (frame 750 = 25s)
    notificationDsl.tap(750, "phone", "notif_690_app_email"),

    // User swipes to dismiss (frame 810 = 27s)
    notificationDsl.swipe(810, "phone", "notif_660_app_email", "right", "dismiss"),

    // =========================================================================
    // ACT 8: CRITICAL NOTIFICATION (30-33s)
    // =========================================================================

    // Critical notification (doesn't auto-dismiss) (frame 900 = 30s)
    notificationDsl.show(900, "phone", {
        appId: "app_calendar",
        title: "⚠️ Meeting in 5 minutes!",
        body: "Team standup - Join Zoom meeting",
        priority: "critical",
        icon: "📅",
        actions: [
            { id: "join", label: "Join Now" },
            { id: "snooze", label: "Snooze 5m" },
        ],
    }),

    // =========================================================================
    // ACT 9: CLEAR ALL (33-36s)
    // =========================================================================

    // Clear all notifications (frame 990 = 33s)
    notificationDsl.clearAll(990, "phone"),

    // =========================================================================
    // ACT 10: SILENT NOTIFICATION (36s+)
    // =========================================================================

    // Silent notification (goes directly to shade, no headsUp) (frame 1080 = 36s)
    notificationDsl.show(1080, "phone", {
        appId: "app_weather",
        title: "Weather Update",
        body: "Rain expected tomorrow at 3pm",
        mode: "silent",
        priority: "passive",
        icon: "🌧️",
    }),

    // Final notification to show we're done (frame 1140 = 38s)
    notificationDsl.show(1140, "phone", {
        appId: "app_system",
        title: "✅ Notification Demo Complete",
        body: "All features demonstrated!",
        priority: "timeSensitive",
        icon: "🎉",
    }),
];

// =============================================================================
// EPISODE EXPORT
// =============================================================================

export const notificationShowcaseEpisode = {
    id: "notification-showcase",
    name: "Notification Feature Showcase",
    description: "Demonstrates all notification features: headsUp, priority levels, rich content, actions, replies, updates, grouping, interactions",
    fps: 30,
    durationInFrames: 1200,  // 40 seconds
    initialWorld: notificationShowcaseWorld,
    events: notificationShowcaseEvents,
};

export default notificationShowcaseEpisode;
