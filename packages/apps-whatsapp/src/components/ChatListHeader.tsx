import React from "react";
import { CameraFillIcon, ComposeIcon, SearchIcon } from "./Icons.js";
import { spacing, typography } from "./theme.js";
import { useTheme } from "../theme/ThemeContext.js";

export interface ChatListHeaderProps {
  safeAreaTop?: number;
  activeFilter?: "all" | "unread" | "favorites" | "groups";
  onFilterChange?: (filter: "all" | "unread" | "favorites" | "groups") => void;
  showEditButton?: boolean;
}

const FilterChip: React.FC<{
  label: string;
  isActive: boolean;
  onClick?: () => void;
}> = ({ label, isActive, onClick }) => {
  const theme = useTheme();
  const activeBg = `${theme.colors.accent}1A`;

  return (
    <div
      onClick={onClick}
      style={{
        padding: `${spacing.filterChipPaddingY}px ${spacing.filterChipPaddingX}px`,
        backgroundColor: isActive ? activeBg : theme.colors.background,
        borderRadius: spacing.filterChipRadius,
        border: `1px solid ${theme.colors.divider}`,
        boxShadow: isActive
          ? `0 6px 14px ${theme.colors.accent}18`
          : "0 1px 0 rgba(0,0,0,0.02)",
        ...typography.chip,
        fontWeight: isActive ? "600" : "500",
        color: isActive
          ? theme.colors.receivedBubbleText
          : theme.colors.timestamp,
        cursor: "pointer",
        userSelect: "none",
        fontFamily: theme.typography.fontFamily,
      }}
    >
      {label}
    </div>
  );
};

export const ChatListHeader: React.FC<ChatListHeaderProps> = ({
  safeAreaTop = 47,
  activeFilter = "all",
  onFilterChange,
  showEditButton = false,
}) => {
  const theme = useTheme();
  const filters = [
    { id: "all", label: "All" },
    { id: "unread", label: "Unread" },
    { id: "favorites", label: "Favorites" },
    { id: "groups", label: "Groups" },
  ] as const;

  return (
    <div
      style={{
        backgroundColor: `${theme.colors.headerBackground}F2`,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        display: "flex",
        flexDirection: "column",
        zIndex: 100,
        position: "sticky",
        top: 0,
        borderBottom: `0.5px solid ${theme.colors.divider}`,
      }}
    >
      <div
        style={{
          paddingTop: safeAreaTop,
          paddingLeft: spacing.pagePaddingWide,
          paddingRight: spacing.pagePaddingX,
          height: spacing.navBarHeight + safeAreaTop,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxSizing: "border-box",
        }}
      >
        <div style={{ width: 60 }}>
          {showEditButton && (
            <div
              style={{
                color: theme.colors.accent,
                fontSize: 17,
                fontWeight: "400",
                cursor: "pointer",
                fontFamily: theme.typography.fontFamily,
              }}
            >
              Edit
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            gap: spacing.headerActionGap,
            alignItems: "center",
          }}
        >
          <div style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
            <CameraFillIcon color={theme.colors.accent} />
          </div>
          <div style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
            <ComposeIcon color={theme.colors.accent} size={24} />
          </div>
        </div>
      </div>

      <div
        style={{
          padding: `4px ${spacing.pagePaddingWide}px 10px ${spacing.pagePaddingWide}px`,
          ...typography.largeTitle,
          color: theme.colors.receivedBubbleText,
          display: "flex",
          alignItems: "center",
          fontFamily: theme.typography.fontFamily,
        }}
      >
        Chats
      </div>

      <div
        style={{
          padding: `0 ${spacing.pagePaddingX}px 10px ${spacing.pagePaddingX}px`,
        }}
      >
        <div
          style={{
            backgroundColor: theme.colors.background,
            borderRadius: spacing.searchBarRadius,
            height: spacing.searchBarHeight,
            display: "flex",
            alignItems: "center",
            padding: `0 ${spacing.searchPaddingX}px`,
            border: `1px solid ${theme.colors.divider}`,
            boxShadow: "0 1px 0 rgba(0,0,0,0.02)",
          }}
        >
          <SearchIcon color={theme.colors.timestamp} size={16} />
          <div
            style={{
              marginLeft: spacing.searchIconGap,
              fontSize: 17,
              color: theme.colors.timestamp,
              flex: 1,
              fontFamily: theme.typography.fontFamily,
            }}
          >
            Search
          </div>
        </div>
      </div>

      <div
        style={{
          padding: `0 ${spacing.pagePaddingX}px 12px ${spacing.pagePaddingX}px`,
          display: "flex",
          gap: spacing.filterChipGap,
          overflowX: "auto",
        }}
      >
        {filters.map((filter) => (
          <FilterChip
            key={filter.id}
            label={filter.label}
            isActive={activeFilter === filter.id}
            onClick={() => onFilterChange?.(filter.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ChatListHeader;
