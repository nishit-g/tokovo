/**
 * IOSKeyboard - Realistic iOS keyboard component
 * (Revamped for iOS 17/18 Pixel Perfection)
 */

import React, { useMemo } from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { KeyboardProps, KeyProps, KeyPopupProps, PredictionBarProps, KeyboardStrategyRegistry } from "../strategy";
import { getIOSTheme, getThemeColors } from "./theme";
import { IOSPrediction } from "./prediction";

// =============================================================================
// KEYBOARD LAYOUTS
// =============================================================================

const QWERTY_ROWS = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["⇧", "z", "x", "c", "v", "b", "n", "m", "⌫"],
    ["123", "space", "return"]
];

const NUMBERS_ROWS = [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    ["-", "/", ":", ";", "(", ")", "$", "&", "@", '"'],
    ["#+=", ".", ",", "?", "!", "'", "⌫"],
    ["ABC", "space", "return"]
];


// =============================================================================
// ICONS (SF Symbols - OUTLINE STYLE)
// =============================================================================

const ShiftIcon = ({ style }: { style?: React.CSSProperties }) => (
    <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3L5 10H9V20H15V10H19L12 3Z" strokeLinejoin="round" />
    </svg>
);

const BackspaceIcon = ({ style, color }: { style?: React.CSSProperties, color: string }) => (
    <svg style={style} viewBox="0 0 44 32" fill="none">
        <path
            d="M13.88 4.3C14.77 2 17.07 0.5 19.67 0.5H36.5C40.64 0.5 44 3.86 44 8V24C44 28.14 40.64 31.5 36.5 31.5H19.67C17.07 31.5 14.77 30 13.88 27.7L2.4 16L13.88 4.3Z"
            stroke={color}
            strokeWidth="2.5"
            fill="none"
        />
        <path d="M24 10L32 22" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M32 10L24 22" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const MicIcon = ({ style }: { style?: React.CSSProperties }) => (
    <svg style={style} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 14C13.6569 14 15 12.6569 15 11V5C15 3.34315 13.6569 2 12 2C10.3431 2 9 3.34315 9 5V11C9 12.6569 10.3431 14 12 14Z" />
        <path d="M19 10V11C19 14.3648 16.6366 17.1762 13.5 17.8578V20.5C13.5 20.7761 13.2761 21 13 21H11C10.7239 21 10.5 20.7761 10.5 20.5V17.8578C7.36339 17.1762 5 14.3648 5 11V10C5 9.72386 5.22386 9.5 5.5 9.5C5.77614 9.5 6 9.72386 6 10V11C6 14.3137 8.68629 17 12 17C15.3137 17 18 14.3137 18 11V10C18 9.72386 18.2239 9.5 18.5 9.5C18.7761 9.5 19 9.72386 19 10Z" />
    </svg>
);

const EmojiIcon = ({ style }: { style?: React.CSSProperties }) => (
    <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 15C8 15 9.5 17 12 17C14.5 17 16 15 16 15" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="9" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="15" cy="9" r="1.5" fill="currentColor" stroke="none" />
    </svg>
);

// =============================================================================
// TYPING SCHEDULE HELPERS
// =============================================================================

interface TypingScheduleEntry { key: string; frame: number; }
interface TypingSchedule { entries: TypingScheduleEntry[]; text: string; startFrame: number; endFrame: number; }

const KEY_PRESS_DURATION = 3;

function deriveCurrentKeyFromSchedule(schedule: TypingSchedule | null | undefined, frame: number): string | null {
    if (!schedule || !schedule.entries) return null;
    for (let i = schedule.entries.length - 1; i >= 0; i--) {
        const entry = schedule.entries[i];
        if (frame >= entry.frame && frame < entry.frame + KEY_PRESS_DURATION) {
            return entry.key;
        }
    }
    return null;
}

/**
 * Derive progressive text from schedule: Only show characters that have been typed so far.
 */
function deriveProgressiveText(schedule: TypingSchedule | null | undefined, frame: number): string {
    if (!schedule || !schedule.entries) return "";
    let text = "";
    for (const entry of schedule.entries) {
        if (frame >= entry.frame) {
            text += entry.key;
        } else {
            break; // Entries are in order
        }
    }
    return text;
}

// =============================================================================
// KEY POPUP - Simple iOS Style (No Complex SVG)
// =============================================================================

