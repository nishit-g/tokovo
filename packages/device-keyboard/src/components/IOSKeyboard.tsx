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

interface IOSKeyboardProps extends KeyboardProps { }

interface KeyProps {
    label: string;
    isPressed: boolean;
    width?: number;
    isSpecial?: boolean;
    variant: "light" | "dark";
}

// =============================================================================
// KEY COMPONENT
// =============================================================================

const Key: React.FC<KeyProps> = ({
    label,
    isPressed,
    width = 10, // Flex weight now
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

    // PURE RELATIVE SIZING - No pixel caps to ensure 4K/Scaling support
    const fontSize = label === "space" ? "4.5cqw" : label.length > 1 ? "4.5cqw" : "5.5cqw";
    const fontWeight = label === "shift" || label === "delete" ? 300 : 400;

    const bg = isPressed ? (isSpecial ? "#EAECF0" : "#E5E5E5") : colors.keyBg;

    // Pop-ups enabled!
    const showPopup = isPressed && label.length === 1 && !isSpecial;

    return (
        <div style={{
            position: "relative",
            flex: width, // FLEX BASED WIDTH
            margin: "0.8%", // Tighten Gap slightly
            height: "100%",
            zIndex: showPopup ? 100 : 1, // Bring to front if popping up
        }}>
            {/* Pop-up */}
            {showPopup && (
                <KeyPopup label={label} variant={variant} colors={colors} />
            )}

            {/* Key Body */}
            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: bg,
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize,
                fontWeight,
                color: colors.keyText,
                boxShadow: colors.shadow,
                transition: "background-color 0.05s", // Fast active state
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
    colors: any
}> = ({ label, variant, colors }) => {
    // The "paddle" shape is iconic to iOS. 
    // It is wider at the top, and narrows down to the key width at the bottom.
    // We render this in a container that overflows the key cleanly.

    // SVG Coordinate System:
    // 0,0 is top-left of the POPUP bubble.
    // 100,200 is bottom-center of the stem.
    // We just map 0-100 coordinates and stretch via viewBox.

    return (
        <div style={{
            position: "absolute",
            bottom: 0,
            left: "50%",
            width: "160%", // 1.6x key width
            transform: "translateX(-50%)",
            height: "220%", // 2.2x key height
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
                {/* 
                  Path:
                  Start left-bottom stem (20, 130) -> up to neck (20, 70) -> out to bubble left (0, 60) -> up to top (0, 10)...
                  This rough path approximates the iOS shape.
                */}
                <path
                    d="
                    M 20 130 
                    L 80 130 
                    L 80 80 
                    Q 80 60 100 60 
                    L 100 15 
                    Q 100 0 85 0 
                    L 15 0 
                    Q 0 0 0 15 
                    L 0 60 
                    Q 20 60 20 80 
                    Z
                    "
                    fill={colors.popupBg}
                />
            </svg>

            {/* Character */}
            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "50%", // Top half is the bubble
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10cqw", // We can keep px cap for VERY large screens but relative is key
                // Actually user requested scalable. Let's use pure CQW for safety.
                // But typically pops are fixed relative to key.
                // Key width is approx 10% of screen. 1.6x key = 16% screen.
                // Font should be BIG.
                color: colors.keyText,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
                fontWeight: 400,
                paddingBottom: "5%"
            }}>
                {label.toUpperCase()}
            </div>
        </div>
    );
};

// Helper for Icons
const renderLabel = (label: string, variant: string) => {
    // SF Symbols approximation
    if (label === "space") return "";
    if (label === "⇧") return <ArrowUpIcon />; // Arrow Up
    if (label === "⌫") return <DeleteIcon />; // Backspace X
    if (label === "return") return "return";
    if (label === "123") return "123";
    if (label === "ABC") return "ABC";
    if (label === "🌐") return <GlobeIcon />;
    return label;
}

const ArrowUpIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4L4 16H8V20H16V16H20L12 4Z" /></svg>
); // Placeholder

const DeleteIcon = () => (
    <svg width="22" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2H10L2 12L10 22H22V2Z" /><line x1="12" y1="8" x2="18" y2="16" /><line x1="12" y1="16" x2="18" y2="8" /></svg>
); // Placeholder

const GlobeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
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
            height: "22%", // Distribute 4 rows + gaps
            marginBottom: "1%"
        }}>
            {keys.map((key, index) => {
                const isSpecial = ["⇧", "⌫", "123", "ABC", "🌐", "return", "#+="].includes(key);
                const isSpace = key === "space";
                const isPressed = currentKey?.toLowerCase() === key.toLowerCase() ||
                    (key === "⌫" && currentKey === "⌫") ||
                    (isSpace && currentKey === " ");

                // Flex Weights
                // Normal key: 10
                // Side keys: 15
                // Space: 60
                let width = 10;
                if (isSpace) width = 55;
                if (key === "return" || key === "123" || key === "ABC" || key === "#+=") width = 15;
                if (key === "⇧" || key === "⌫") width = 14;

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

    const LOGICAL_WIDTH = 393;
    const LOGICAL_HEIGHT = 295; // height + home indicator

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

    const inputLen = keyboard.inputText.length;
    const suggestions = getSuggestions(inputLen, variant);

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
               This matches our Logical Design (393px).
               We scale this to fit the parent width.
            */}
            <div style={{
                width: "100%", // Contain
                backgroundColor: bgColor,
                backdropFilter,
                WebkitBackdropFilter: backdropFilter,
                paddingTop: "2%", // Relative padding
                paddingBottom: "6%", // Home indicator area
                boxShadow: "0 -1px 0 rgba(0,0,0,0.1)",
                display: "flex",
                flexDirection: "column",
                // We use a container query approach or just aspect ratio
                // To keep keys square-ish
                aspectRatio: `${LOGICAL_WIDTH}/${LOGICAL_HEIGHT}`
            }}>
                {/* Predictive Bar */}
                <div style={{
                    flex: "0 0 14%", // ~42px equivalent
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0 1%",
                    marginBottom: "1%",
                }}>
                    {suggestions.map((word, i) => (
                        <div key={i} style={{
                            flex: 1,
                            margin: "0 1%",
                            textAlign: "center",
                            fontSize: "min(4cqw, 18px)", // Responsive font
                            color: variant === "light" ? (i === 1 ? "#007AFF" : '"#111"') : (i === 1 ? "#0A84FF" : "#FFF"),
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
                            {i > 0 && (
                                <div style={{
                                    position: "absolute",
                                    left: -2,
                                    top: "25%",
                                    height: "50%",
                                    width: 1,
                                    backgroundColor: variant === "light" ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.15)"
                                }} />
                            )}
                            {i === 1 ? `"${word}"` : word}
                        </div>
                    ))}
                </div>

                {/* Keyboard Rows */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-evenly", padding: "0 1%" }}>
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

                {/* Emoji / Dictation Icons (Bottom Corners) */}
                <div style={{
                    position: "absolute",
                    bottom: "2%",
                    left: "6%",
                    fontSize: "6cqw",
                    opacity: 0.5
                }}>😊</div>
                <div style={{
                    position: "absolute",
                    bottom: "2%",
                    right: "6%",
                    fontSize: "5cqw",
                    opacity: 0.5
                }}>🎙️</div>
            </div>
        </div>
    );
};

// Mock Predictive Logic
function getSuggestions(seed: number, variant: "light" | "dark"): string[] {
    const common = ["the", "I", "a", "to", "and", "in", "it", "you", "of", "for"];
    const context = ["love", "peace", "truth", "soul", "mind", "life", "world"];

    // Deterministic pseudo-random based on input length
    const i1 = (seed * 3) % common.length;
    const i2 = (seed * 7 + 1) % context.length;
    const i3 = (seed * 2 + 5) % common.length;

    return [common[i1], context[i2], common[i3]];
}

export default IOSKeyboard;
// Strategy Registration
import { KeyboardRegistry } from "../core/registry";
KeyboardRegistry.register("ios", IOSKeyboard);
