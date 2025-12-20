/**
 * IOSKeyboard - Realistic iOS keyboard component
 * (Revamped for iOS 17/18 Pixel Perfection & Visual Feedbacks)
 */

import React from "react";
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
    ["123", "🌐", "space", "return"]
];

const NUMBERS_ROWS = [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    ["-", "/", ":", ";", "(", ")", "$", "&", "@", '"'],
    ["#+=", ".", ",", "?", "!", "'", "⌫"],
    ["ABC", "🌐", "space", "return"]
];


// =============================================================================
// ICONS (SF Symbols High Fidelity)
// =============================================================================

// Solid Shift Arrow (iOS 16/17 Style)
const ShiftIcon = ({ style }: { style?: React.CSSProperties }) => (
    <svg style={style} viewBox="0 0 24 24" fill="currentColor">
        <path d="M10.9393 3.93934C11.5251 3.35355 12.4749 3.35355 13.0607 3.93934L19.0607 9.93934C19.6464 10.5251 19.6464 11.4749 19.0607 12.0607C18.7794 12.3419 18.3978 12.5 18 12.5H15V19C15 19.5523 14.5523 20 14 20H10C9.44772 20 9 19.5523 9 19V12.5H6C5.60218 12.5 5.22064 12.3419 4.93934 12.0607C4.35355 11.4749 4.35355 10.5251 4.93934 9.93934L10.9393 3.93934Z" />
    </svg>
);

