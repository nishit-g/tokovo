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
  ["123", "🌐", "space", "return"],
];

const NUMBERS_ROWS = [
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
  ["-", "/", ":", ";", "(", ")", "$", "&", "@", '"'],
  ["#+=", ".", ",", "?", "!", "'", "⌫"],
  ["ABC", "🌐", "space", "return"],
];

// =============================================================================
// TYPES
// =============================================================================

interface IOSKeyboardProps {
  keyboard: KeyboardState;
  variant?: "light" | "dark";
  t: number;
}

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
  width = 96,
  isSpecial = false,
  variant,
}) => {
  const frame = useCurrentFrame();

  // Colors based on variant
  const colors =
    variant === "light"
      ? {
          keyBg: isSpecial ? "#AEB3BC" : "#FFFFFF",
          keyText: "#000000",
          popupBg: "#FFFFFF",
          shadow: "rgba(0,0,0,0.3)",
        }
      : {
          keyBg: isSpecial ? "#3D3D41" : "#5A5A5E",
          keyText: "#FFFFFF",
          popupBg: "#5A5A5E",
          shadow: "rgba(0,0,0,0.5)",
        };

  // Key dimensions
  const height = 132;
  const borderRadius = 15;
  const fontSize = label === "space" ? 48 : label.length > 1 ? 42 : 66;

  // Pop-up animation (show enlarged key above when pressed)
  const popupScale = isPressed ? 1.3 : 0;
  const popupOpacity = isPressed ? 1 : 0;

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        margin: 6,
      }}
    >
      {/* Key pop-up (above key when pressed) */}
      {isPressed && (
        <div
          style={{
            position: "absolute",
            bottom: height + 12,
            left: "50%",
            transform: `translateX(-50%) scale(${popupScale})`,
            width: width * 1.4,
            height: height * 1.5,
            backgroundColor: colors.popupBg,
            borderRadius: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: fontSize * 1.3,
            fontWeight: 400,
            color: colors.keyText,
            boxShadow: `0 12px 30px ${colors.shadow}`,
            opacity: popupOpacity,
            zIndex: 100,
          }}
        >
          {label === "space" ? "" : label.toUpperCase()}
        </div>
      )}

      {/* Main key */}
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: isPressed ? colors.popupBg : colors.keyBg,
          borderRadius,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize,
          fontWeight: 400,
          color: colors.keyText,
          boxShadow: `0 3px 0 ${colors.shadow}`,
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro', sans-serif",
          textTransform: isSpecial ? "none" : "none",
          transform: isPressed ? "scale(0.95)" : "scale(1)",
        }}
      >
        {label === "space"
          ? ""
          : label === "⇧"
            ? "⇧"
            : label === "⌫"
              ? "⌫"
              : label === "return"
                ? "return"
                : label === "123"
                  ? "123"
                  : label === "ABC"
                    ? "ABC"
                    : label === "🌐"
                      ? "🌐"
                      : label}
      </div>
    </div>
  );
};

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
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        marginBottom: 12,
      }}
    >
      {keys.map((key, index) => {
        const isSpecial = [
          "⇧",
          "⌫",
          "123",
          "ABC",
          "🌐",
          "return",
          "#+=",
        ].includes(key);
        const isSpace = key === "space";
        const isPressed =
          currentKey?.toLowerCase() === key.toLowerCase() ||
          (key === "⌫" && currentKey === "⌫") ||
          (isSpace && currentKey === " ");

        // Key widths
        let width = 96;
        if (isSpace) width = 500;
        else if (key === "return") width = 240;
        else if (key === "⇧" || key === "⌫") width = 126;
        else if (key === "123" || key === "ABC") width = 126;

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

export const IOSKeyboard: React.FC<IOSKeyboardProps> = ({
  keyboard,
  variant = "light",
  t,
}) => {
  const frame = useCurrentFrame();

  // Slide animation
  const KEYBOARD_HEIGHT = 900; // At 3x scale
  const slideProgress = keyboard.visible
    ? interpolate(frame, [0, 10], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.cubic),
      })
    : 0;

  const translateY = interpolate(slideProgress, [0, 1], [KEYBOARD_HEIGHT, 0]);
  const opacity = interpolate(slideProgress, [0, 1], [0, 1]);

  // If not visible and no animation, don't render
  if (!keyboard.visible && slideProgress === 0) {
    return null;
  }

  // Select layout
  const rows = keyboard.layout === "numbers" ? NUMBERS_ROWS : QWERTY_ROWS;

  // Background colors
  const bgColor = variant === "light" ? "#D1D3D9" : "#2C2C2E";

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: KEYBOARD_HEIGHT,
        backgroundColor: bgColor,
        transform: `translateY(${translateY}px)`,
        opacity,
        paddingTop: 24,
        paddingBottom: 60,
        zIndex: 1000,
      }}
    >
      {/* Predictive text bar */}
      <div
        style={{
          height: 120,
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          borderBottom: `1px solid ${variant === "light" ? "#C4C4C6" : "#3D3D41"}`,
          marginBottom: 12,
          paddingLeft: 24,
          paddingRight: 24,
        }}
      >
        {["The", "I", "a"].map((word, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              textAlign: "center",
              fontSize: 48,
              color: variant === "light" ? "#000" : "#FFF",
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'SF Pro', sans-serif",
              borderRight:
                i < 2
                  ? `1px solid ${variant === "light" ? "#C4C4C6" : "#3D3D41"}`
                  : "none",
              paddingTop: 12,
              paddingBottom: 12,
            }}
          >
            {word}
          </div>
        ))}
      </div>

      {/* Keyboard rows */}
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
  );
};

export default IOSKeyboard;
