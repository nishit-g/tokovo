/**
 * Status Bar Theme Types
 * 
 * Production-grade theming for device status bar.
 * Supports presets ("light", "dark") or full customization.
 * 
 * @example
 * ```typescript
 * // Preset
 * const theme: StatusBarTheme = "dark";
 * 
 * // Custom
 * const theme: StatusBarTheme = {
 *     backgroundColor: "#25D366",
 *     iconColor: "#FFFFFF",
 *     timeColor: "#FFFFFF",
 * };
 * ```
 */

// =============================================================================
// PRESET TYPES
// =============================================================================

/**
 * Built-in status bar presets.
 */
export type StatusBarPreset = "light" | "dark" | "transparent";

// =============================================================================
// CUSTOM THEME
// =============================================================================

/**
 * Custom status bar theme with full color control.
 */
export interface StatusBarCustomTheme {
    /** Background color (e.g., "#25D366" for WhatsApp green) */
    backgroundColor?: string;
    /** Icon color for battery, wifi, signal (e.g., "#FFFFFF") */
    iconColor?: string;
    /** Time text color (defaults to iconColor if not set) */
    timeColor?: string;
    /** Optional blur effect for glassmorphism */
    blur?: boolean;
    /** Background opacity (0-1, for transparent effects) */
    opacity?: number;
}

// =============================================================================
// COMBINED TYPE
// =============================================================================

/**
 * Status bar theme - preset or custom.
 */
export type StatusBarTheme = StatusBarPreset | StatusBarCustomTheme;

// =============================================================================
// RESOLVED THEME
// =============================================================================

/**
 * Fully resolved theme with all colors specified.
 * This is what the StatusBar component receives after resolution.
 */
export interface ResolvedStatusBarTheme {
    backgroundColor: string;
    iconColor: string;
    timeColor: string;
    blur: boolean;
    opacity: number;
}

// =============================================================================
// PRESETS
// =============================================================================

/**
 * Built-in preset definitions.
 */
export const STATUS_BAR_PRESETS: Record<StatusBarPreset, ResolvedStatusBarTheme> = {
    light: {
        backgroundColor: "transparent",
        iconColor: "#000000",
        timeColor: "#000000",
        blur: false,
        opacity: 1,
    },
    dark: {
        backgroundColor: "transparent",
        iconColor: "#FFFFFF",
        timeColor: "#FFFFFF",
        blur: false,
        opacity: 1,
    },
    transparent: {
        backgroundColor: "transparent",
        iconColor: "#FFFFFF",
        timeColor: "#FFFFFF",
        blur: false,
        opacity: 1,
    },
};

// =============================================================================
// RESOLVER
// =============================================================================

/**
 * Resolve a StatusBarTheme to fully specified colors.
 */
export function resolveStatusBarTheme(theme: StatusBarTheme): ResolvedStatusBarTheme {
    if (typeof theme === "string") {
        return STATUS_BAR_PRESETS[theme] || STATUS_BAR_PRESETS.light;
    }

    // Custom theme - merge with light preset as base
    return {
        backgroundColor: theme.backgroundColor ?? "transparent",
        iconColor: theme.iconColor ?? "#000000",
        timeColor: theme.timeColor ?? theme.iconColor ?? "#000000",
        blur: theme.blur ?? false,
        opacity: theme.opacity ?? 1,
    };
}
