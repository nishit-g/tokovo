/**
 * iOS Keyboard Theme
 *
 * Precise iOS 17/18 Color Palette
 */

import type { KeyboardTheme } from "../../config/theme";

export const IOS_LIGHT_THEME: KeyboardTheme = {
    keyBg: "#FCFCFC", // Slightly off-white for plastic feel
    specialKeyBg: "#B6BCC6", // Soft gray
    keyText: "#000000",
    popupBg: "#FCFCFC",
    containerBg: "#D1D3D9", // No border, just the slab color
    dividerColor: "rgba(0, 0, 0, 0.1)", // Very subtle
    accentColor: "#007AFF",
    keyShadow: "0 1px 1px rgba(0,0,0,0.3)", // Soft lift, not hard drop
    pressedKeyBg: "#B6BCC6", // Matches special key on press
};

export const IOS_DARK_THEME: KeyboardTheme = {
    keyBg: "#6D6D72",
    specialKeyBg: "#3A3A3C",
    keyText: "#FFFFFF",
    popupBg: "#6D6D72",
    containerBg: "#1C1C1E",
    dividerColor: "rgba(255, 255, 255, 0.1)",
    accentColor: "#0A84FF",
    keyShadow: "0 1px 1px rgba(0,0,0,0.4)",
    pressedKeyBg: "#535356",
};

export function getIOSTheme(variant: "light" | "dark"): KeyboardTheme {
    return variant === "light" ? IOS_LIGHT_THEME : IOS_DARK_THEME;
}

export function getThemeColors(variant: "light" | "dark", isSpecial: boolean, isPressed: boolean) {
    const theme = getIOSTheme(variant);

    let bg = theme.keyBg;
    if (isSpecial) {
        bg = theme.specialKeyBg;
        // Special keys behavior on press:
        // Light Mode: Gray -> White
        // Dark Mode: Dark Gray -> Light Gray (or lighter dark)
        if (isPressed) bg = variant === "light" ? "#FFFFFF" : "#535356";
    } else {
        // Normal Keys
        // Light Mode: White -> Gray
        // Dark Mode: Gray -> Lighter Gray
        if (isPressed) bg = theme.pressedKeyBg;
    }

    // Explicit override for "return" blue key if implemented later, but sticking to standard gray for now.

    return {
        keyBg: bg,
        keyText: theme.keyText,
        popupBg: theme.popupBg,
        shadow: isPressed ? "none" : theme.keyShadow, // Shadow disappears on press
    };
}
