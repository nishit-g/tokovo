/**
 * IOSKeyboard - Realistic iOS keyboard component
 * (Revamped for iOS 17/18 Pixel Perfection & Visual Feedbacks)
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
    ["123", "space", "return"] // Removed Globe
];

const NUMBERS_ROWS = [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    ["-", "/", ":", ";", "(", ")", "$", "&", "@", '"'],
    ["#+=", ".", ",", "?", "!", "'", "⌫"],
    ["ABC", "space", "return"] // Removed Globe
];


// =============================================================================
// ICONS (SF Symbols High Fidelity - OUTLINE STYLE)
// =============================================================================

// Outline Shift Arrow
const ShiftIcon = ({ style }: { style?: React.CSSProperties }) => (
    <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 3L5 10H9V20H15V10H19L12 3Z" strokeLinejoin="round" />
    </svg>
);

// Outline Backspace "House with X"
const BackspaceIcon = ({ style, color }: { style?: React.CSSProperties, color: string }) => (
    <svg style={style} viewBox="0 0 44 32" fill="none">
        {/* The House Shape containing the X - STROKE ONLY */}
        <path
            d="M13.88 4.3C14.77 2 17.07 0.5 19.67 0.5H36.5C40.64 0.5 44 3.86 44 8V24C44 28.14 40.64 31.5 36.5 31.5H19.67C17.07 31.5 14.77 30 13.88 27.7L2.4 16L13.88 4.3Z"
            stroke={color}
            strokeWidth="2.5" // Slightly thicker stroke for visibility
            fill="none"
        />
        {/* The "X" Inside */}
        <path d="M24 10L32 22" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M32 10L24 22" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
);


// Detailed Microphone
const MicIcon = ({ style }: { style?: React.CSSProperties }) => (
    <svg style={style} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 14C13.6569 14 15 12.6569 15 11V5C15 3.34315 13.6569 2 12 2C10.3431 2 9 3.34315 9 5V11C9 12.6569 10.3431 14 12 14Z" />
        <path d="M19 10V11C19 14.3648 16.6366 17.1762 13.5 17.8578V20.5C13.5 20.7761 13.2761 21 13 21H11C10.7239 21 10.5 20.7761 10.5 20.5V17.8578C7.36339 17.1762 5 14.3648 5 11V10C5 9.72386 5.22386 9.5 5.5 9.5C5.77614 9.5 6 9.72386 6 10V11C6 14.3137 8.68629 17 12 17C15.3137 17 18 14.3137 18 11V10C18 9.72386 18.2239 9.5 18.5 9.5C18.7761 9.5 19 9.72386 19 10Z" />
    </svg>
);

// Emoji Face (Smiley)
const EmojiIcon = ({ style }: { style?: React.CSSProperties }) => (
    <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 15C8 15 9.5 17 12 17C14.5 17 16 15 16 15" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="9" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="15" cy="9" r="1.5" fill="currentColor" stroke="none" />
    </svg>
);

// =============================================================================
// HELPER: Derive currentKey from TypingSchedule at a given frame
// =============================================================================

interface TypingScheduleEntry {
    key: string;
    frame: number;
}

interface TypingSchedule {
    entries: TypingScheduleEntry[];
    text: string;
    startFrame: number;
    endFrame: number;
}

/**
 * Given a TypingSchedule and the current frame, determine which key is "active".
 * Key is active for ~3 frames after its scheduled frame.
 */
function deriveCurrentKeyFromSchedule(
    schedule: TypingSchedule | null | undefined,
    frame: number
): string | null {
    if (!schedule || !schedule.entries) return null;

    const KEY_PRESS_DURATION = 3; // Key is visually pressed for this many frames

    // Find the latest entry where frame >= entry.frame AND frame < entry.frame + DURATION
    for (let i = schedule.entries.length - 1; i >= 0; i--) {
        const entry = schedule.entries[i];
        if (frame >= entry.frame && frame < entry.frame + KEY_PRESS_DURATION) {
            return entry.key;
        }
    }

    return null;
}

// =============================================================================
// KEY COMPONENT
// =============================================================================

export const IOSKey: React.FC<KeyProps & { schedule?: any }> = ({
    label,
    isPressed, // This comes from simple state check (currentKey === label)
    width,
    isSpecial = false,
    variant,
}) => {

    const colors = getThemeColors(variant, isSpecial, isPressed);

    // TYPOGRAPHY UPDATES:
    let fontSize = 25;
    const fontWeight = 300; // LIGHTER

    if (label.length > 1) {
        fontSize = 16;
    }

    const displayLabel = label === "space" ? "space" : renderLabel(label, variant, colors.keyText);

    // Pop-up Logic
    const showPopup = label.length === 1 && !isSpecial;

    return (
        <div style={{
            position: "relative",
            width: width,
            flexGrow: label === "space" ? 1 : 0,
            height: 46,
            zIndex: isPressed ? 120 : 1, // Z-index jumps when pressed
        }}>
            {/* Paddle Pop-up with CSS Animation */}
            {showPopup && (
                <div style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    width: "100%",
                    pointerEvents: "none",
                    opacity: isPressed ? 1 : 0,
                    transform: isPressed ? "scale(1)" : "scale(0.5) translateY(20px)",
                    transformOrigin: "bottom center",
                    transition: isPressed
                        ? "none" // Instant In
                        : "opacity 0.1s ease-out, transform 0.1s ease-out", // Fast Fade Out
                    zIndex: 200,
                }}>
                    <IOSKeyPopup label={label} variant={variant} keyWidth={width || 32} />
                </div>
            )}

            {/* Key Body */}
            <div style={{
                width: "100%",
                height: "100%",
                backgroundColor: colors.keyBg,
                borderRadius: 5, // 5px is sharper than 8, fitting "plastic" better at this scale
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize,
                fontWeight,
                color: colors.keyText,
                boxShadow: colors.shadow,
                // Background color transition for tap effect
                transition: "background-color 0s", // Instant tap response
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro', sans-serif",
                cursor: "pointer",
                WebkitFontSmoothing: "antialiased",
            }}>
                {displayLabel}
            </div>
        </div>
    );
};

