/**
 * IOSKeyboard - Realistic iOS keyboard component
 * 
 * Features:
 * - Full QWERTY layout
 * - Key pop-up on press (3 frames)
 * - Slide up/down animation
 * - iOS light/dark themes
 */

import React from "react";
import { useCurrentFrame, interpolate, Easing } from "remotion";
import { KeyboardState, KeyboardLayout } from "@tokovo/core";

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
// TYPES
// =============================================================================

import { KeyboardProps } from "../core/registry";

interface KeyProps {
    label: string;
    isPressed: boolean;
    width?: number; // Sizing weight (roughly px)
    isSpecial?: boolean;
    variant: "light" | "dark";
    isIcon?: boolean;
}

// =============================================================================
// KEY COMPONENT
// =============================================================================

const Key: React.FC<KeyProps> = ({
    label,
    isPressed,
    width = 33, // Standard key width in px
    isSpecial = false,
    variant
}) => {
    // Colors
    const colors = variant === "light"
        ? {
            keyBg: isSpecial ? "#B3B6BE" : "#FFFFFF",
            keyText: "#000000",
            popupBg: "#FFFFFF",
            shadow: "0 1px 0 rgba(0,0,0,0.3)",
        }
        : {
            keyBg: isSpecial ? "#3A3A3C" : "#6D6D72",
            keyText: "#FFFFFF",
            popupBg: "#6D6D72",
            shadow: "0 1px 0 rgba(0,0,0,0.45)",
        };

    // ARCHITECTURE STANDARD: PIXEL VALUES
    // Designed for 393px width
    const fontSize = label === "space" ? 16 : label.length > 1 ? 16 : 25; // 25px Standard
    const fontWeight = label === "shift" || label === "delete" ? 300 : 400;

    const bg = isPressed ? (isSpecial ? "#EAECF0" : "#E5E5E5") : colors.keyBg;

    // Pop-ups enabled!
    const showPopup = isPressed && label.length === 1 && !isSpecial;

    return (
        <div style={{
            position: "relative",
            width: width, // PIXEL WIDTH
            height: 42,   // PIXEL HEIGHT
            margin: "0 3px", // PIXEL MARGIN (Side gaps)
            zIndex: showPopup ? 100 : 1,
        }}>
            {/* Pop-up */}
            {showPopup && (
                <KeyPopup label={label} variant={variant} colors={colors} keyWidth={width} />
            )}

            {/* Key Body */}
            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: bg,
                borderRadius: 5, // iOS Standard Radius
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize,
                fontWeight,
                color: colors.keyText,
                boxShadow: colors.shadow,
                transition: "background-color 0.05s",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro', sans-serif",
            }}>
                {renderLabel(label, variant)}
            </div>
        </div>
    );
};

// =============================================================================
// KEY POPUP (SVG Shape)
// =============================================================================

const KeyPopup: React.FC<{
    label: string,
    variant: "light" | "dark",
    colors: any,
    keyWidth: number
}> = ({ label, variant, colors, keyWidth }) => {
    // Popup metrics
    const POPUP_WIDTH = keyWidth + 24; // ~58px
    const POPUP_HEIGHT = 100; // Fixed tall height

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
            filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.25))"
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
                    fill={colors.popupBg}
                />
            </svg>

            {/* Character */}
            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: 60, // Top bubble height
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 36, // Large 36px char
                color: colors.keyText,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
                fontWeight: 400,
                paddingBottom: 5
            }}>
                {label.toUpperCase()}
            </div>
        </div>
    );
};

// Helper for Icons
const renderLabel = (label: string, variant: string) => {
    // SF Symbols approximation - returning SVGs that fill their container
    const iconStyle = { width: "50%", height: "50%", display: "block" };

    if (label === "space") return "";
    if (label === "⇧") return <ArrowUpIcon style={iconStyle} />;
    if (label === "⌫") return <DeleteIcon style={iconStyle} />;
    if (label === "return") return "return";
    if (label === "123") return "123";
    if (label === "ABC") return "ABC";
    if (label === "🌐") return <GlobeIcon style={{ width: "60%", height: "60%" }} />;
    return label;
}

