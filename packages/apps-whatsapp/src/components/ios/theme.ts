export const iOSTokens = {
    colors: {
        primary: "var(--app-wa-primary)", // #007AFF
        secondary: "var(--app-wa-secondary)", // #8E8E93
        background: "var(--app-wa-background)", // #FFFFFF
        headerBg: "var(--app-wa-header-bg)", // rgba(246, 246, 246, 0.9)
        chatBg: "var(--app-wa-chat-bg)", // #ECE5DD

        // Bubbles
        bubbleMyBg: "var(--app-wa-bubble-my-bg)", // #DCF8C6
        bubbleOtherBg: "var(--app-wa-bubble-other-bg)", // #FFFFFF
        bubbleText: "var(--app-wa-bubble-text)", // #000000
        bubbleTime: "var(--app-wa-bubble-time)", // rgba(0,0,0,0.45)

        separator: "var(--app-wa-separator)" // rgba(0,0,0,0.1)
    },
    // Logical Standard Typography
    typography: {
        body: { fontSize: 16, lineHeight: "21px" },
        caption: { fontSize: 11, lineHeight: "13px" },
        headerTitle: { fontSize: 17, fontWeight: "600" },
        headerSubtitle: { fontSize: 12 }
    }
};

export type Theme = typeof iOSTokens;

export function getTheme(platform: "ios" | "android"): Theme {
    return iOSTokens; // Placeholder, easy to expand
}
