/**
 * Poll Component
 * 
 * Twitter-style poll UI with voting and results.
 */

import React from "react";
import { twitterColors, twitterTypography } from "../config";

// =============================================================================
// TYPES
// =============================================================================

export interface PollOption {
    id: string;
    text: string;
    votes: number;
    isSelected?: boolean;
}

export interface PollProps {
    options: PollOption[];
    totalVotes: number;
    endTime?: string;  // "2h left", "Final results"
    hasVoted?: boolean;
}

// =============================================================================
// POLL OPTION
// =============================================================================

const PollOptionItem: React.FC<{
    option: PollOption;
    totalVotes: number;
    hasVoted: boolean;
    isWinning: boolean;
}> = ({ option, totalVotes, hasVoted, isWinning }) => {
    const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;

    return (
        <div style={{
            position: "relative",
            marginBottom: 24,
            borderRadius: 12,
            overflow: "hidden",
            border: option.isSelected
                ? `3px solid ${twitterColors.brand.blue}`
                : `3px solid ${twitterColors.border.secondary}`,
        }}>
            {/* Background bar (shown after voting) */}
            {hasVoted && (
                <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    height: "100%",
                    width: `${percentage}%`,
                    backgroundColor: isWinning
                        ? twitterColors.brand.blue
                        : twitterColors.background.secondary,
                    transition: "width 0.3s ease",
                }} />
            )}

            {/* Content */}
            <div style={{
                position: "relative",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "30px 36px",
            }}>
                <span style={{
                    fontSize: twitterTypography.sizes.tweetText,
                    fontWeight: option.isSelected ? 700 : 400,
                    color: twitterColors.text.primary,
                }}>
                    {option.text}
                </span>

                {hasVoted && (
                    <span style={{
                        fontSize: twitterTypography.sizes.tweetText,
                        fontWeight: isWinning ? 700 : 400,
                        color: twitterColors.text.primary,
                    }}>
                        {percentage}%
                    </span>
                )}

                {option.isSelected && (
                    <span style={{
                        position: "absolute",
                        right: 120,
                        fontSize: 42,
                    }}>
                        ✓
                    </span>
                )}
            </div>
        </div>
    );
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const Poll: React.FC<PollProps> = ({
    options,
    totalVotes,
    endTime = "Final results",
    hasVoted = false,
}) => {
    // Find winning option
    const maxVotes = Math.max(...options.map(o => o.votes));

    const formatVotes = (count: number): string => {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
        if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
        return count.toString();
    };

    return (
        <div style={{
            marginTop: 24,
            marginBottom: 24,
        }}>
            {/* Options */}
            {options.map(option => (
                <PollOptionItem
                    key={option.id}
                    option={option}
                    totalVotes={totalVotes}
                    hasVoted={hasVoted}
                    isWinning={option.votes === maxVotes && hasVoted}
                />
            ))}

            {/* Footer */}
            <div style={{
                display: "flex",
                gap: 18,
                fontSize: 39,
                color: twitterColors.text.secondary,
                marginTop: 24,
            }}>
                <span>{formatVotes(totalVotes)} votes</span>
                <span>·</span>
                <span>{endTime}</span>
            </div>
        </div>
    );
};

export default Poll;
