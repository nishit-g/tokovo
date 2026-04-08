import React from "react";
import { Img } from "remotion";
import { ChevronLeftIcon, PhoneCallIcon, VideoCallIcon } from "./Icons.js";
import { spacing, typography } from "./theme.js";
import { resolveAvatarWithFallback } from "../utils/avatar.js";
import { useTheme } from "../theme/ThemeContext.js";

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

function getSubtitle(members: GroupMemberInfo[]): string {
  if (!members || members.length === 0) {
    return "tap here for group info";
  }

  const names: string[] = [];
  const otherMembers = members.filter((m) => m.id !== "me");

  for (let i = 0; i < Math.min(2, otherMembers.length); i++) {
    names.push(otherMembers[i].name);
  }

  if (members.some((m) => m.id === "me")) {
    names.push("You");
  }

  const remaining = members.length - names.length;
  if (remaining > 0) {
    return `${names.join(", ")} and ${remaining} others`;
  }

  return names.join(", ");
}

const slotColor = (index: number, theme: ReturnType<typeof useTheme>): string => {
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
    displayMembers.push({ id: `placeholder_${displayMembers.length}`, name: "" });
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
            backgroundImage: m.avatar ? `url(${resolveAvatarWithFallback(m.avatar, m.name)})` : undefined,
            backgroundColor: m.avatar ? undefined : slotColor(i, theme),
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            fontWeight: 600,
            color: theme.colors.background,
            fontFamily: theme.typography.fontFamily,
          }}
        >
          {!m.avatar && m.name ? m.name.charAt(0).toUpperCase() : ""}
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
  const subtitle = getSubtitle(members);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        backgroundColor: `${theme.colors.headerBackground}F2`,
        paddingTop: safeAreaTop,
        paddingBottom: 12,
        paddingLeft: spacing.contentMarginLeft,
        paddingRight: spacing.contentMarginRight,
        borderBottom: `0.5px solid ${theme.colors.divider}`,
        backdropFilter: "blur(20px)",
      }}
    >
      <div
        onClick={onBack}
        style={{
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: onBack ? "pointer" : "default",
        }}
      >
        <ChevronLeftIcon color={theme.colors.accent} />
      </div>

      {groupAvatar ? (
        <Img
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
        <CompositeAvatar members={members} />
      )}

      <div
        style={{
          flex: 1,
          marginLeft: 12,
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
        style={{
          display: "flex",
          gap: 20,
        }}
      >
        <VideoCallIcon color={theme.colors.accent} />
        <PhoneCallIcon color={theme.colors.accent} />
      </div>
    </div>
  );
};

export default GroupHeader;
