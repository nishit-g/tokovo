/**
 * Compose Modal
 * 
 * Tweet composition UI with text input, media, and posting.
 */

import React from "react";
import { twitterColors, twitterTypography, twitterSpacing, twitterLayout } from "../config";
import { Avatar } from "./Avatar";

// =============================================================================
// TYPES
// =============================================================================

export interface ComposeModalProps {
    isOpen?: boolean;
    replyTo?: {
        name: string;
        handle: string;
        text: string;
    };
    draftText?: string;
    userAvatarUrl?: string;
    userName?: string;
    onClose?: () => void;
    onPost?: (text: string) => void;
}

// =============================================================================
// TOOLBAR BUTTON
// =============================================================================

const ToolbarButton: React.FC<{ icon: React.ReactNode; disabled?: boolean }> = ({
    icon,
    disabled = false
}) => (
    <div style={{
        width: 96,
        height: 96,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.4 : 1,
    }}>
        {icon}
    </div>
);

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const ComposeModal: React.FC<ComposeModalProps> = ({
    isOpen = true,
    replyTo,
    draftText = "",
    userAvatarUrl,
    userName = "You",
    onClose,
    onPost,
}) => {
    if (!isOpen) return null;

    const hasContent = draftText.length > 0;
    const charLimit = 280;
    const charsRemaining = charLimit - draftText.length;
    const isOverLimit = charsRemaining < 0;

    return (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: twitterColors.background.primary,
            zIndex: 1000,
        }}>
            {/* Header */}
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: `${twitterLayout.safeAreaTop + 24}px ${twitterSpacing.horizontalPadding}px 24px`,
                borderBottom: `1px solid ${twitterColors.border.primary}`,
            }}>
                {/* Cancel */}
                <div
                    style={{
                        fontSize: 48,
                        color: twitterColors.text.primary,
                        cursor: "pointer",
                    }}
                    onClick={onClose}
                >
                    Cancel
                </div>

                {/* Drafts */}
                <div style={{
                    fontSize: 48,
                    color: twitterColors.brand.blue,
                }}>
                    Drafts
                </div>

                {/* Post Button */}
                <div style={{
                    backgroundColor: hasContent && !isOverLimit
                        ? twitterColors.brand.blue
                        : twitterColors.brand.blue,
                    opacity: hasContent && !isOverLimit ? 1 : 0.5,
                    color: "white",
                    padding: "24px 48px",
                    borderRadius: 999,
                    fontSize: 48,
                    fontWeight: 700,
                    cursor: hasContent && !isOverLimit ? "pointer" : "default",
                }}
                    onClick={() => hasContent && !isOverLimit && onPost?.(draftText)}
                >
                    Post
                </div>
            </div>

            {/* Reply To Context */}
            {replyTo && (
                <div style={{
                    padding: twitterSpacing.tweetPadding,
                    borderBottom: `1px solid ${twitterColors.border.primary}`,
                }}>
                    <div style={{
                        fontSize: 42,
                        color: twitterColors.text.secondary,
                    }}>
                        Replying to <span style={{ color: twitterColors.brand.blue }}>@{replyTo.handle}</span>
                    </div>
                </div>
            )}

            {/* Compose Area */}
            <div style={{
                display: "flex",
                padding: twitterSpacing.tweetPadding,
                gap: 36,
            }}>
                {/* Avatar */}
                <Avatar
                    imageUrl={userAvatarUrl}
                    name={userName}
                    size="large"
                />

                {/* Text Input Area */}
                <div style={{
                    flex: 1,
                    minHeight: 300,
                }}>
                    <div style={{
                        fontSize: 60,
                        color: draftText ? twitterColors.text.primary : twitterColors.text.tertiary,
                        lineHeight: 1.35,
                    }}>
                        {draftText || "What's happening?"}
                    </div>

                    {/* Audience selector */}
                    <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 12,
                        marginTop: 36,
                        padding: "12px 24px",
                        borderRadius: 999,
                        border: `3px solid ${twitterColors.brand.blue}`,
                    }}>
                        <span style={{
                            fontSize: 42,
                            color: twitterColors.brand.blue,
                            fontWeight: 700,
                        }}>
                            🌍 Everyone can reply
                        </span>
                    </div>
                </div>
            </div>

            {/* Bottom Toolbar */}
            <div style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                borderTop: `1px solid ${twitterColors.border.primary}`,
                backgroundColor: twitterColors.background.primary,
                paddingBottom: twitterLayout.safeAreaBottom,
            }}>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    padding: `24px ${twitterSpacing.horizontalPadding}px`,
                }}>
                    {/* Media buttons */}
                    <div style={{ display: "flex", gap: 12 }}>
                        <ToolbarButton icon={
                            <svg width={72} height={72} viewBox="0 0 24 24" fill={twitterColors.brand.blue}>
                                <path d="M3 5.5A2.5 2.5 0 0 1 5.5 3h13A2.5 2.5 0 0 1 21 5.5v13a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 18.5v-13zM5.5 5a.5.5 0 0 0-.5.5v9.086l3-3 3 3 5-5 3 3V5.5a.5.5 0 0 0-.5-.5h-13zM19 15.414l-3-3-5 5-3-3-3 3V18.5a.5.5 0 0 0 .5.5h13a.5.5 0 0 0 .5-.5v-3.086zM9.75 7a1.75 1.75 0 1 0 0 3.5 1.75 1.75 0 0 0 0-3.5z" />
                            </svg>
                        } />
                        <ToolbarButton icon={
                            <svg width={72} height={72} viewBox="0 0 24 24" fill={twitterColors.brand.blue}>
                                <path d="M3 5.5A2.5 2.5 0 0 1 5.5 3h13A2.5 2.5 0 0 1 21 5.5v6.636a6 6 0 0 0-1-.318V5.5a.5.5 0 0 0-.5-.5h-13a.5.5 0 0 0-.5.5v13a.5.5 0 0 0 .5.5h6.318c.066.357.171.7.318 1H5.5A2.5 2.5 0 0 1 3 18.5v-13z" />
                            </svg>
                        } />
                        <ToolbarButton icon={
                            <svg width={72} height={72} viewBox="0 0 24 24" fill={twitterColors.brand.blue}>
                                <path d="M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm8 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm-4 6a4 4 0 0 0 4-4H8a4 4 0 0 0 4 4z" />
                                <path d="M12 23c6.075 0 11-4.925 11-11S18.075 1 12 1 1 5.925 1 12s4.925 11 11 11zm0-2a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" />
                            </svg>
                        } />
                        <ToolbarButton icon={
                            <svg width={72} height={72} viewBox="0 0 24 24" fill={twitterColors.brand.blue}>
                                <path d="M12 7c-1.93 0-3.5 1.57-3.5 3.5S10.07 14 12 14s3.5-1.57 3.5-3.5S13.93 7 12 7zm0 5c-.827 0-1.5-.673-1.5-1.5S11.173 9 12 9s1.5.673 1.5 1.5S12.827 12 12 12zm0-10c-4.687 0-8.5 3.813-8.5 8.5 0 5.967 7.621 11.116 7.945 11.332l.555.37.555-.37c.324-.216 7.945-5.365 7.945-11.332C20.5 5.813 16.687 2 12 2z" />
                            </svg>
                        } />
                    </div>

                    {/* Spacer */}
                    <div style={{ flex: 1 }} />

                    {/* Character count */}
                    <div style={{
                        fontSize: 42,
                        color: isOverLimit
                            ? twitterColors.engagement.like
                            : charsRemaining < 20
                                ? "#FFD700"
                                : twitterColors.text.secondary,
                    }}>
                        {charsRemaining}
                    </div>

                    {/* Add button */}
                    <div style={{
                        marginLeft: 36,
                        width: 84,
                        height: 84,
                        borderRadius: "50%",
                        border: `3px solid ${twitterColors.brand.blue}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}>
                        <span style={{
                            fontSize: 48,
                            color: twitterColors.brand.blue,
                            fontWeight: 300,
                        }}>
                            +
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComposeModal;