const ArrowUpIcon = ({ style }: { style?: React.CSSProperties }) => (
    <svg style={style} viewBox="0 0 24 24" fill="currentColor"><path d="M12 4L4 16H8V20H16V16H20L12 4Z" /></svg>
);

const DeleteIcon = ({ style }: { style?: React.CSSProperties }) => (
    <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 2H10L2 12L10 22H22V2Z" vectorEffect="non-scaling-stroke" /><line x1="12" y1="8" x2="18" y2="16" vectorEffect="non-scaling-stroke" /><line x1="12" y1="16" x2="18" y2="8" vectorEffect="non-scaling-stroke" /></svg>
);

const GlobeIcon = ({ style }: { style?: React.CSSProperties }) => (
    <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" vectorEffect="non-scaling-stroke" /><line x1="2" y1="12" x2="22" y2="12" vectorEffect="non-scaling-stroke" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" vectorEffect="non-scaling-stroke" /></svg>
);

const EmojiIcon = ({ style }: { style?: React.CSSProperties }) => (
    <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" vectorEffect="non-scaling-stroke" /><path d="M8 14s1.5 2 4 2 4-2 4-2" vectorEffect="non-scaling-stroke" /><line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="2" vectorEffect="non-scaling-stroke" /><line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="2" vectorEffect="non-scaling-stroke" /></svg>
);

const MicIcon = ({ style }: { style?: React.CSSProperties }) => (
    <svg style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" vectorEffect="non-scaling-stroke" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" vectorEffect="non-scaling-stroke" /><line x1="12" y1="19" x2="12" y2="23" vectorEffect="non-scaling-stroke" /><line x1="8" y1="23" x2="16" y2="23" vectorEffect="non-scaling-stroke" /></svg>
);

// =============================================================================
// KEYBOARD ROW
// =============================================================================

