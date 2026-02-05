/**
 * WhatsApp Group Header Component
 * 
 * Specialized header for group chats with:
 * - Composite avatar (2x2 grid if no custom avatar)
 * - Group name with member count subtitle
 * - Video and voice call buttons
 * 
 * Follows iOS WhatsApp design patterns.
 */

import React from "react";
import { ChevronLeftIcon, VideoCallIcon, PhoneCallIcon } from "./Icons";
import { Img } from "remotion";
import { resolveAvatarWithFallback } from "../utils/avatar";
import { whatsappColors, spacing, typography } from "./theme";

export interface GroupMemberInfo {
    id: string;
    name: string;
    avatar?: string;
}

export interface GroupHeaderProps {
    groupName: string;
    members: GroupMemberInfo[];
    groupAvatar?: string;
    safeAreaTop?: number;
    onBack?: () => void;
}

/**
 * Generate subtitle text: "Alice, Bob, You and 3 others"
 */
function getSubtitle(members: GroupMemberInfo[]): string {
    if (!members || members.length === 0) {
        return "tap here for group info";
    }

    const names: string[] = [];
    const otherMembers = members.filter(m => m.id !== "me");

    // Take first 2 non-me members
    for (let i = 0; i < Math.min(2, otherMembers.length); i++) {
        names.push(otherMembers[i].name);
    }

    // Add "You" if user is a member
    if (members.some(m => m.id === "me")) {
        names.push("You");
    }

    // Calculate remaining
    const remaining = members.length - names.length;
    if (remaining > 0) {
        return `${names.join(", ")} and ${remaining} others`;
    }

    return names.join(", ");
}

/**
 * Composite avatar component for groups without custom avatar.
 * Shows 2x2 grid of member avatars.
 */
const CompositeAvatar: React.FC<{ members: GroupMemberInfo[] }> = ({ members }) => {
    const displayMembers = members.slice(0, 4);

    // Fill remaining slots with placeholder
    while (displayMembers.length < 4) {
        displayMembers.push({ id: `placeholder_${displayMembers.length}`, name: "" });
    }

    return (
        <div style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: "1fr 1fr",
            overflow: "hidden",
            backgroundColor: whatsappColors.bgSecondary,
        }}>
            {displayMembers.map((m, i) => (
                <div
                    key={m.id}
                    style={{
                        backgroundImage: m.avatar ? `url(${m.avatar})` : undefined,
                        backgroundColor: m.avatar ? undefined : getPlaceholderColor(i),
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10,
                        fontWeight: 600,
                        color: whatsappColors.avatarBorder,
                    }}
                >
                    {!m.avatar && m.name ? m.name.charAt(0).toUpperCase() : ""}
                </div>
            ))}
        </div>
    );
};

/**
 * Get placeholder background color for composite avatar slots.
 */
function getPlaceholderColor(index: number): string {
    const colors = [
        whatsappColors.textSecondary,
        whatsappColors.separator,
        whatsappColors.separatorLight,
        whatsappColors.separatorUltraLight,
    ];
    return colors[index % colors.length];
}

export const GroupHeader: React.FC<GroupHeaderProps> = ({
    groupName,
    members,
    groupAvatar,
    safeAreaTop = 59,
    onBack,
}) => {
    const subtitle = getSubtitle(members);

    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: whatsappColors.bgSecondary,
            paddingTop: safeAreaTop,
            paddingBottom: 12,
            paddingLeft: spacing.contentMarginLeft,
            paddingRight: spacing.contentMarginRight,
            borderBottom: `0.5px solid ${whatsappColors.separatorLight}`,
        }}>
            {/* Back Button */}
            <div
                onClick={onBack}
                style={{
                    width: 40,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: onBack ? "pointer" : "default",
                }}
            >
                <ChevronLeftIcon color={whatsappColors.primary} />
            </div>

            {/* Avatar */}
            {groupAvatar ? (
                <Img
                    src={resolveAvatarWithFallback(groupAvatar, groupName)}
                    alt={groupName}
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        objectFit: "cover",
                    }}
                />
            ) : (
                <CompositeAvatar members={members} />
            )}

            {/* Title + Subtitle */}
            <div style={{
                flex: 1,
                marginLeft: 12,
                overflow: "hidden",
            }}>
                <div style={{
                    fontSize: typography.title.fontSize,
                    fontWeight: 600,
                    color: whatsappColors.textPrimary,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                }}>
                    {groupName}
                </div>
                <div style={{
                    fontSize: typography.caption.fontSize,
                    color: whatsappColors.textSecondary,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    marginTop: 1,
                }}>
                    {subtitle}
                </div>
            </div>

            {/* Call Buttons */}
            <div style={{
                display: "flex",
                gap: 20,
            }}>
                <VideoCallIcon color={whatsappColors.primary} />
                <PhoneCallIcon color={whatsappColors.primary} />
            </div>
        </div>
    );
};

export default GroupHeader;
