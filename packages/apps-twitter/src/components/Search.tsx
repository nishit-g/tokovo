/**
 * Search / Explore Screen
 * 
 * Trending topics, hashtags, and search functionality.
 */

import React from "react";
import { twitterColors, twitterTypography, twitterSpacing, twitterLayout } from "../config";

// =============================================================================
// TYPES
// =============================================================================

export interface TrendingTopic {
    id: string;
    category?: string;
    title: string;
    postCount?: number;
    isSponsored?: boolean;
}

export interface SearchProps {
    trends?: TrendingTopic[];
    searchQuery?: string;
    onBack?: () => void;
}

// =============================================================================
// SEARCH BAR
// =============================================================================

const SearchBar: React.FC<{ query?: string }> = ({ query }) => (
    <div style={{
        display: "flex",
        alignItems: "center",
        backgroundColor: twitterColors.background.secondary,
        borderRadius: 999,
        padding: "30px 48px",
        margin: `0 ${twitterSpacing.horizontalPadding}px`,
        gap: 24,
    }}>
        {/* Search Icon */}
        <svg width={60} height={60} viewBox="0 0 24 24" fill={twitterColors.text.secondary}>
            <path d="M10.25 3.75a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zm-8.5 6.5a8.5 8.5 0 1 1 15.176 5.262l4.781 4.781-1.414 1.414-4.781-4.781A8.5 8.5 0 0 1 1.75 10.25z" />
        </svg>
        <span style={{
            fontSize: twitterTypography.sizes.tweetText,
            color: query ? twitterColors.text.primary : twitterColors.text.secondary,
            flex: 1,
        }}>
            {query || "Search"}
        </span>
    </div>
);

// =============================================================================
// TABS
// =============================================================================

const SearchTabs: React.FC<{ activeTab?: string }> = ({ activeTab = "for-you" }) => {
    const tabs = [
        { id: "for-you", label: "For you" },
        { id: "trending", label: "Trending" },
        { id: "news", label: "News" },
        { id: "sports", label: "Sports" },
        { id: "entertainment", label: "Entertainment" },
    ];

    return (
        <div style={{
            display: "flex",
            overflowX: "auto",
            borderBottom: `1px solid ${twitterColors.border.primary}`,
            marginTop: 24,
        }}>
            {tabs.map(tab => (
                <div key={tab.id} style={{
                    padding: "36px 48px",
                    whiteSpace: "nowrap",
                    fontSize: 45,
                    fontWeight: activeTab === tab.id ? 700 : 400,
                    color: activeTab === tab.id ? twitterColors.text.primary : twitterColors.text.secondary,
                    borderBottom: activeTab === tab.id
                        ? `6px solid ${twitterColors.brand.blue}`
                        : "none",
                }}>
                    {tab.label}
                </div>
            ))}
        </div>
    );
};

// =============================================================================
// TRENDING ITEM
// =============================================================================

const TrendingItem: React.FC<{ trend: TrendingTopic; index: number }> = ({ trend, index }) => {
    const formatCount = (count: number): string => {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
        return count.toString();
    };

    return (
        <div style={{
            padding: twitterSpacing.tweetPadding,
            borderBottom: `1px solid ${twitterColors.border.primary}`,
        }}>
            {/* Top row: category or rank */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
            }}>
                <span style={{
                    fontSize: 39,
                    color: twitterColors.text.secondary,
                }}>
                    {trend.category || `${index + 1} · Trending`}
                </span>
                <span style={{ fontSize: 48 }}>⋯</span>
            </div>

            {/* Title */}
            <div style={{
                fontSize: twitterTypography.sizes.tweetText,
                fontWeight: 700,
                color: twitterColors.text.primary,
                marginBottom: 6,
            }}>
                {trend.title}
            </div>

            {/* Post count */}
            {trend.postCount && (
                <div style={{
                    fontSize: 39,
                    color: twitterColors.text.secondary,
                }}>
                    {formatCount(trend.postCount)} posts
                </div>
            )}

            {/* Sponsored label */}
            {trend.isSponsored && (
                <div style={{
                    fontSize: 36,
                    color: twitterColors.text.tertiary,
                    marginTop: 6,
                }}>
                    Promoted
                </div>
            )}
        </div>
    );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const Search: React.FC<SearchProps> = ({
    trends = [],
    searchQuery,
    onBack,
}) => {
    // Default trends if none provided
    const defaultTrends: TrendingTopic[] = [
        { id: "1", category: "Technology · Trending", title: "#AI", postCount: 125000 },
        { id: "2", category: "Business & finance · Trending", title: "Bitcoin", postCount: 89000 },
        { id: "3", category: "Sports · Trending", title: "World Cup", postCount: 234000 },
        { id: "4", category: "Entertainment · Trending", title: "#NewMusic", postCount: 45000 },
        { id: "5", category: "Politics · Trending", title: "Breaking News", postCount: 178000 },
    ];

    const displayTrends = trends.length > 0 ? trends : defaultTrends;

    return (
        <div style={{
            height: "100%",
            backgroundColor: twitterColors.background.primary,
            overflowY: "auto",
        }}>
            {/* Safe area + search bar */}
            <div style={{
                paddingTop: twitterLayout.safeAreaTop + 24,
                paddingBottom: 24,
            }}>
                <SearchBar query={searchQuery} />
            </div>

            <SearchTabs />

            {/* Section Header */}
            <div style={{
                padding: twitterSpacing.tweetPadding,
                paddingBottom: 24,
            }}>
                <span style={{
                    fontSize: 60,
                    fontWeight: 700,
                    color: twitterColors.text.primary,
                }}>
                    Trends for you
                </span>
            </div>

            {/* Trending items */}
            {displayTrends.map((trend, index) => (
                <TrendingItem key={trend.id} trend={trend} index={index} />
            ))}

            {/* Show more */}
            <div style={{
                padding: twitterSpacing.tweetPadding,
                color: twitterColors.brand.blue,
                fontSize: 45,
            }}>
                Show more
            </div>
        </div>
    );
};

export default Search;
