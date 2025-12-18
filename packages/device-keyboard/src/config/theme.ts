/**
 * Keyboard Theme Configuration
 * 
 * Color tokens for keyboard appearance.
 */

// =============================================================================
// THEME TOKENS
// =============================================================================

export interface KeyboardTheme {
    /** Standard key background */
    keyBg: string;
    /** Special key background (shift, backspace) */
    specialKeyBg: string;
    /** Key text color */
    keyText: string;
    /** Key popup background */
    popupBg: string;
    /** Keyboard container background */
    containerBg: string;
    /** Divider color */
    dividerColor: string;
    /** Accent color (highlighted suggestion) */
    accentColor: string;
    /** Key shadow */
    keyShadow: string;
    /** Pressed key background */
    pressedKeyBg: string;
}

// =============================================================================
// IOS THEMES
// =============================================================================

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

// =============================================================================
// HELPERS
// =============================================================================

export function getKeyboardTheme(
    platform: "ios" | "android",
    variant: "light" | "dark"
): KeyboardTheme {
    // TODO: Add Android themes
    if (platform === "ios") {
        return variant === "light" ? IOS_LIGHT_THEME : IOS_DARK_THEME;
    }
    return variant === "light" ? IOS_LIGHT_THEME : IOS_DARK_THEME;
}
