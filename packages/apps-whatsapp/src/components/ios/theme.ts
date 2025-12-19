export const iOSTokens = {
    colors: {
        primary: "var(--wa-color-primary)",
        secondary: "var(--wa-text-secondary)",
        background: "var(--wa-bg-primary)",
        headerBg: "var(--wa-bg-header)",
        chatBg: "var(--wa-bg-chat)",

        // Bubbles
        bubbleMyBg: "var(--wa-bubble-out-bg)",
        bubbleOtherBg: "var(--wa-bubble-in-bg)",
        bubbleText: "var(--wa-text-primary)",
        bubbleTime: "var(--wa-text-secondary)",

        separator: "var(--wa-separator)"
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
