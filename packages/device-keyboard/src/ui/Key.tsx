import React from "react";
import {
  keyboardTypography,
  keyboardSpacing,
  createKeyboardShadows,
  type KeyboardTheme,
  getKeyboardColors,
} from "./tokens";

export interface KeyProps {
  label: string;
  width?: number;
  isActive?: boolean;
  variant?: "default" | "special" | "space" | "return";
  scale?: number;
  theme?: KeyboardTheme;
}

export const Key: React.FC<KeyProps> = ({
  label,
  width = keyboardSpacing.key.defaultWidth,
  isActive = false,
  variant = "default",
  scale = 1,
  theme = "light",
}) => {
  const colors = getKeyboardColors(theme);
  const shadows = createKeyboardShadows(colors);
  const scaledHeight = keyboardSpacing.key.height * scale;
  const scaledWidth = width * scale;
  const borderRadius = keyboardSpacing.key.borderRadius * scale;

  const getBackgroundColor = () => {
    if (isActive) return colors.key.active;
    if (variant === "return") return colors.key.return;
    if (variant === "special") return colors.key.special;
    if (variant === "space") return colors.key.space;
    return colors.key.default;
  };

  const getBorder = () => {
    if (variant === "return") return "none";
    if (variant === "special")
      return `${0.5 * scale}px solid ${colors.key.specialBorder}`;
    return `${0.5 * scale}px solid ${colors.key.defaultBorder}`;
  };

  const getTextColor = () => {
    if (variant === "return") return colors.text.onReturn;
    return colors.text.primary;
  };

  const getFontSize = () => {
    if (label === "space")
      return keyboardTypography.key.special.fontSize * scale;
    if (variant === "special" || variant === "return")
      return keyboardTypography.key.special.fontSize * scale;
    if (label.length > 1)
      return keyboardTypography.key.multiChar.fontSize * scale;
    return keyboardTypography.key.letter.fontSize * scale;
  };

  const getFontWeight = () => {
    if (variant === "default") return keyboardTypography.key.letter.fontWeight;
    return keyboardTypography.key.special.fontWeight;
  };

  const displayLabel = label === "space" ? "space" : label;

  return (
    <div
      style={{
        position: "relative",
        width: scaledWidth,
        height: scaledHeight,
      }}
    >
      {isActive && variant === "default" && (
        <div
          style={{
            position: "absolute",
            bottom: scaledHeight + keyboardSpacing.popup.offset * scale,
            left: "50%",
            transform: "translateX(-50%)",
            width: scaledWidth * keyboardSpacing.popup.widthMultiplier,
            height: scaledHeight * keyboardSpacing.popup.heightMultiplier,
            background: "rgba(255, 255, 255, 0.98)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderRadius: keyboardSpacing.popup.borderRadius * scale,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: keyboardTypography.key.popup.fontSize * scale,
            fontWeight: keyboardTypography.key.popup.fontWeight,
            color: colors.text.primary,
            boxShadow: shadows.popup(scale),
            zIndex: 100,
            fontFamily: keyboardTypography.fontFamily,
            pointerEvents: "none",
            border: `${0.5 * scale}px solid rgba(255, 255, 255, 0.8)`,
          }}
        >
          {displayLabel}
        </div>
      )}

      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: getBackgroundColor(),
          border: getBorder(),
          borderRadius,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: isActive ? shadows.keyActive(scale) : shadows.key(scale),
          transform: isActive ? "scale(1.02)" : "scale(1)",
          transition: "all 0.08s ease-out",
          zIndex: isActive ? 10 : 1,
          position: "relative",
          backdropFilter: variant === "default" ? "blur(8px)" : "none",
          WebkitBackdropFilter: variant === "default" ? "blur(8px)" : "none",
        }}
      >
        <span
          style={{
            fontSize: getFontSize(),
            fontWeight: getFontWeight(),
            color: getTextColor(),
            fontFamily: keyboardTypography.fontFamily,
            userSelect: "none",
            letterSpacing:
              variant === "default"
                ? keyboardTypography.key.letter.letterSpacing * scale
                : 0,
            textShadow:
              variant === "return"
                ? `0 ${1 * scale}px ${2 * scale}px rgba(0, 0, 0, 0.15)`
                : "none",
          }}
        >
          {displayLabel}
        </span>
      </div>
    </div>
  );
};

export default Key;
