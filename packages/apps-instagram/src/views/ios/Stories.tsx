/**
 * Instagram Stories Row (iOS)
 * 
 * Horizontal scroll of story avatars with gradient rings.
 */

import React from "react";
import { instagramTheme } from "../../config/theme";
import type { InstagramStory } from "../../types";

interface StoriesProps {
    stories: InstagramStory[];
}

export const Stories: React.FC<StoriesProps> = ({ stories }) => {
    const theme = instagramTheme;

    return (
        <div
            data-anchor="stories"
            style={{
                height: 100,
                backgroundColor: theme.colors.background,
                borderBottom: `1px solid ${theme.colors.divider}`,
                display: "flex",
                alignItems: "center",
                paddingLeft: theme.spacing.screenPadding,
                gap: 16,
                overflowX: "auto",
            }}
        >
            {/* Your Story (Add) */}
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: 70,
            }}>
                <div style={{
                    width: theme.spacing.storyAvatarSize,
                    height: theme.spacing.storyAvatarSize,
                    borderRadius: "50%",
                    backgroundColor: theme.colors.backgroundSecondary,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                    color: theme.colors.textSecondary,
                    position: "relative",
                }}>
                    <span>👤</span>
                    {/* Plus badge */}
                    <div style={{
                        position: "absolute",
                        bottom: -2,
                        right: -2,
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        backgroundColor: theme.colors.brandBlue,
                        border: `2px solid ${theme.colors.background}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: 12,
                        fontWeight: "bold",
                    }}>
                        +
                    </div>
                </div>
                <span style={{
                    fontSize: 11,
                    marginTop: 4,
                    color: theme.colors.textPrimary,
                }}>
                    Your story
                </span>
            </div>

            {/* Other Stories */}
            {stories.map((story) => (
                <div
                    key={story.id}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        minWidth: 70,
                    }}
                >
                    {/* Gradient ring container */}
                    <div style={{
                        width: theme.spacing.storyAvatarSize + 6,
                        height: theme.spacing.storyAvatarSize + 6,
                        borderRadius: "50%",
                        background: story.hasUnseenStory
                            ? theme.colors.storiesGradient
                            : theme.colors.border,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}>
                        {/* Inner white ring */}
                        <div style={{
                            width: theme.spacing.storyAvatarSize + 2,
                            height: theme.spacing.storyAvatarSize + 2,
                            borderRadius: "50%",
                            backgroundColor: theme.colors.background,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}>
                            {/* Avatar */}
                            <div style={{
                                width: theme.spacing.storyAvatarSize,
                                height: theme.spacing.storyAvatarSize,
                                borderRadius: "50%",
                                backgroundColor: theme.colors.backgroundSecondary,
                                backgroundImage: story.author.avatar ? `url(${story.author.avatar})` : undefined,
                                backgroundSize: "cover",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 24,
                            }}>
                                {!story.author.avatar && "👤"}
                            </div>
                        </div>
                    </div>
                    <span style={{
                        fontSize: 11,
                        marginTop: 4,
                        color: theme.colors.textPrimary,
                        maxWidth: 64,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}>
                        {story.author.username}
                    </span>
                </div>
            ))}
        </div>
    );
};
