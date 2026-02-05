/**
 * Search Bar Component - iOS-style search input
 * Uses iMessage design tokens for spacing/typography and iOS_COLORS for colors
 */

import React from "react";
import { useIMessageTheme } from "../ui/ThemeContext";
import { iMessageSpacing, iMessageTypography } from "../config/tokens";
import { iOS_COLORS } from "../config/colors";

interface SearchBarProps {
    query?: string;
    placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    query = "",
    placeholder = "Search",
}) => {
    const theme = useIMessageTheme();
    const { colors } = theme;

    return (
        <div
            style={{
                padding: `${iMessageSpacing.searchBarMarginV}px ${iMessageSpacing.searchBarMarginH}px`,
                backgroundColor: colors.system.background,
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: iMessageSpacing.inputIconGap,
                    backgroundColor: iOS_COLORS.grayBackground,
                    borderRadius: iMessageSpacing.searchBarRadius,
                    height: iMessageSpacing.searchBarHeight,
                    padding: `0 ${iMessageSpacing.bubblePaddingH}px`,
                }}
            >
                {/* Magnifying glass icon */}
                <svg
                    width={iMessageSpacing.tapbackIconSize}
                    height={iMessageSpacing.tapbackIconSize}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={iOS_COLORS.gray}
                    strokeWidth="2"
                    style={{ flexShrink: 0 }}
                >
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                </svg>

                {/* Search text */}
                <div
                    style={{
                        flex: 1,
                        fontFamily: iMessageTypography.fontFamily,
                        fontSize: iMessageTypography.message.fontSize,
                        lineHeight: `${iMessageTypography.message.lineHeight}px`,
                        color: query ? colors.bubble.otherText : iOS_COLORS.gray,
                    }}
                >
                    {query || placeholder}
                </div>

                {/* Clear button */}
                {query && (
                    <div
                        style={{
                            width: iMessageSpacing.tapbackIconSize + 2,
                            height: iMessageSpacing.tapbackIconSize + 2,
                            borderRadius: "50%",
                            backgroundColor: iOS_COLORS.gray,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            flexShrink: 0,
                        }}
                    >
                        <svg
                            width={iMessageSpacing.inputIconGap + 2}
                            height={iMessageSpacing.inputIconGap + 2}
                            viewBox="0 0 10 10"
                            stroke={iOS_COLORS.textWhite}
                            strokeWidth="2"
                        >
                            <path d="M2 2L8 8M8 2L2 8" />
                        </svg>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchBar;
