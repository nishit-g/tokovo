/**
 * Calendar Card Component - Calendar event invite
 * Uses iMessage design tokens for spacing/typography and iOS_COLORS for colors
 */

import React from "react";
import { useIMessageTheme } from "../ui/ThemeContext.js";
import { iMessageSpacing, iMessageTypography } from "../config/tokens.js";
import { iOS_COLORS } from "../config/colors.js";
import type { CalendarAttachment } from "../types/index.js";

interface CalendarCardProps {
    event: CalendarAttachment;
    fromMe?: boolean;
}

export const CalendarCard: React.FC<CalendarCardProps> = ({ event, fromMe }) => {
    const theme = useIMessageTheme();
    const { colors } = theme;

    const formatDate = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                hour: event.isAllDay ? undefined : "numeric",
                minute: event.isAllDay ? undefined : "2-digit",
            });
        } catch {
            return dateString;
        }
    };

    // Color derivations based on sender
    const bgColor = fromMe ? colors.bubble.iMessage : colors.bubble.received;
    const headerBg = fromMe ? iOS_COLORS.grayLight : "#FF3B30"; // iOS red for calendar
    const separatorColor = fromMe ? iOS_COLORS.grayLight : iOS_COLORS.separator;
    const textPrimary = fromMe ? iOS_COLORS.textWhite : colors.bubble.otherText;
    const textSecondary = fromMe ? iOS_COLORS.grayLight : colors.bubble.timestamp;
    const actionColor = fromMe ? iOS_COLORS.textWhite : iOS_COLORS.blue;

    return (
        <div
            style={{
                borderRadius: iMessageSpacing.bubbleRadius,
                overflow: "hidden",
                backgroundColor: bgColor,
                minWidth: 240,
            }}
        >
            {/* Red calendar header */}
            <div
                style={{
                    backgroundColor: headerBg,
                    padding: `${iMessageSpacing.inputPaddingV}px ${iMessageSpacing.bubblePaddingH}px`,
                    fontFamily: iMessageTypography.fontFamily,
                    fontSize: iMessageTypography.timestamp.fontSize,
                    fontWeight: iMessageTypography.headerTitle.fontWeight,
                    letterSpacing: iMessageTypography.timestamp.letterSpacing,
                    color: iOS_COLORS.textWhite,
                    textTransform: "uppercase",
                }}
            >
                📅 Calendar Invite
            </div>

            {/* Event content */}
            <div style={{ padding: iMessageSpacing.bubblePaddingH }}>
                {/* Title */}
                <div
                    style={{
                        fontFamily: iMessageTypography.fontFamily,
                        fontSize: iMessageTypography.listTitle.fontSize,
                        fontWeight: iMessageTypography.listTitle.fontWeight,
                        lineHeight: `${iMessageTypography.listTitle.lineHeight}px`,
                        color: textPrimary,
                        marginBottom: iMessageSpacing.inputPaddingV,
                    }}
                >
                    {event.title}
                </div>

                {/* Date/time */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: iMessageSpacing.inputIconGap,
                        fontFamily: iMessageTypography.fontFamily,
                        fontSize: iMessageTypography.caption.fontSize,
                        lineHeight: `${iMessageTypography.caption.lineHeight}px`,
                        color: textSecondary,
                        marginBottom: iMessageSpacing.messageGapMinimal,
                    }}
                >
                    <span>🕐</span>
                    <span>{formatDate(event.startDate)}</span>
                    {event.isAllDay && (
                        <span style={{ fontSize: iMessageTypography.timestamp.fontSize, opacity: 0.7 }}>
                            (All Day)
                        </span>
                    )}
                </div>

                {/* Location */}
                {event.location && (
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: iMessageSpacing.inputIconGap,
                            fontFamily: iMessageTypography.fontFamily,
                            fontSize: iMessageTypography.caption.fontSize,
                            lineHeight: `${iMessageTypography.caption.lineHeight}px`,
                            color: textSecondary,
                        }}
                    >
                        <span>📍</span>
                        <span>{event.location}</span>
                    </div>
                )}
            </div>

            {/* Action button */}
            <div
                style={{
                    padding: `${iMessageSpacing.inputPaddingV}px ${iMessageSpacing.bubblePaddingH}px`,
                    borderTop: `0.5px solid ${separatorColor}`,
                    textAlign: "center",
                    fontFamily: iMessageTypography.fontFamily,
                    fontSize: iMessageTypography.message.fontSize,
                    fontWeight: iMessageTypography.listTitle.fontWeight,
                    color: actionColor,
                    cursor: "pointer",
                }}
            >
                Add to Calendar
            </div>
        </div>
    );
};

export default CalendarCard;
