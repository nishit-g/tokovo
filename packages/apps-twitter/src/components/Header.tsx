/**
 * Header Component
 * 
 * Top navigation with profile avatar, X logo, and settings.
 */

import React from "react";
import { twitterColors, twitterSpacing, twitterLayout, twitterTypography } from "../config";
import { Avatar } from "./Avatar";

// =============================================================================
// TYPES
// =============================================================================

export interface HeaderProps {
    userAvatarUrl?: string;
    userName?: string;
    activeTab?: "for-you" | "following";
}

// =============================================================================
// X LOGO
// =============================================================================

const XLogo: React.FC<{ size: number }> = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={twitterColors.text.primary}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

// =============================================================================
// HEADER COMPONENT
// =============================================================================

export const Header: React.FC<HeaderProps> = ({
    userAvatarUrl,
    userName = "User",
    activeTab = "for-you",
}) => {
    return (
        <div style={{
            position: "sticky",
            top: 0,
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(12px)",
            borderBottom: `1px solid ${twitterColors.ui.border}`,
            zIndex: 100,
        }}>
            {/* Main header */}
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: `${twitterLayout.safeAreaTop}px ${twitterSpacing.tweetPadding}px 24px`,
            }}>
                {/* Profile avatar */}
                <Avatar
                    name={userName}
                    imageUrl={userAvatarUrl}
                    size="small"
                />

                {/* X Logo */}
                <XLogo size={90} />

                {/* Settings/Premium */}
                <div style={{
                    width: twitterSpacing.avatarSizeSmall,
                    height: twitterSpacing.avatarSizeSmall,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                    <svg width={54} height={54} viewBox="0 0 24 24" fill="none" stroke={twitterColors.text.primary} strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                    </svg>
                </div>
            </div>

            {/* Tab bar */}
            <div style={{
                display: "flex",
                height: twitterLayout.tabBarHeight,
            }}>
                {/* For You tab */}
                <div style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                }}>
                    <span style={{
                        fontSize: twitterTypography.sizes.tabLabel,
                        fontWeight: activeTab === "for-you" ? 700 : 500,
                        color: activeTab === "for-you" ? twitterColors.text.primary : twitterColors.text.secondary,
                        fontFamily: twitterTypography.fontFamily,
                    }}>
                        For you
                    </span>
                    {activeTab === "for-you" && (
                        <div style={{
                            position: "absolute",
                            bottom: 0,
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: 150,
                            height: 12,
                            backgroundColor: twitterColors.brand.blue,
                            borderRadius: 6,
                        }} />
                    )}
                </div>

                {/* Following tab */}
                <div style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                }}>
                    <span style={{
                        fontSize: twitterTypography.sizes.tabLabel,
                        fontWeight: activeTab === "following" ? 700 : 500,
                        color: activeTab === "following" ? twitterColors.text.primary : twitterColors.text.secondary,
                        fontFamily: twitterTypography.fontFamily,
                    }}>
                        Following
                    </span>
                    {activeTab === "following" && (
                        <div style={{
                            position: "absolute",
                            bottom: 0,
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: 180,
                            height: 12,
                            backgroundColor: twitterColors.brand.blue,
                            borderRadius: 6,
                        }} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Header;
