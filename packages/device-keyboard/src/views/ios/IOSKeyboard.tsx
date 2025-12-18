/**
 * iOS Keyboard Components
 * 
 * Modular iOS keyboard implementation.
 * 
 * ARCHITECTURE:
 * - IOSKeyboard: Main composed component
 * - IOSKey: Individual key with press state
 * - IOSKeyRow: Row of keys
 * - IOSKeyPopup: Popup overlay on press
 * - IOSPredictionBar: Suggestion bar
 */

import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import type { KeyboardState } from "../../types/state";
import { QWERTY_ROWS, getKeyWidth } from "../../config/layouts/qwerty";
import { NUMBERS_ROWS } from "../../config/layouts/numbers";
import { KEYBOARD_ANIMATION } from "../../config/animation";
import { getThemeColors, getIOSTheme } from "./theme";
import { renderKeyIcon } from "./icons";
import { IOSPrediction } from "./prediction";
import { KeyboardStrategyRegistry } from "../strategy";

// =============================================================================
// TYPES
// =============================================================================

interface KeyboardProps {
    keyboard: KeyboardState;
    variant: "light" | "dark";
    t: number;
}

interface KeyProps {
    label: string;
    isPressed: boolean;
    width?: number;
    isSpecial?: boolean;
    variant: "light" | "dark";
}

interface KeyPopupProps {
    label: string;
    variant: "light" | "dark";
    keyWidth: number;
}

interface KeyRowProps {
    keys: string[];
    currentKey: string | null;
    variant: "light" | "dark";
    rowIndex: number;
}

interface PredictionBarProps {
    suggestions: string[];
    variant: "light" | "dark";
    highlightedIndex?: number | null;
}

// =============================================================================
// KEY COMPONENT
// =============================================================================

export const IOSKey: React.FC<KeyProps> = ({
    label,
    isPressed,
    width = 33,
    isSpecial = false,
    variant,
}) => {
    const colors = getThemeColors(variant, isSpecial, isPressed);
    const iconStyle = { width: "50%", height: "50%", display: "block" as const };

    // Check if we should show an icon
    const icon = renderKeyIcon(label, iconStyle);
    const fontSize = label === "space" ? 16 : label.length > 1 ? 16 : 25;

    // Key popup for non-special single chars
    const showPopup = isPressed && label.length === 1 && !isSpecial;

    return (
        <div style={{
            position: "relative",
            width,
            height: 42,
            margin: "0 3px",
            zIndex: showPopup ? 100 : 1,
        }}>
            {showPopup && (
                <IOSKeyPopup label={label} variant={variant} keyWidth={width} />
            )}

            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: colors.keyBg,
                borderRadius: 5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize,
                fontWeight: isSpecial ? 300 : 400,
                color: colors.keyText,
                boxShadow: colors.shadow,
                transition: "background-color 0.05s",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
            }}>
                {icon || (label === "space" ? "" : label)}
            </div>
        </div>
    );
};

// =============================================================================
// KEY POPUP
// =============================================================================

export const IOSKeyPopup: React.FC<KeyPopupProps> = ({ label, variant, keyWidth }) => {
    const theme = getIOSTheme(variant);
    const POPUP_WIDTH = keyWidth + 24;
    const POPUP_HEIGHT = 100;

    return (
        <div style={{
            position: "absolute",
            bottom: 0,
            left: "50%",
            width: POPUP_WIDTH,
            height: POPUP_HEIGHT,
            transform: "translateX(-50%)",
            pointerEvents: "none",
            zIndex: 200,
            filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.25))",
        }}>
            <svg
                width="100%"
                height="100%"
                viewBox="0 0 100 130"
                preserveAspectRatio="none"
                style={{ overflow: "visible" }}
            >
                <path
                    d="M 20 130 L 80 130 L 80 80 Q 80 60 100 60 L 100 15 Q 100 0 85 0 L 15 0 Q 0 0 0 15 L 0 60 Q 20 60 20 80 Z"
                    fill={theme.popupBg}
                />
            </svg>

            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: 60,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 36,
                color: theme.keyText,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
                fontWeight: 400,
                paddingBottom: 5,
            }}>
                {label.toUpperCase()}
            </div>
        </div>
    );
};

// =============================================================================
// KEY ROW
// =============================================================================