const KeyboardRow: React.FC<{
    keys: string[];
    currentKey: string | null;
    variant: "light" | "dark";
    rowIndex: number;
}> = ({ keys, currentKey, variant, rowIndex }) => {
    return (
        <div style={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            marginBottom: 10, // 10px Gap
        }}>
            {keys.map((key, index) => {
                const isSpecial = ["⇧", "⌫", "123", "ABC", "🌐", "return", "#+="].includes(key);
                const isSpace = key === "space";
                const isPressed = currentKey?.toLowerCase() === key.toLowerCase() ||
                    (key === "⌫" && currentKey === "⌫") ||
                    (isSpace && currentKey === " ");

                // PIXEL WIDTHS (Based on 393 width)
                // Standard: ~31-33
                let width = 33; // Base (Matches ~10% minus gap)

                if (key === "space") width = 192; // 5x
                if (key === "return" || key === "123" || key === "ABC" || key === "#+=") width = 48; // 1.5x
                if (key === "⇧" || key === "⌫") width = 42;

                return (
                    <Key
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
// MAIN KEYBOARD COMPONENT
// =============================================================================

// =============================================================================
// MAIN KEYBOARD COMPONENT
// =============================================================================

export const IOSKeyboard: React.FC<KeyboardProps> = ({
    keyboard,
    variant = "light",
}) => {
    const frame = useCurrentFrame();

    // -------------------------------------------------------------------------
    // SCALING INFRASTRUCTURE
    // -------------------------------------------------------------------------
    // The keyboard is designed at 393 logical pixels (iPhone 14/15/16 Pro).
    // We want it to fill the rendered width (e.g. 1080px or 1179px).
    // Instead of hardcoding 1080, we use percentage width for the container,
    // and a transform: scale() on the inner content to match logical pixels.

    // HOWEVER, scaling inner content is tricky without knowing exact width.
    // simpler approach: CSS Zoom or just design keys in % or fluid units?
    // Keys need specific sizes. 

    // LET'S GO WITH FLUID WIDTH (100%) but keep aspect ratio constraints?
    // Actually, "perfect rectangle" complaint suggests it's not fitting.
    // Let's rely on standard scaling: We render at 393px logical, and scale up to 100% of parent.

    // Animation
    const ANIMATION_DURATION = 18;
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
            easing: Easing.bezier(0.19, 1, 0.22, 1),
        }
    );

    const translateY = interpolate(slideProgress, [0, 1], [100, 0]); // % based translate
    const opacity = interpolate(slideProgress, [0, 0.2, 1], [0, 1, 1]);

    if (!keyboard.visible && slideProgress === 0) return null;

    const rows = keyboard.layout === "numbers" ? NUMBERS_ROWS : QWERTY_ROWS;
    const bgColor = variant === "light" ? "rgba(209, 211, 217, 0.96)" : "rgba(28, 28, 30, 0.94)";
    const backdropFilter = "blur(50px)";

    // Derived State (View-Layer Prediction)
    const suggestions = IOSPrediction.getSuggestions(keyboard.inputText, 42);

    return (
        <div style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%", // FILL THE DEVICE FRAME
            height: "auto", // Let content dictate height
            transform: `translateY(${translateY}%)`,
            opacity,
            zIndex: 1000,
            display: "flex", // Centering wrapper
            justifyContent: "center",
            alignItems: "flex-end",
            overflow: "hidden" // Clip to device frame
        }}>
            {/* 
               Content Wrapper: 
               Designed at 393px. AppSurface handles the rest.
            */}
            <div style={{
                width: 393, // FIXED PIXEL WIDTH
                backgroundColor: bgColor,
                backdropFilter,
                WebkitBackdropFilter: backdropFilter,
                paddingTop: 8,
                paddingBottom: 34, // Home indicator area
                boxShadow: "0 -1px 0 rgba(0,0,0,0.1)",
                display: "flex",
                flexDirection: "column",
            }}>
                {/* Predictive Bar */}
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
                            fontSize: 17, // Standard iOS body
                            color: variant === "light" ? (i === 1 ? "#007AFF" : "#111") : (i === 1 ? "#0A84FF" : "#FFF"),
                            fontWeight: 400,
                            letterSpacing: -0.3,
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            position: "relative",
                            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro', sans-serif",
                        }}>
                            {/* Dividers */}
                            {i < 2 && (
                                <div style={{
                                    position: "absolute",
                                    right: -4,
                                    height: "40%",
                                    width: 1,
                                    backgroundColor: variant === "light" ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"
                                }} />
                            )}
                            {i === 1 ? `"${word}"` : word}
                        </div>
                    ))}
                </div>

                {/* Keyboard Rows */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-evenly", padding: "0 6px" }}>
                    {rows.map((row, index) => (
                        <KeyboardRow
                            key={index}
                            keys={row}
                            currentKey={keyboard.currentKey}
                            variant={variant}
                            rowIndex={index}
                        />
                    ))}
                </div>

                {/* Bottom Actions (Emoji / Mic) with SVGs */}
                <div style={{
                    position: "absolute",
                    bottom: 8,
                    left: 24,
                    width: 26,
                    height: 26,
                    opacity: 0.6,
                    color: variant === "light" ? "#444" : "#CCC"
                }}>
                    <EmojiIcon style={{ width: "100%", height: "100%" }} />
                </div>
                <div style={{
                    position: "absolute",
                    bottom: 8,
                    right: 24,
                    width: 22,
                    height: 22,
                    opacity: 0.6,
                    color: variant === "light" ? "#444" : "#CCC"
                }}>
                    <MicIcon style={{ width: "100%", height: "100%" }} />
                </div>
            </div>
        </div>
    );
};

// Use Real Prediction Logic
import { IOSPrediction } from "../implementations/ios/prediction";

export default IOSKeyboard;
// Strategy Registration
import { KeyboardRegistry } from "../core/registry";
KeyboardRegistry.register("ios", IOSKeyboard);