// =============================================================================
// KEY POPUP (The "Paddle")
// =============================================================================

export const IOSKeyPopup: React.FC<KeyPopupProps> = ({ label, variant, keyWidth }) => {
    const theme = getIOSTheme(variant);
    const popupColors = { popupBg: theme.popupBg, keyText: theme.keyText };

    // Paddle Dimensions
    const POPUP_WIDTH = keyWidth + 32; // Expanded width
    const POPUP_HEIGHT = 108;

    // Proper centering offset
    const leftOffset = (keyWidth - POPUP_WIDTH) / 2;

    return (
        <div style={{
            position: "absolute",
            bottom: 46, // Starts right at top of key
            left: leftOffset,
            width: POPUP_WIDTH,
            height: POPUP_HEIGHT,
            pointerEvents: "none",
            zIndex: 200,
            transformOrigin: "bottom center",
            filter: "drop-shadow(0px 1px 4px rgba(0,0,0,0.35))" // Stronger popup shadow
        }}>
            {/* Paddle Shape SVG */}
            <svg
                width="100%"
                height="100%"
                viewBox="0 0 100 160"
                preserveAspectRatio="none"
                style={{ overflow: "visible" }}
            >
                <path
                    d="M 15 160
                       L 85 160
                       C 95 160 95 145 85 135
                       L 85 100
                       C 85 80 100 80 100 60
                       L 100 15
                       C 100 0 85 0 85 0
                       L 15 0
                       C 0 0 0 15 0 15
                       L 0 60
                       C 0 80 15 80 15 100
                       L 15 135
                       C 5 145 5 160 15 160
                       Z"
                    fill={popupColors.popupBg}
                    fillRule="evenodd"
                />
            </svg>

            {/* Character Preview */}
            <div style={{
                position: "absolute",
                top: 8,
                left: 0,
                width: "100%",
                height: 70,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 40,
                color: popupColors.keyText,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
                fontWeight: 300, // Matching Lighter weight
            }}>
                {label}
            </div>
        </div>
    );
};

// Icon Renderer Helper
const renderLabel = (label: string, variant: string, color: string) => {
    // Specific icon sizes relative to key
    const shiftStyle = { width: 22, height: 20 };
    const deleteStyle = { width: 24, height: 20 };
    const globeStyle = { width: 20, height: 20 };

    if (label === "") return null; // Space (Handled by parent "space" logic now)
    if (label === "⇧") return <ShiftIcon style={shiftStyle} />;
    if (label === "⌫") return <BackspaceIcon style={deleteStyle} color={color} />; // Pass fill color
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

    // LAYOUT GEOMETRY
    const ROW_GAP = 6;
    let paddingX = 0;
    if (rowIndex === 1) paddingX = 18;
    if (rowIndex === 2) paddingX = 0;

    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            gap: ROW_GAP,
            paddingLeft: paddingX,
            paddingRight: paddingX,
            marginBottom: 12,
        }}>
            {keys.map((key, index) => {
                const isSpecial = ["⇧", "⌫", "123", "ABC", "🌐", "return", "#+="].includes(key);
                const isSpace = key === "space";

                // CORRECTED: Compare against the derived currentKey passed down from parent
                const isPressed = currentKey?.toLowerCase() === key.toLowerCase() ||
                    (key === "⌫" && currentKey === "⌫") ||
                    (isSpace && currentKey === " ");

                // KEY WIDTH LOGIC 
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
                const weight = isCenter ? 400 : 300; // Even lighter here too

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
    // DERIVE CURRENT KEY FROM TYPING SCHEDULE (THE FIX)
    // -------------------------------------------------------------------------
    // If a typingSchedule exists, derive the active key from the current frame.
    // Otherwise, fall back to the reducer-set `keyboard.currentKey`.
    const derivedCurrentKey = useMemo(() => {
        // Check if we have a schedule and we are within its time range
        if (keyboard.typingSchedule) {
            const schedule = keyboard.typingSchedule;
            if (frame >= schedule.startFrame && frame <= schedule.endFrame) {
                return deriveCurrentKeyFromSchedule(schedule, frame);
            }
        }
        // Fallback to legacy reducer-driven state
        return keyboard.currentKey;
    }, [frame, keyboard.typingSchedule, keyboard.currentKey]);

    // -------------------------------------------------------------------------
    // ANIMATION
    // -------------------------------------------------------------------------
    const ANIMATION_DURATION = 14;
    const transitionStart = keyboard.visibilityChangedAt || 0;
    const targetValue = keyboard.visible ? 1 : 0;
    const startValue = keyboard.visible ? 0 : 1;

    // Spring Curve
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
            overflow: "hidden"
        }}>
            {/* 393px Container */}
            <div style={{
                width: 393,
                backgroundColor: theme.containerBg,
                paddingTop: 8,
                paddingBottom: 34, // Home Indicator Area
                display: "flex",
                flexDirection: "column",
                position: "relative",
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
                }}>
                    {rows.map((row, index) => (
                        <IOSKeyRow
                            key={index}
                            keys={row}
                            currentKey={derivedCurrentKey} // USE DERIVED KEY
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
