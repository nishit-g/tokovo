import React from "react";
import { CameraFillIcon, ComposeIcon, SearchIcon } from "./Icons";
import { whatsappColors, typography, spacing } from "./theme";

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
      padding: "6px 14px",
      backgroundColor: isActive ? whatsappColors.bgTertiary : whatsappColors.bgSecondary,
      borderRadius: spacing.filterChipRadius,
      ...typography.chip,
      fontWeight: isActive ? "600" : "400",
      color: isActive ? whatsappColors.textPrimary : whatsappColors.textSecondary,
      cursor: "pointer",
      transition: "background-color 0.15s ease",
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
        backgroundColor: "rgba(255, 255, 255, 0.94)",
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
          paddingLeft: 20,
          paddingRight: 16,
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
                color: whatsappColors.iosBlue,
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
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <div style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
            <CameraFillIcon color={whatsappColors.iosBlue} />
          </div>
          <div style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
            <ComposeIcon color={whatsappColors.iosBlue} size={24} />
          </div>
        </div>
      </div>

      {/* Large Title */}
      <div
        style={{
          padding: "4px 20px 10px 20px",
          ...typography.largeTitle,
          color: whatsappColors.textPrimary,
          display: "flex",
          alignItems: "center",
        }}
      >
        Chats
      </div>

      {/* Search Bar */}
      <div style={{ padding: "0 16px 10px 16px" }}>
        <div
          style={{
            backgroundColor: whatsappColors.bgSecondary,
            borderRadius: spacing.searchBarRadius,
            height: spacing.searchBarHeight,
            display: "flex",
            alignItems: "center",
            padding: "0 10px",
          }}
        >
          <SearchIcon color={whatsappColors.textSecondary} size={16} />
          <div
            style={{
              marginLeft: 8,
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
          padding: "0 16px 12px 16px",
          display: "flex",
          gap: 8,
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
