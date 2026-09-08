import React from "react";
import { Users } from "lucide-react";
import { Header } from "./Header.js";
import { useTheme, useWhatsAppLocale } from "../experience/ExperienceContext.js";
import { formatWhatsAppNumber } from "../localization/index.js";

export interface GroupMemberInfo {
  id: string;
  name: string;
  avatar?: string;
}

export interface GroupHeaderProps {
  groupName: string;
  members: GroupMemberInfo[];
  groupAvatar?: string;
  contentInsetTop: number;
  onBack?: () => void;
}

export const GroupHeader: React.FC<GroupHeaderProps> = ({
  groupName,
  members,
  groupAvatar,
  contentInsetTop,
  onBack,
}) => {
  const theme = useTheme();
  const { locale, t } = useWhatsAppLocale();
  const names = members
    .filter((member) => member.id !== "me")
    .slice(0, 2)
    .map((member) => member.name);
  if (members.some((member) => member.id === "me")) names.push(t("chat.you"));
  const remaining = members.length - names.length;
  const subtitle =
    names.length === 0
      ? t("chat.groupInfoHint")
      : names.join(", ") +
        (remaining > 0
          ? ` +${formatWhatsAppNumber(locale, remaining)} ${t(remaining === 1 ? "chat.other" : "chat.others")}`
          : "");

  return (
    <Header
      contactName={groupName}
      status={subtitle}
      avatarUrl={groupAvatar}
      avatarContent={
        groupAvatar ? undefined : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "grid",
              placeItems: "center",
              background: theme.colors.surfaceMuted,
            }}
          >
            <Users size={22} color={theme.colors.timestamp} strokeWidth={1.6} />
          </div>
        )
      }
      contentInsetTop={contentInsetTop}
      onBack={onBack}
    />
  );
};

export default GroupHeader;
