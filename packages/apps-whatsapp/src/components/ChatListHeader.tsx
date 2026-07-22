import React from "react";
import { CameraFillIcon, ComposeIcon, SearchIcon } from "./Icons.js";
import {
  useTheme,
  useWhatsAppLocale,
  useWhatsAppPresentation,
} from "../experience/ExperienceContext.js";
import type { WhatsAppChatFilter } from "../presentation/strategy.js";

export interface ChatListHeaderProps {
  contentInsetTop: number;
  activeFilter?: WhatsAppChatFilter;
  onFilterChange?: (filter: WhatsAppChatFilter) => void;
  showEditButton?: boolean;
  showDraftsFilter?: boolean;
}

const FilterChip: React.FC<{
  label: string;
  isActive: boolean;
  onClick?: () => void;
}> = ({ label, isActive, onClick }) => {
  const theme = useTheme();
  const { uiSpacing: spacing, uiTypography: typography } = theme;
  const activeBg = `${theme.colors.accent}1A`;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      style={{
        appearance: "none",
        padding: `${spacing.filterChipPaddingY}px ${spacing.filterChipPaddingX}px`,
        backgroundColor: isActive ? activeBg : theme.colors.background,
        borderRadius: spacing.filterChipRadius,
        border: `1px solid ${theme.colors.divider}`,
        boxShadow: isActive ? `0 6px 14px ${theme.colors.accent}18` : "0 1px 0 rgba(0,0,0,0.02)",
        ...typography.chip,
        fontWeight: isActive ? "600" : "500",
        color: isActive ? theme.colors.receivedBubbleText : theme.colors.timestamp,
        cursor: "pointer",
        userSelect: "none",
        fontFamily: theme.typography.fontFamily,
      }}
    >
      {label}
    </button>
  );
};

export const ChatListHeader: React.FC<ChatListHeaderProps> = ({
  contentInsetTop,
  activeFilter = "all",
  onFilterChange,
  showEditButton = false,
  showDraftsFilter = false,
}) => {
  const theme = useTheme();
  const { t } = useWhatsAppLocale();
  const { uiSpacing: spacing, uiTypography: typography } = theme;
  const presentation = useWhatsAppPresentation();
  const filterLabels: Record<WhatsAppChatFilter, string> = {
    all: t("filter.all"),
    unread: t("filter.unread"),
    favorites: t("filter.favorites"),
    groups: t("filter.groups"),
    drafts: t("filter.drafts"),
  };
  const filters = presentation.chatList.filters
    .filter((id) => id !== "drafts" || showDraftsFilter)
    .map((id) => ({
      id,
      label: filterLabels[id],
    }));
  const usesToolbarTitle = presentation.chatList.titleStyle === "toolbar";
  const headerActionColor = usesToolbarTitle ? theme.colors.headerText : theme.colors.accent;

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
          paddingTop: contentInsetTop,
          paddingLeft: spacing.pagePaddingWide,
          paddingRight: spacing.pagePaddingX,
          height: spacing.navBarHeight + contentInsetTop,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            minWidth: 60,
            color: theme.colors.headerText,
            fontFamily: theme.typography.fontFamily,
            fontSize: usesToolbarTitle ? 20 : 17,
            fontWeight: usesToolbarTitle ? 600 : 400,
          }}
        >
          {usesToolbarTitle ? (
            t("app.name")
          ) : showEditButton ? (
            <button
              type="button"
              style={{
                padding: 0,
                border: 0,
                background: "transparent",
                color: theme.colors.accent,
                fontSize: 17,
                fontWeight: "400",
                cursor: "pointer",
                fontFamily: theme.typography.fontFamily,
              }}
            >
              {t("action.edit")}
            </button>
          ) : null}
        </div>

        <div
          style={{
            display: "flex",
            gap: spacing.headerActionGap,
            alignItems: "center",
          }}
        >
          <button
            type="button"
            aria-label={t("action.camera")}
            style={{
              padding: 0,
              border: 0,
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <CameraFillIcon color={headerActionColor} />
          </button>
          <button
            type="button"
            aria-label={t("action.newChat")}
            style={{
              padding: 0,
              border: 0,
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <ComposeIcon color={headerActionColor} size={24} />
          </button>
        </div>
      </div>

      {!usesToolbarTitle && (
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
          {t("nav.chats")}
        </div>
      )}

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
              marginInlineStart: spacing.searchIconGap,
              fontSize: 17,
              color: theme.colors.timestamp,
              flex: 1,
              fontFamily: theme.typography.fontFamily,
            }}
          >
            {t("action.search")}
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
