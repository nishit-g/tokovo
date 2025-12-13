/**
 * Profile Screen
 * 
 * User profile with banner, avatar, bio, and tweets.
 */

import React from "react";
import { twitterColors, twitterTypography, twitterSpacing, twitterLayout } from "../config";
import { Avatar, VerifiedType } from "./Avatar";
import { Tweet, TweetData } from "./Tweet";

// =============================================================================
// TYPES
// =============================================================================

export interface ProfileData {
    handle: string;
    name: string;
    bio?: string;
    location?: string;
    website?: string;
    joinDate?: string;
    followingCount: number;
    followersCount: number;
    avatarUrl?: string;
    bannerUrl?: string;
    verified?: VerifiedType;
    isFollowing?: boolean;
}

export interface ProfileProps {
    profile: ProfileData;
    tweets?: TweetData[];
    onBack?: () => void;
}

// =============================================================================
// BACK BUTTON
// =============================================================================

const BackButton: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
    <div
        style={{
            width: 96,
            height: 96,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
        }}
        onClick={onClick}
    >
        <svg width={60} height={60} viewBox="0 0 24 24" fill="white">
            <path d="M20 11H7.414l4.293-4.293a1 1 0 0 0-1.414-1.414l-6 6a1 1 0 0 0 0 1.414l6 6a1 1 0 0 0 1.414-1.414L7.414 13H20a1 1 0 0 0 0-2z" />
        </svg>
    </div>
);

// =============================================================================
// PROFILE HEADER (Banner + Avatar overlay)
// =============================================================================

