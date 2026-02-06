import React from "react";
import { CameraFillIcon, ComposeIcon, SearchIcon } from "./Icons.js";
import { whatsappColors, typography, spacing } from "./theme.js";

// =============================================================================
// TYPES
// =============================================================================

export interface ChatListHeaderProps {
  safeAreaTop?: number;
  activeFilter?: "all" | "unread" | "favorites" | "groups";
  onFilterChange?: (filter: "all" | "unread" | "favorites" | "groups") => void;
  showEditButton?: boolean;
}

// =============================================================================
// FILTER CHIPS
// =============================================================================

const FilterChip: React.FC<{
  label: string;
  isActive: boolean;
  onClick?: () => void;
}> = ({ label, isActive, onClick }) => (
  <div
    onClick={onClick}
    style={{
      padding: `${spacing.filterChipPaddingY}px ${spacing.filterChipPaddingX}px`,
      backgroundColor: isActive
        ? whatsappColors.bgTertiary
        : whatsappColors.bgSecondary,
      borderRadius: spacing.filterChipRadius,
      border: isActive
        ? `1px solid ${whatsappColors.separatorLight}`
        : `1px solid ${whatsappColors.separatorUltraLight}`,
      boxShadow: isActive
        ? "0 6px 14px rgba(0,0,0,0.06)"
        : "0 1px 0 rgba(0,0,0,0.02)",
      ...typography.chip,
      fontWeight: isActive ? "600" : "500",
      color: isActive
        ? whatsappColors.textPrimary
        : whatsappColors.textSecondary,
      cursor: "pointer",
      userSelect: "none",
    }}
  >
    {label}
  </div>
);

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const ChatListHeader: React.FC<ChatListHeaderProps> = ({
  safeAreaTop = 47,
  activeFilter = "all",
  onFilterChange,
  showEditButton = false,
}) => {
  const filters = [
    { id: "all", label: "All" },
    { id: "unread", label: "Unread" },
    { id: "favorites", label: "Favorites" },
    { id: "groups", label: "Groups" },
  ] as const;

  return (
    <div
      style={{
        backgroundColor: whatsappColors.surfaceGlass,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        display: "flex",
        flexDirection: "column",
        zIndex: 100,
        position: "sticky",
        top: 0,
        borderBottom: `0.5px solid ${whatsappColors.separatorLight}`,
      }}
    >
      {/* Top Bar: Edit & Actions */}
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
        {/* Left Side - Edit Button (optional) or empty */}
        <div style={{ width: 60 }}>
          {showEditButton && (
            <div
              style={{
                color: whatsappColors.primary,
                fontSize: 17,
                fontWeight: "400",
                cursor: "pointer",
              }}
            >
              Edit
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div
          style={{
            display: "flex",
            gap: spacing.headerActionGap,
            alignItems: "center",
          }}
        >
          <div
            style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
          >
            <CameraFillIcon color={whatsappColors.primary} />
          </div>
          <div
            style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
          >
            <ComposeIcon color={whatsappColors.primary} size={24} />
          </div>
        </div>
      </div>

      {/* Large Title */}
      <div
        style={{
          padding: `4px ${spacing.pagePaddingWide}px 10px ${spacing.pagePaddingWide}px`,
          ...typography.largeTitle,
          color: whatsappColors.textPrimary,
          display: "flex",
          alignItems: "center",
        }}
      >
        Chats
      </div>

      {/* Search Bar */}
      <div
        style={{
          padding: `0 ${spacing.pagePaddingX}px 10px ${spacing.pagePaddingX}px`,
        }}
      >
        <div
          style={{
            backgroundColor: whatsappColors.bgSecondary,
            borderRadius: spacing.searchBarRadius,
            height: spacing.searchBarHeight,
            display: "flex",
            alignItems: "center",
            padding: `0 ${spacing.searchPaddingX}px`,
            border: `1px solid ${whatsappColors.separatorUltraLight}`,
            boxShadow: "0 1px 0 rgba(0,0,0,0.02)",
          }}
        >
          <SearchIcon color={whatsappColors.textSecondary} size={16} />
          <div
            style={{
              marginLeft: spacing.searchIconGap,
              fontSize: 17,
              color: whatsappColors.textSecondary,
              flex: 1,
            }}
          >
            Search
          </div>
        </div>
      </div>

      {/* Filter Chips */}
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
