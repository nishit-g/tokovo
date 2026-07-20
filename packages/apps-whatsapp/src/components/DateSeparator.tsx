/**
 * DateSeparator Component
 *
 * Displays date headers in the conversation (Today, Yesterday, etc.)
 * Authentic WhatsApp iOS/Android style.
 */

import React from "react";
import { Platform } from "@tokovo/core";
import {
  useTheme,
  useWhatsAppLocale,
} from "../experience/ExperienceContext.js";

interface DateSeparatorProps {
  text?: string;
  platform?: Platform;
}

export const DateSeparator: React.FC<DateSeparatorProps> = ({ text, platform: _platform }) => {
  const theme = useTheme();
  const { t } = useWhatsAppLocale();
  const paddingY = Math.max(10, theme.spacing.sectionGap - 4);
  const pillPaddingX = Math.max(14, theme.spacing.messagePaddingHorizontal);
  const pillRadius = Math.max(12, theme.spacing.bubbleRadius - 6);
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: `${paddingY}px 0`,
      }}
    >
      <div
        style={{
          backgroundColor: theme.colors.datePillBg,
          padding: "6px",
          paddingLeft: pillPaddingX,
          paddingRight: pillPaddingX,
          borderRadius: pillRadius,
          border: `0.5px solid ${theme.colors.datePillBorder}`,
          boxShadow: theme.colors.systemMessageShadow,
        }}
      >
        <span
          style={{
            fontSize: theme.typography.systemMessageFontSize,
            fontWeight: 600,
            color: theme.colors.datePillText,
            fontFamily: theme.typography.fontFamily,
            letterSpacing: 0,
          }}
        >
          {text ?? t("status.today")}
        </span>
      </div>
    </div>
  );
};

export default DateSeparator;
