import React from "react";
import { iOS_IMESSAGE_LIGHT, LAYOUT_CONSTANTS } from "../config";

interface InputBarProps {
  theme?: typeof iOS_IMESSAGE_LIGHT;
  draft?: string;
  safeAreaBottom?: number;
}

export const InputBar: React.FC<InputBarProps> = ({
  theme = iOS_IMESSAGE_LIGHT,
  draft = "",
  safeAreaBottom,
}) => {
  const { colors, typography } = theme;
  const bottomInset = safeAreaBottom ?? LAYOUT_CONSTANTS.SAFE_AREA_BOTTOM;

  return (
    <div
      style={{
        height: LAYOUT_CONSTANTS.INPUT_HEIGHT + bottomInset,
        backgroundColor: colors.input.background,
        borderTop: `1px solid ${colors.system.separator}`,
        padding: `${LAYOUT_CONSTANTS.INPUT_PADDING}px ${LAYOUT_CONSTANTS.INPUT_PADDING}px ${bottomInset}px`,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: colors.input.field,
          border: `1px solid ${colors.input.border}`,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 12,
            height: 2,
            backgroundColor: colors.header.icons,
            borderRadius: 2,
            position: "absolute",
          }}
        />
        <div
          style={{
            width: 2,
            height: 12,
            backgroundColor: colors.header.icons,
            borderRadius: 2,
            position: "absolute",
          }}
        />
      </div>
      <div
        style={{
          flex: 1,
          height: LAYOUT_CONSTANTS.INPUT_FIELD_HEIGHT,
          borderRadius: LAYOUT_CONSTANTS.INPUT_BORDER_RADIUS,
          backgroundColor: colors.input.field,
          border: `1px solid ${colors.input.border}`,
          padding: "0 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          color: colors.input.placeholder,
          fontFamily: typography.input.family,
          fontSize: typography.input.size,
        }}
      >
        <span>{draft || "iMessage"}</span>
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: 6,
            border: `1.5px solid ${colors.input.icons}`,
            position: "relative",
          }}
        >
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: colors.input.icons,
              position: "absolute",
              top: 3,
              left: 3,
            }}
          />
        </div>
      </div>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: colors.input.sendButton,
        }}
      />
    </div>
  );
};

export default InputBar;
