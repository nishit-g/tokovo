import React from "react";
import { DeterministicImage } from "@tokovo/react";
import { ChevronLeftIcon, PhoneCallIcon, VideoCallIcon } from "./Icons.js";
import { resolveAvatarWithFallback } from "../utils/avatar.js";
import {
  useTheme,
  useWhatsAppLocale,
  useWhatsAppPresentation,
} from "../experience/ExperienceContext.js";
import { UI_CONSTANTS } from "../config/layout-config.js";
import {
  formatWhatsAppNumber,
  type WhatsAppLocale,
} from "../localization/index.js";

export interface GroupMemberInfo {
  id: string;
  name: string;
  avatar?: string;
}

export interface GroupHeaderProps {
  groupName: string;
  members: GroupMemberInfo[];
  groupAvatar?: string;
  safeAreaTop?: number;
  onBack?: () => void;
}

function getSubtitle(
  members: GroupMemberInfo[],
  t: ReturnType<typeof useWhatsAppLocale>["t"],
  locale: WhatsAppLocale,
): string {
  if (!members || members.length === 0) {
    return t("chat.groupInfoHint");
  }

  const names: string[] = [];
  const otherMembers = members.filter((m) => m.id !== "me");

  for (let i = 0; i < Math.min(2, otherMembers.length); i++) {
    names.push(otherMembers[i].name);
  }

  if (members.some((m) => m.id === "me")) {
    names.push(t("chat.you"));
  }

  const remaining = members.length - names.length;
  if (remaining > 0) {
    return `${names.join(", ")} +${formatWhatsAppNumber(locale, remaining)} ${t(
      remaining === 1 ? "chat.other" : "chat.others",
    )}`;
  }

  return names.join(", ");
}

const slotColor = (
  index: number,
  theme: ReturnType<typeof useTheme>,
): string => {
  const colors = [
    theme.colors.timestamp,
    theme.colors.divider,
    `${theme.colors.accent}44`,
    `${theme.colors.link}33`,
  ];
  return colors[index % colors.length];
};

const CompositeAvatar: React.FC<{ members: GroupMemberInfo[] }> = ({
  members,
}) => {
  const theme = useTheme();
  const displayMembers = members.slice(0, 4);

  while (displayMembers.length < 4) {
    displayMembers.push({
      id: `placeholder_${displayMembers.length}`,
      name: "",
    });
  }

  return (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "1fr 1fr",
        overflow: "hidden",
        backgroundColor: theme.colors.background,
        border: `1px solid ${theme.colors.divider}`,
      }}
    >
      {displayMembers.map((m, i) => (
        <div
          key={m.id}
          style={{
            backgroundColor: m.avatar ? undefined : slotColor(i, theme),
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            fontWeight: 600,
            color: theme.colors.background,
            fontFamily: theme.typography.fontFamily,
          }}
        >
          {m.avatar ? (
            <DeterministicImage
              src={resolveAvatarWithFallback(m.avatar, m.name)}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : m.name ? (
            m.name.charAt(0).toUpperCase()
          ) : (
            ""
          )}
        </div>
      ))}
    </div>
  );
};

export const GroupHeader: React.FC<GroupHeaderProps> = ({
  groupName,
  members,
  groupAvatar,
  safeAreaTop = 59,
  onBack,
}) => {
  const theme = useTheme();
  const { direction, locale, t } = useWhatsAppLocale();
  const presentation = useWhatsAppPresentation();
  const { uiSpacing: spacing, uiTypography: typography } = theme;
  const subtitle = getSubtitle(members, t, locale);
  const actionColor =
    presentation.conversation.headerActionColor === "accent"
      ? theme.colors.accent
      : theme.colors.headerText;

  return (
    <div
      data-anchor="header"
      style={{
        display: "flex",
        alignItems: "center",
        backgroundColor: `${theme.colors.headerBackground}F2`,
        paddingTop: safeAreaTop,
        paddingInlineStart: spacing.contentMarginLeft,
        paddingInlineEnd: spacing.contentMarginRight,
        height: safeAreaTop + UI_CONSTANTS.HEADER_CONTENT_HEIGHT,
        boxSizing: "border-box",
        borderBottom: `0.5px solid ${theme.colors.divider}`,
        backdropFilter: "blur(20px)",
        position: "relative",
        zIndex: 100,
      }}
    >
      <button
        type="button"
        aria-label={t("action.back")}
        onClick={onBack}
        style={{
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: onBack ? "pointer" : "default",
          padding: 0,
          border: 0,
          color: "inherit",
          background: "transparent",
          font: "inherit",
        }}
      >
        <span
          aria-hidden="true"
          style={{ display: "flex", transform: direction === "rtl" ? "scaleX(-1)" : undefined }}
        >
          <ChevronLeftIcon color={theme.colors.accent} />
        </span>
      </button>

      {groupAvatar ? (
        <DeterministicImage
          data-anchor="profile"
          src={resolveAvatarWithFallback(groupAvatar, groupName)}
          alt={groupName}
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      ) : (
        <div data-anchor="profile">
          <CompositeAvatar members={members} />
        </div>
      )}

      <div
        style={{
          flex: 1,
          marginInlineStart: 12,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            fontSize: typography.title.fontSize,
            fontWeight: 600,
            color: theme.colors.receivedBubbleText,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            fontFamily: theme.typography.fontFamily,
          }}
        >
          {groupName}
        </div>
        <div
          style={{
            fontSize: typography.caption.fontSize,
            color: theme.colors.timestamp,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            marginTop: 1,
            fontFamily: theme.typography.fontFamily,
          }}
        >
          {subtitle}
        </div>
      </div>

      <div
        role="group"
        aria-label={t("nav.calls")}
        style={{
          display: "flex",
          gap: 20,
        }}
      >
        <button
          type="button"
          aria-label={t("action.video")}
          style={{ padding: 0, border: 0, color: "inherit", background: "transparent" }}
        >
          <span aria-hidden="true">
            <VideoCallIcon color={actionColor} />
          </span>
        </button>
        <button
          type="button"
          aria-label={t("message.voiceCall")}
          style={{ padding: 0, border: 0, color: "inherit", background: "transparent" }}
        >
          <span aria-hidden="true">
            <PhoneCallIcon color={actionColor} />
          </span>
        </button>
      </div>
    </div>
  );
};

export default GroupHeader;