// Backspace "House with X" (iOS Native Shape)
const BackspaceIcon = ({ style, color }: { style?: React.CSSProperties, color: string }) => (
    <svg style={style} viewBox="0 0 44 32">
        {/* The House Shape containing the X */}
        <path d="M13.88 4.3C14.77 2 17.07 0.5 19.67 0.5H36.5C40.64 0.5 44 3.86 44 8V24C44 28.14 40.64 31.5 36.5 31.5H19.67C17.07 31.5 14.77 30 13.88 27.7L2.4 16L13.88 4.3Z" fill={color} />
        {/* The "X" Inside (White or Contrast) */}
        <path d="M24 10L32 22" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <path d="M32 10L24 22" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

// Wireframe Globe
const GlobeIcon = ({ style }: { style?: React.CSSProperties }) => (
    <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3C14.5 3 16.5 7.02944 16.5 12C16.5 16.9706 14.5 21 12 21" />
        <path d="M12 3C9.5 3 7.5 7.02944 7.5 12C7.5 16.9706 9.5 21 12 21" />
        <path d="M3.5 12H20.5" />
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
// KEY COMPONENT
// =============================================================================

export const IOSKey: React.FC<KeyProps> = ({
    label,
    isPressed,
    width, // Now controlled strictly by parent flex/basis
    isSpecial = false,
    variant
}) => {
    // Theme Colors
    const colors = getThemeColors(variant, isSpecial, isPressed);

    // TYPOGRAPHY (Regular Weight, Fixed Sizes)
    // Letters: 25px
    // Functionals: 16px
    let fontSize = 25;
    const fontWeight = 400; // STRICTLY REGULAR

    if (label.length > 1) {
        fontSize = 16;
    }

    const displayLabel = label === "space" ? "space" : renderLabel(label, variant, colors.keyText);

    // Pop-up Logic
    const showPopup = isPressed && label.length === 1 && !isSpecial;

    return (
        <div style={{
            position: "relative",
            width: width, // Handled by flex-basis or explicit width
            flexGrow: label === "space" ? 1 : 0, // Space fills
            height: 46, // Fixed Height
            zIndex: showPopup ? 120 : 1,
            // SHADOW & RADIUS updates
            borderRadius: 5, // Visual Request: "8-10px" feels too round for keys, let's use 6px and rely on rendering quality. 
            // Wait, request said specifically 8-10px. OK, let's go for 7.5px as good compromise.
            // borderRadius: 8 // User requested 8-10px.
        }}>
            {/* Paddle Pop-up */}
            {showPopup && (
                <IOSKeyPopup label={label} variant={variant} keyWidth={width || 32} />
            )}

            {/* Key Body */}
            <div style={{
                width: "100%",
                height: "100%",
                backgroundColor: colors.keyBg,
                borderRadius: 5, // Keeping standard iOS look, 8px is for large buttons
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize,
                fontWeight,
                color: colors.keyText,
                boxShadow: colors.shadow,
                transition: "background-color 0s",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro', sans-serif",
                cursor: "pointer",
                WebkitFontSmoothing: "antialiased", // Requested
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
                fontWeight: 400,
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
    if (label === "🌐") return <GlobeIcon style={globeStyle} />;

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
    // Row 1: QWERTY (10 keys) -> Standard padding
    // Row 2: ASDF (9 keys) -> Indented
    // Row 3: ZXCV (Shift/Back) -> More Indented ? No, Shift takes space.

    // Config
    const ROW_GAP = 6; // Horizontal Gap

    // Row Specific Padding/Inset logic
    // User requested "Row 2 has extra inset" and "Row 3 slightly more".
    // Row 1 (10 keys): Fits width.
    // Row 2 (9 keys): Needs to be centered, which flex does, but user wants specific *inset*.
    // PADDING LOGIC:
    let paddingX = 0;
    if (rowIndex === 1) paddingX = 18; // ~Half key indent
    if (rowIndex === 2) paddingX = 0; // Row 3 has big modifiers, so padding logic differs.

    return (
        <div style={{
            display: "flex",
            justifyContent: "center", // Flex centers naturally
            width: "100%",
            gap: ROW_GAP, // Consistent horizontal gap
            paddingLeft: paddingX,
            paddingRight: paddingX,
            marginBottom: 12, // Vertical Gap
        }}>
            {keys.map((key, index) => {
                const isSpecial = ["⇧", "⌫", "123", "ABC", "🌐", "return", "#+="].includes(key);
                const isSpace = key === "space";
                const isPressed = currentKey?.toLowerCase() === key.toLowerCase() ||
                    (key === "⌫" && currentKey === "⌫") ||
                    (isSpace && currentKey === " ");

                // KEY WIDTH LOGIC (Fixed Basis)
                // Base width for letters: ~32px (393 - margins - gaps) / 10
                // (393 - 24(outer) - 9*6) / 10 approx 31.5

                let width = 32;

                // Specific Widths
                if (key === "space") width = 186; // Space: widest
                if (key === "return" || key === "123" || key === "ABC" || key === "#+=") width = 44;

                // Shift/Back: 1.5x letter (~48px)
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
            height: 48, // More breathing room
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "0 12px", // Outer padding match
            marginBottom: 8,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
        }}>
            {suggestions.map((word: string, i: number) => {
                const isCenter = i === 1;
                // Regular/Medium weights per feedback (not Bold)
                const weight = isCenter ? 500 : 400;

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
                            opacity: isCenter ? 1 : 0.8 // Subtle focus
                        }}>
                            {displayText}
                        </span>

                        {/* Thin Divider on the right of Left and Center items */}
                        {i < 2 && (
                            <div style={{
                                position: "absolute",
                                right: 0,
                                width: 1,
                                height: 24, // Taller but subtle
                                backgroundColor: theme.dividerColor,
                                opacity: 0.5, // Reduced opacity
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
            easing: Easing.bezier(0.3, 1.15, 0.2, 1), // Slight bounce overshoot
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
                // No border, slab style
                paddingTop: 8,
                paddingBottom: 34, // Home Indicator Area
                display: "flex",
                flexDirection: "column",
                position: "relative", // For floating corner icons
                // No hard box shadow per user request (light gray slab)
                // boxShadow: "0 -0.5px 0 rgba(0,0,0,0.15)", 
            }}>

                {/* Prediction Bar */}
                <IOSPredictionBar
                    suggestions={suggestions}
                    variant={variant}
                    highlightedIndex={1}
                />

                {/* Keys Container with Outer Padding */}
                <div style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end", // Align bottom
                    paddingLeft: 12, // User requested 12-16px
                    paddingRight: 12,
                    paddingBottom: 4,
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
