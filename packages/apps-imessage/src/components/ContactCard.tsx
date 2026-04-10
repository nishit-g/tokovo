/**
 * Contact Card Component - Rich contact card with avatar and actions
 * Uses iMessage design tokens for spacing/typography and iOS_COLORS for colors
 */

import React from "react";
import { Img } from "remotion";
import { useIMessageTheme } from "../ui/ThemeContext.js";
import { iMessageSpacing, iMessageTypography } from "../config/tokens.js";
import { iOS_COLORS } from "../config/colors.js";
import type { ContactAttachment } from "../types/index.js";

interface ContactCardProps {
    contact: ContactAttachment;
    fromMe?: boolean;
}

export const ContactCard: React.FC<ContactCardProps> = ({ contact, fromMe }) => {
    const theme = useIMessageTheme();
    const { colors } = theme;

    const getInitials = (name: string): string => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    // Color derivations based on sender
    const bgColor = fromMe ? colors.bubble.iMessage : colors.bubble.received;
    const separatorColor = fromMe ? iOS_COLORS.grayLight : iOS_COLORS.separator;
    const textPrimary = fromMe ? iOS_COLORS.textWhite : colors.bubble.otherText;
    const textSecondary = fromMe ? iOS_COLORS.grayLight : colors.bubble.timestamp;
    const avatarBg = fromMe ? iOS_COLORS.grayLight : iOS_COLORS.grayUltraLight;
    const actionColor = fromMe ? iOS_COLORS.textWhite : iOS_COLORS.blue;

    return (
        <div
            style={{
                borderRadius: iMessageSpacing.bubbleRadius,
                overflow: "hidden",
                backgroundColor: bgColor,
                minWidth: 220,
            }}
        >
            {/* Header with avatar and name */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: iMessageSpacing.listAvatarGap,
                    padding: iMessageSpacing.bubblePaddingH,
                    borderBottom: `0.5px solid ${separatorColor}`,
                }}
            >
                {/* Avatar */}
                <div
                    style={{
                        width: iMessageSpacing.headerAvatarSize,
                        height: iMessageSpacing.headerAvatarSize,
                        borderRadius: "50%",
                        backgroundColor: avatarBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: iMessageTypography.fontFamily,
                        fontSize: iMessageTypography.headerTitle.fontSize,
                        fontWeight: iMessageTypography.headerTitle.fontWeight,
                        color: iOS_COLORS.blue,
                        flexShrink: 0,
                        overflow: "hidden",
                    }}
                >
                    {contact.avatarUrl ? (
                        <Img
                            src={contact.avatarUrl}
                            alt={contact.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                    ) : (
                        getInitials(contact.name)
                    )}
                </div>

                {/* Name and details */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                        style={{
                            fontFamily: iMessageTypography.fontFamily,
                            fontSize: iMessageTypography.listTitle.fontSize,
                            fontWeight: iMessageTypography.listTitle.fontWeight,
                            lineHeight: `${iMessageTypography.listTitle.lineHeight}px`,
                            color: textPrimary,
                            marginBottom: iMessageSpacing.messageGapMinimal,
                        }}
                    >
                        {contact.name}
                    </div>
                    {contact.phone && (
                        <div
                            style={{
                                fontFamily: iMessageTypography.fontFamily,
                                fontSize: iMessageTypography.caption.fontSize,
                                lineHeight: `${iMessageTypography.caption.lineHeight}px`,
                                color: textSecondary,
                            }}
                        >
                            {contact.phone}
                        </div>
                    )}
                    {contact.email && (
                        <div
                            style={{
                                fontFamily: iMessageTypography.fontFamily,
                                fontSize: iMessageTypography.caption.fontSize,
                                lineHeight: `${iMessageTypography.caption.lineHeight}px`,
                                color: textSecondary,
                            }}
                        >
                            {contact.email}
                        </div>
                    )}
                </div>
            </div>

            {/* Action buttons */}
            <div
                style={{
                    display: "flex",
                    borderTop: `0.5px solid ${separatorColor}`,
                }}
            >
                <div
                    style={{
                        flex: 1,
                        padding: `${iMessageSpacing.inputPaddingV}px 0`,
                        textAlign: "center",
                        fontFamily: iMessageTypography.fontFamily,
                        fontSize: iMessageTypography.caption.fontSize,
                        fontWeight: iMessageTypography.listTitle.fontWeight,
                        color: actionColor,
                        borderRight: `0.5px solid ${separatorColor}`,
                        cursor: "pointer",
                    }}
                >
                    Message
                </div>
                <div
                    style={{
                        flex: 1,
                        padding: `${iMessageSpacing.inputPaddingV}px 0`,
                        textAlign: "center",
                        fontFamily: iMessageTypography.fontFamily,
                        fontSize: iMessageTypography.caption.fontSize,
                        fontWeight: iMessageTypography.listTitle.fontWeight,
                        color: actionColor,
                        cursor: "pointer",
                    }}
                >
                    Call
                </div>
            </div>
        </div>
    );
};

export default ContactCard;