export const IOSKeyPopup: React.FC<KeyPopupProps> = ({ label, variant, keyWidth }) => {
    const theme = getIOSTheme(variant);

    // Simple rounded rect popup (matches modern iOS)
    const POPUP_WIDTH = 56;
    const POPUP_HEIGHT = 56;
    const leftOffset = (keyWidth - POPUP_WIDTH) / 2;

    return (
        <div style={{
            position: "absolute",
            bottom: 56, // Above the key
            left: leftOffset,
            width: POPUP_WIDTH,
            height: POPUP_HEIGHT,
            backgroundColor: theme.popupBg,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            fontWeight: 300,
            color: theme.keyText,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
            boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
            pointerEvents: "none",
        }}>
            {label}
        </div>
    );
};

// =============================================================================
// KEY COMPONENT
// =============================================================================

export const IOSKey: React.FC<KeyProps> = ({
    label,
    isPressed,
    width,
    isSpecial = false,
    variant,
}) => {
    const colors = getThemeColors(variant, isSpecial, isPressed);

    let fontSize = 25;
    const fontWeight = 300;

    if (label.length > 1) {
        fontSize = 16;
    }

    const displayLabel = label === "space" ? "space" : renderLabel(label, variant, colors.keyText);
    const showPopup = isPressed && label.length === 1 && !isSpecial;

    return (
        <div style={{
            position: "relative",
            width: width,
            flexGrow: label === "space" ? 1 : 0,
            height: 46,
            // CRITICAL: Remove overflow constraints to allow popup to be visible
        }}>
            {/* Pop-up - Renders above key when pressed */}
            {showPopup && (
                <IOSKeyPopup label={label} variant={variant} keyWidth={width || 32} />
            )}

            {/* Key Body */}
            <div style={{
                width: "100%",
                height: "100%",
                backgroundColor: colors.keyBg,
                borderRadius: 5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize,
                fontWeight,
                color: colors.keyText,
                boxShadow: colors.shadow,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro', sans-serif",
                cursor: "pointer",
                WebkitFontSmoothing: "antialiased",
            }}>
                {displayLabel}
            </div>
        </div>
    );
};

// Icon Renderer Helper
const renderLabel = (label: string, _variant: string, color: string) => {
    const shiftStyle = { width: 22, height: 20 };
    const deleteStyle = { width: 24, height: 20 };

    if (label === "") return null;
    if (label === "⇧") return <ShiftIcon style={shiftStyle} />;
    if (label === "⌫") return <BackspaceIcon style={deleteStyle} color={color} />;
    if (label === "return") return "return";
    if (label === "123") return "123";
    if (label === "ABC") return "ABC";

    return label;
}

// =============================================================================
// KEYBOARD ROW
// =============================================================================