export const IOSKeyRow: React.FC<KeyRowProps> = ({ keys, currentKey, variant, rowIndex }) => {
    const SPECIAL_KEYS = ["⇧", "⌫", "123", "ABC", "🌐", "return", "#+="];

    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            marginBottom: 10,
        }}>
            {keys.map((key, index) => {
                const isSpecial = SPECIAL_KEYS.includes(key);
                const isSpace = key === "space";
                const isPressed =
                    currentKey?.toLowerCase() === key.toLowerCase() ||
                    (key === "⌫" && currentKey === "⌫") ||
                    (isSpace && currentKey === " ");

                return (
                    <IOSKey
                        key={`${key}-${index}`}
                        label={key}
                        isPressed={isPressed}
                        width={getKeyWidth(key)}
                        isSpecial={isSpecial}
                        variant={variant}
                    />
                );
            })}
        </div>
    );
};

// =============================================================================
// PREDICTION BAR
// =============================================================================

export const IOSPredictionBar: React.FC<PredictionBarProps> = ({
    suggestions,
    variant,
    highlightedIndex = 1,
}) => {
    const theme = getIOSTheme(variant);

    return (
        <div style={{
            height: 48,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "0 10px",
            marginBottom: 4,
        }}>
            {suggestions.map((word, i) => (
                <div key={i} style={{
                    flex: 1,
                    margin: "0 4px",
                    textAlign: "center",
                    fontSize: 17,
                    color: i === highlightedIndex ? theme.accentColor : theme.keyText,
                    fontWeight: 400,
                    letterSpacing: -0.3,
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                }}>
                    {i < 2 && (
                        <div style={{
                            position: "absolute",
                            right: -4,
                            height: "40%",
                            width: 1,
                            backgroundColor: theme.dividerColor,
                        }} />
                    )}
                    {i === highlightedIndex ? `"${word}"` : word}
                </div>
            ))}
        </div>
    );
};

// =============================================================================
// MAIN KEYBOARD COMPONENT
// =============================================================================

export const IOSKeyboard: React.FC<KeyboardProps> = ({
    keyboard,
    variant = "light",
}) => {
    const frame = useCurrentFrame();
    const theme = getIOSTheme(variant);

    // Animation
    const transitionStart = keyboard.visibilityChangedAt || 0;
    const targetValue = keyboard.visible ? 1 : 0;
    const startValue = keyboard.visible ? 0 : 1;

    const slideProgress = interpolate(
        frame,
        [transitionStart, transitionStart + KEYBOARD_ANIMATION.SLIDE_DURATION_FRAMES],
        [startValue, targetValue],
        {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(
                KEYBOARD_ANIMATION.EASING[0],
                KEYBOARD_ANIMATION.EASING[1],
                KEYBOARD_ANIMATION.EASING[2],
                KEYBOARD_ANIMATION.EASING[3]
            ),
        }
    );

    const translateY = interpolate(slideProgress, [0, 1], [100, 0]);
    const opacity = interpolate(slideProgress, [0, 0.2, 1], [0, 1, 1]);

    if (!keyboard.visible && slideProgress === 0) return null;

    // Get rows based on layout
    const rows = keyboard.layout === "numbers" ? NUMBERS_ROWS : QWERTY_ROWS;

    // Get suggestions
    const suggestions = IOSPrediction.getSuggestions(keyboard.inputText, 42);

    return (
        <div style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "auto",
            transform: `translateY(${translateY}%)`,
            opacity,
            zIndex: 1000,
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-end",
            overflow: "hidden",
        }}>
            <div style={{
                width: 393,
                backgroundColor: theme.containerBg,
                backdropFilter: "blur(50px)",
                WebkitBackdropFilter: "blur(50px)",
                paddingTop: 8,
                paddingBottom: 34,
                boxShadow: "0 -1px 0 rgba(0,0,0,0.1)",
                display: "flex",
                flexDirection: "column",
            }}>
                {/* Prediction Bar */}
                <IOSPredictionBar
                    suggestions={suggestions}
                    variant={variant}
                    highlightedIndex={keyboard.highlightedSuggestion ?? 1}
                />

                {/* Keyboard Rows */}
                <div style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-evenly",
                    padding: "0 6px",
                }}>
                    {rows.map((row, index) => (
                        <IOSKeyRow
                            key={index}
                            keys={row}
                            currentKey={keyboard.currentKey}
                            variant={variant}
                            rowIndex={index}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

// =============================================================================
// REGISTER STRATEGY
// =============================================================================

KeyboardStrategyRegistry.register("ios", {
    Keyboard: IOSKeyboard,
    Key: IOSKey,
    KeyPopup: IOSKeyPopup,
    PredictionBar: IOSPredictionBar,
    theme: getIOSTheme("light"),
    getSuggestions: IOSPrediction.getSuggestions,
});

export default IOSKeyboard;
