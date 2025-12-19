/**
 * Navigation Demo Episode
 * 
 * Verification episode to demonstrate:
 * 1. Inter-app navigation (os.openApp, goHome)
 * 2. Intra-app navigation (wa.switchTo, openChatList, goBack)
 * 3. Media messaging (sendImage, receiveVoice)
 * 4. Date separators
 * 
 * Run in video-runner to verify navigation works.
 */

// =============================================================================
// TYPE FIX: Using JSON episode format for maximum compatibility
// =============================================================================

export const navigationDemoEpisode = {
    id: "navigation-demo",
    title: "Navigation Demo",
    description: "Verifies inter-app and intra-app navigation",
    category: "showcase",
    format: "1080x1920",

    initialWorld: {
        devices: {
            phone: {
                id: "phone",
                profileId: "iphone16",
                isLocked: false,
                foregroundAppId: "app_whatsapp",
                notifications: [],
            },
        },
        conversations: {
            dm_john: {
                id: "dm_john",
                type: "dm",
                name: "John",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john",
                messages: [],
            },
            dm_alice: {
                id: "dm_alice",
                type: "dm",
                name: "Alice",
                avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alice",
                messages: [],
            },
        },
        appState: {
            app_whatsapp: {
                currentScreen: "chat",
                currentConversationId: "dm_john",
            },
        },
    },

    // Static events for testing - uses core event types
    events: [
        // 0s - Date separator
        {
            at: 0,
            kind: "APP",
            appId: "app_whatsapp",
            deviceId: "phone",
            type: "DATE_SEPARATOR",
            payload: { conversationId: "dm_john", text: "Today" },
        },
        // 1s - Receive message
        {
            at: 30,
            kind: "APP",
            appId: "app_whatsapp",
            deviceId: "phone",
            type: "MESSAGE_RECEIVED",
            conversationId: "dm_john",
            from: "John",
            text: "Hey! Check out this navigation demo!",
        },
        // 2s - Send reply
        {
            at: 60,
            kind: "APP",
            appId: "app_whatsapp",
            deviceId: "phone",
            type: "MESSAGE_SENT",
            conversationId: "dm_john",
            text: "Looking good! Let me switch to Alice.",
        },
        // 3s - Switch conversation (CONVERSATION_OPENED)
        {
            at: 90,
            kind: "APP",
            appId: "app_whatsapp",
            deviceId: "phone",
            type: "CONVERSATION_OPENED",
            payload: { conversationId: "dm_alice" },
        },
        // 4s - Message in Alice chat
        {
            at: 120,
            kind: "APP",
            appId: "app_whatsapp",
            deviceId: "phone",
            type: "MESSAGE_RECEIVED",
            conversationId: "dm_alice",
            from: "Alice",
            text: "Welcome to my chat!",
        },
        // 5s - Go back (to chat list)
        {
            at: 150,
            kind: "APP",
            appId: "app_whatsapp",
            deviceId: "phone",
            type: "NAVIGATE_SCREEN",
            payload: { screen: "chats" },
        },
        // 6s - Return to John's chat
        {
            at: 180,
            kind: "APP",
            appId: "app_whatsapp",
            deviceId: "phone",
            type: "CONVERSATION_OPENED",
            payload: { conversationId: "dm_john" },
        },
        // 7s - Final message
        {
            at: 210,
            kind: "APP",
            appId: "app_whatsapp",
            deviceId: "phone",
            type: "MESSAGE_RECEIVED",
            conversationId: "dm_john",
            from: "John",
            text: "Navigation works! 🎉",
        },
    ],
};

export default navigationDemoEpisode;