const ProfileHeader: React.FC<{ profile: ProfileData; onBack?: () => void }> = ({ profile, onBack }) => {
    const bannerHeight = 450;

    return (
        <div style={{ position: "relative" }}>
            {/* Banner */}
            <div style={{
                height: bannerHeight,
                backgroundColor: profile.bannerUrl ? undefined : twitterColors.brand.blue,
                backgroundImage: profile.bannerUrl ? `url(${profile.bannerUrl})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
            }} />

            {/* Back button overlay */}
            <div style={{
                position: "absolute",
                top: twitterLayout.safeAreaTop + 24,
                left: 36,
            }}>
                <BackButton onClick={onBack} />
            </div>

            {/* Avatar overlapping banner */}
            <div style={{
                position: "absolute",
                bottom: -75,
                left: 36,
                borderRadius: "50%",
                border: `12px solid ${twitterColors.background.primary}`,
            }}>
                <Avatar
                    imageUrl={profile.avatarUrl}
                    name={profile.name}
                    size="large"
                    verified={profile.verified}
                />
            </div>

            {/* Follow button */}
            <div style={{
                position: "absolute",
                bottom: -60,
                right: 36,
            }}>
                <button style={{
                    backgroundColor: profile.isFollowing ? "transparent" : twitterColors.text.primary,
                    color: profile.isFollowing ? twitterColors.text.primary : twitterColors.background.primary,
                    border: profile.isFollowing ? `3px solid ${twitterColors.border.secondary}` : "none",
                    padding: "30px 60px",
                    borderRadius: 999,
                    fontSize: twitterTypography.sizes.displayName,
                    fontWeight: twitterTypography.weights.bold,
                }}>
                    {profile.isFollowing ? "Following" : "Follow"}
                </button>
            </div>
        </div>
    );
};

// =============================================================================
// PROFILE INFO
// =============================================================================

const ProfileInfo: React.FC<{ profile: ProfileData }> = ({ profile }) => {
    const formatNumber = (num: number): string => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    };

    return (
        <div style={{
            padding: twitterSpacing.tweetPadding,
            paddingTop: 100,  // Space for overlapping avatar
        }}>
            {/* Name and handle */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 6,
            }}>
                <span style={{
                    fontSize: 60,
                    fontWeight: 700,
                    color: twitterColors.text.primary,
                }}>
                    {profile.name}
                </span>
                {profile.verified && (
                    <svg width={60} height={60} viewBox="0 0 24 24" fill={
                        profile.verified === "gold" ? twitterColors.verified.gold :
                            profile.verified === "grey" ? twitterColors.verified.grey :
                                twitterColors.verified.blue
                    }>
                        <path d="M22.25 12c0-1.43-.88-2.67-2.19-3.34.46-1.39.2-2.9-.81-3.91s-2.52-1.27-3.91-.81c-.66-1.31-1.91-2.19-3.34-2.19s-2.67.88-3.33 2.19c-1.4-.46-2.91-.2-3.92.81s-1.26 2.52-.8 3.91c-1.31.67-2.2 1.91-2.2 3.34s.89 2.67 2.2 3.34c-.46 1.39-.21 2.9.8 3.91s2.52 1.26 3.91.81c.67 1.31 1.91 2.19 3.34 2.19s2.68-.88 3.34-2.19c1.39.45 2.9.2 3.91-.81s1.27-2.52.81-3.91c1.31-.67 2.19-1.91 2.19-3.34zm-11.71 4.2L6.8 12.46l1.41-1.42 2.26 2.26 4.8-5.23 1.47 1.36-6.2 6.77z" />
                    </svg>
                )}
            </div>

            <div style={{
                fontSize: twitterTypography.sizes.handle,
                color: twitterColors.text.secondary,
                marginBottom: 36,
            }}>
                @{profile.handle}
            </div>

            {/* Bio */}
            {profile.bio && (
                <div style={{
                    fontSize: twitterTypography.sizes.tweetText,
                    color: twitterColors.text.primary,
                    lineHeight: 1.4,
                    marginBottom: 36,
                }}>
                    {profile.bio}
                </div>
            )}

            {/* Location, Website, Join Date */}
            <div style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 36,
                marginBottom: 36,
                fontSize: 42,
                color: twitterColors.text.secondary,
            }}>
                {profile.location && (
                    <span>📍 {profile.location}</span>
                )}
                {profile.website && (
                    <span style={{ color: twitterColors.brand.blue }}>🔗 {profile.website}</span>
                )}
                {profile.joinDate && (
                    <span>📅 Joined {profile.joinDate}</span>
                )}
            </div>

            {/* Following / Followers */}
            <div style={{ display: "flex", gap: 48, marginBottom: 36 }}>
                <span>
                    <span style={{ fontWeight: 700, color: twitterColors.text.primary }}>
                        {formatNumber(profile.followingCount)}
                    </span>
                    <span style={{ color: twitterColors.text.secondary, marginLeft: 12 }}>
                        Following
                    </span>
                </span>
                <span>
                    <span style={{ fontWeight: 700, color: twitterColors.text.primary }}>
                        {formatNumber(profile.followersCount)}
                    </span>
                    <span style={{ color: twitterColors.text.secondary, marginLeft: 12 }}>
                        Followers
                    </span>
                </span>
            </div>
        </div>
    );
};

// =============================================================================
// PROFILE TABS
// =============================================================================

const ProfileTabs: React.FC<{ activeTab?: string }> = ({ activeTab = "posts" }) => {
    const tabs = ["Posts", "Replies", "Highlights", "Media", "Likes"];

    return (
        <div style={{
            display: "flex",
            borderBottom: `1px solid ${twitterColors.border.primary}`,
        }}>
            {tabs.map(tab => (
                <div key={tab} style={{
                    flex: 1,
                    padding: "36px 0",
                    textAlign: "center",
                    fontSize: 45,
                    fontWeight: activeTab === tab.toLowerCase() ? 700 : 400,
                    color: activeTab === tab.toLowerCase() ? twitterColors.text.primary : twitterColors.text.secondary,
                    borderBottom: activeTab === tab.toLowerCase()
                        ? `6px solid ${twitterColors.brand.blue}`
                        : "none",
                }}>
                    {tab}
                </div>
            ))}
        </div>
    );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const Profile: React.FC<ProfileProps> = ({
    profile,
    tweets = [],
    onBack,
}) => {
    return (
        <div style={{
            height: "100%",
            backgroundColor: twitterColors.background.primary,
            overflowY: "auto",
        }}>
            <ProfileHeader profile={profile} onBack={onBack} />
            <ProfileInfo profile={profile} />
            <ProfileTabs />

            {/* User's tweets */}
            {tweets.map(tweet => (
                <Tweet key={tweet.id} tweet={tweet} />
            ))}

            {tweets.length === 0 && (
                <div style={{
                    padding: 96,
                    textAlign: "center",
                    color: twitterColors.text.secondary,
                    fontSize: 48,
                }}>
                    No posts yet
                </div>
            )}
        </div>
    );
};

export default Profile;
