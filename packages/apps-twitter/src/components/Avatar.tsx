/**
 * Avatar Component
 * 
 * Displays user profile picture with optional verified badge.
 */

import React from "react";
import { twitterColors, twitterSpacing } from "../config";

// =============================================================================
// TYPES
// =============================================================================

export type VerifiedType = "blue" | "gold" | "grey" | "none";

export interface AvatarProps {
    imageUrl?: string;
    name: string;
    size?: "small" | "medium" | "large";
    verified?: VerifiedType;
}

// =============================================================================
// VERIFIED BADGE
// =============================================================================

const VerifiedBadge: React.FC<{ type: VerifiedType; size: number }> = ({ type, size }) => {
    if (type === "none") return null;

    const color = twitterColors.verified[type];
    const badgeSize = size * 0.35;

    return (
        <div style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: badgeSize,
            height: badgeSize,
            backgroundColor: color,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: `3px solid ${twitterColors.background.primary}`,
        }}>
            {/* Checkmark SVG */}
            <svg
                width={badgeSize * 0.6}
                height={badgeSize * 0.6}
                viewBox="0 0 24 24"
                fill="white"
            >
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
            </svg>
        </div>
    );
};

// =============================================================================
// AVATAR COMPONENT
// =============================================================================

export const Avatar: React.FC<AvatarProps> = ({
    imageUrl,
    name,
    size = "medium",
    verified = "none",
}) => {
    const sizeMap = {
        small: twitterSpacing.avatarSizeSmall,
        medium: twitterSpacing.avatarSize,
        large: twitterSpacing.avatarSizeLarge,
    };

    const avatarSize = sizeMap[size];

    // Generate initials for fallback
    const initials = name
        .split(" ")
        .map(n => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    // Generate a consistent color from name
    const hashCode = name.split("").reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    const colors = ["#1D9BF0", "#00BA7C", "#F91880", "#FF7A00", "#7856FF"];
    const bgColor = colors[Math.abs(hashCode) % colors.length];

    return (
        <div style={{
            position: "relative",
            width: avatarSize,
            height: avatarSize,
            borderRadius: "50%",
            overflow: "visible",
            flexShrink: 0,
        }}>
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt={name}
                    style={{
                        width: avatarSize,
                        height: avatarSize,
                        borderRadius: "50%",
                        objectFit: "cover",
                    }}
                />
            ) : (
                <div style={{
                    width: avatarSize,
                    height: avatarSize,
                    borderRadius: "50%",
                    backgroundColor: bgColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                    <span style={{
                        fontSize: avatarSize * 0.4,
                        fontWeight: 700,
                        color: "white",
                        fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                    }}>
                        {initials}
                    </span>
                </div>
            )}

            <VerifiedBadge type={verified} size={avatarSize} />
        </div>
    );
};

export default Avatar;