export const IOSKeyRow: React.FC<{
    keys: string[];
    currentKey: string | null;
    variant: "light" | "dark";
    rowIndex: number;
}> = ({ keys, currentKey, variant, rowIndex }) => {

    const ROW_GAP = 6;
    let paddingX = 0;
    if (rowIndex === 1) paddingX = 18;

    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            gap: ROW_GAP,
            paddingLeft: paddingX,
            paddingRight: paddingX,
            marginBottom: 12,
            // CRITICAL: Allow overflow for popups
            overflow: "visible",
        }}>
            {keys.map((key, index) => {
                const isSpecial = ["⇧", "⌫", "123", "ABC", "🌐", "return", "#+="].includes(key);
                const isSpace = key === "space";

                const isPressed = currentKey?.toLowerCase() === key.toLowerCase() ||
                    (key === "⌫" && currentKey === "⌫") ||
                    (isSpace && currentKey === " ");

                let width = 32;
                if (key === "space") width = 182;
                if (key === "return" || key === "123" || key === "ABC" || key === "#+=") width = 88;
                if (key === "⇧" || key === "⌫") width = 46;

                return (
                    <IOSKey
                        key={`${key}-${index}`}
                        label={key}
                        isPressed={isPressed}
                        width={width}
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
            justifyContent: "center",
            alignItems: "center",
            padding: "0 12px",
            marginBottom: 8,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
        }}>
            {suggestions.map((word: string, i: number) => {
                const isCenter = i === 1;
                const weight = isCenter ? 400 : 300;
                const displayText = (isCenter) ? `"${word}"` : word;
                const color = theme.keyText;

                return (
                    <div key={i} style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                        height: "100%",
                    }}>
                        <span style={{
                            fontSize: 17,
                            fontWeight: weight,
                            color: color,
                            letterSpacing: -0.2,
                            opacity: isCenter ? 1 : 0.8
                        }}>
                            {displayText}
                        </span>

                        {i < 2 && (
                            <div style={{
                                position: "absolute",
                                right: 0,
                                width: 1,
                                height: 24,
                                backgroundColor: theme.dividerColor,
                                opacity: 0.5,
                            }} />
                        )}
                    </div>
                );
            })}
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

    // -------------------------------------------------------------------------
    // DERIVE STATE FROM TYPING SCHEDULE
    // -------------------------------------------------------------------------
    const derivedCurrentKey = useMemo(() => {
        if (keyboard.typingSchedule) {
            const schedule = keyboard.typingSchedule;
            if (frame >= schedule.startFrame && frame <= schedule.endFrame + KEY_PRESS_DURATION) {
                return deriveCurrentKeyFromSchedule(schedule, frame);
            }
        }
        return keyboard.currentKey;
    }, [frame, keyboard.typingSchedule, keyboard.currentKey]);

    // Progressive Text: Show characters as they are typed
    const progressiveText = useMemo(() => {
        if (keyboard.typingSchedule) {
            return deriveProgressiveText(keyboard.typingSchedule, frame);
        }
        return keyboard.inputText;
    }, [frame, keyboard.typingSchedule, keyboard.inputText]);

    // -------------------------------------------------------------------------
    // ANIMATION
    // -------------------------------------------------------------------------
    const ANIMATION_DURATION = 14;
    const transitionStart = keyboard.visibilityChangedAt || 0;
    const targetValue = keyboard.visible ? 1 : 0;
    const startValue = keyboard.visible ? 0 : 1;

    const slideProgress = interpolate(
        frame,
        [transitionStart, transitionStart + ANIMATION_DURATION],
        [startValue, targetValue],
        {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.3, 1.15, 0.2, 1),
        }
    );

    const translateY = interpolate(slideProgress, [0, 1], [100, 0]);
    const opacity = interpolate(slideProgress, [0, 0.2, 1], [0, 1, 1]);

    if (!keyboard.visible && slideProgress === 0) return null;

    const rows = keyboard.layout === "numbers" ? NUMBERS_ROWS : QWERTY_ROWS;
    const theme = getIOSTheme(variant);
    // Use progressive text for suggestions
    const suggestions = IOSPrediction.getSuggestions(progressiveText, 42);

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
            // CRITICAL: Allow popup overflow
            overflow: "visible",
        }}>
            {/* 393px Container */}
            <div style={{
                width: 393,
                backgroundColor: theme.containerBg,
                paddingTop: 8,
                paddingBottom: 34,
                display: "flex",
                flexDirection: "column",
                position: "relative",
                overflow: "visible", // CRITICAL for popups
            }}>

                {/* Prediction Bar */}
                <IOSPredictionBar
                    suggestions={suggestions}
                    variant={variant}
                    highlightedIndex={1}
                />

                {/* Keys Container */}
                <div style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    paddingLeft: 12,
                    paddingRight: 12,
                    paddingBottom: 4,
                    overflow: "visible", // CRITICAL for popups
                }}>
                    {rows.map((row, index) => (
                        <IOSKeyRow
                            key={index}
                            keys={row}
                            currentKey={derivedCurrentKey}
                            variant={variant}
                            rowIndex={index}
                        />
                    ))}
                </div>

                {/* Floating Bottom Action Icons */}
                <div style={{
                    position: "absolute",
                    bottom: 6,
                    left: 24,
                    width: 26,
                    height: 26,
                    color: theme.keyText,
                    opacity: 0.8
                }}>
                    <EmojiIcon style={{ width: "100%", height: "100%" }} />
                </div>

                <div style={{
                    position: "absolute",
                    bottom: 6,
                    right: 24,
                    width: 22,
                    height: 30,
                    color: theme.keyText,
                    opacity: 0.8
                }}>
                    <MicIcon style={{ width: "100%", height: "100%" }} />
                </div>

            </div>
        </div>
    );
};

export default IOSKeyboard;

// Strategy Registration
KeyboardStrategyRegistry.register("ios", {
    Keyboard: IOSKeyboard,
    Key: IOSKey,
    KeyPopup: IOSKeyPopup,
    PredictionBar: IOSPredictionBar,
    theme: getIOSTheme("light"),
    getSuggestions: IOSPrediction.getSuggestions,
});
