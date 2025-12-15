export const iOSTokens = {
    colors: {
        primary: "#007AFF",
        secondary: "#8E8E93",
        background: "#FFFFFF",
        headerBg: "rgba(246, 246, 246, 0.9)", // Translucent
        chatBg: "#ECE5DD",

        // Bubbles
        bubbleMyBg: "#DCF8C6", // Or E7FFDB (Whatsapp web)
        bubbleOtherBg: "#FFFFFF",
        bubbleText: "#000000",
        bubbleTime: "rgba(0,0,0,0.45)",

        separator: "rgba(0,0,0,0.1)"
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
