/**
 * iOS Keyboard Theme
 */

import type { KeyboardTheme } from "../../config/theme";

export const IOS_LIGHT_THEME: KeyboardTheme = {
    keyBg: "#FFFFFF",
    specialKeyBg: "#B3B6BE",
    keyText: "#000000",
    popupBg: "#FFFFFF",
    containerBg: "rgba(209, 211, 217, 0.96)",
    dividerColor: "rgba(0, 0, 0, 0.1)",
    accentColor: "#007AFF",
    keyShadow: "0 1px 0 rgba(0, 0, 0, 0.3)",
    pressedKeyBg: "#E5E5E5",
};

export const IOS_DARK_THEME: KeyboardTheme = {
    keyBg: "#6D6D72",
    specialKeyBg: "#3A3A3C",
    keyText: "#FFFFFF",
    popupBg: "#6D6D72",
    containerBg: "rgba(28, 28, 30, 0.94)",
    dividerColor: "rgba(255, 255, 255, 0.1)",
    accentColor: "#0A84FF",
    keyShadow: "0 1px 0 rgba(0, 0, 0, 0.45)",
    pressedKeyBg: "#4A4A4D",
};

export function getIOSTheme(variant: "light" | "dark"): KeyboardTheme {
    return variant === "light" ? IOS_LIGHT_THEME : IOS_DARK_THEME;
}

export function getThemeColors(variant: "light" | "dark", isSpecial: boolean, isPressed: boolean) {
    const theme = getIOSTheme(variant);

    return {
        keyBg: isPressed ? theme.pressedKeyBg : (isSpecial ? theme.specialKeyBg : theme.keyBg),
        keyText: theme.keyText,
        popupBg: theme.popupBg,
        shadow: theme.keyShadow,
    };
}
