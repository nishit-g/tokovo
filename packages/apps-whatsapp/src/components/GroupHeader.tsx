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
            backgroundColor: "#E5E5EA",
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
                        color: "#FFFFFF",
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
    const colors = ["#8E8E93", "#AEAEB2", "#C7C7CC", "#D1D1D6"];
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
            backgroundColor: "#F6F6F6",
            paddingTop: safeAreaTop,
            paddingBottom: 12,
            paddingLeft: 8,
            paddingRight: 16,
            borderBottom: "0.5px solid rgba(0,0,0,0.1)",
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
                <ChevronLeftIcon color="#007AFF" />
            </div>

            {/* Avatar */}
            {groupAvatar ? (
                <img
                    src={groupAvatar}
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
                    fontSize: 17,
                    fontWeight: 600,
                    color: "#000000",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                }}>
                    {groupName}
                </div>
                <div style={{
                    fontSize: 12,
                    color: "#8E8E93",
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
                <VideoCallIcon color="#007AFF" />
                <PhoneCallIcon color="#007AFF" />
            </div>
        </div>
    );
};

export default GroupHeader;
