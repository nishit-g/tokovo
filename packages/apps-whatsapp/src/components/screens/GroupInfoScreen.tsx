import type { ReactNode } from "react";
import type { WorldState } from "@tokovo/core";
import { DeterministicImage } from "@tokovo/react";
import {
  Bell,
  ChevronLeft,
  Image as ImageIcon,
  LogOut,
  Search,
  Timer,
  UserPlus,
  Users,
  Video,
  Phone,
} from "lucide-react";
import {
  useTheme,
  useWhatsAppLocale,
} from "../../experience/ExperienceContext.js";
import type {
  WhatsAppConversation,
  WhatsAppGroupMember,
  WhatsAppState,
} from "../../types/index.js";
import { resolveAvatarWithFallback } from "../../utils/avatar.js";
import { formatWhatsAppNumber } from "../../localization/index.js";
import { AppScaffold, SectionHeader, SettingsGroup, SettingsRow } from "../surfaces/index.js";

export interface GroupInfoScreenProps {
  world: WorldState;
  conversationId: string;
  safeAreaInsets?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  width: number;
  height: number;
}

function ActionTile({ label, icon }: { label: string; icon: ReactNode }) {
  const theme = useTheme();
  const { uiTypography: typography } = theme;
  return (
    <div
      style={{
        flex: 1,
        height: 52,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 3,
        border: `1px solid ${theme.colors.divider}`,
        borderRadius: 13,
        color: theme.colors.accent,
        backgroundColor: theme.colors.background,
      }}
    >
      {icon}
      <span
        style={{
          ...typography.caption,
          fontSize: 12,
          color: theme.colors.receivedBubbleText,
          fontFamily: theme.typography.fontFamily,
        }}
      >
        {label}
      </span>
    </div>
  );
}

function MemberRow({
  member,
  admin,
  isLast,
}: {
  member: WhatsAppGroupMember;
  admin: boolean;
  isLast: boolean;
}) {
  const theme = useTheme();
  const { t } = useWhatsAppLocale();
  const { uiTypography: typography } = theme;
  return (
    <div
      data-member-id={member.id}
      style={{
        minHeight: 55,
        padding: "6px 12px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        borderBottom: isLast ? undefined : `0.5px solid ${theme.colors.divider}`,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          overflow: "hidden",
          borderRadius: 20,
          backgroundColor: theme.colors.divider,
          flexShrink: 0,
        }}
      >
        <DeterministicImage
          src={resolveAvatarWithFallback(member.avatar, member.name)}
          alt={member.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            ...typography.body,
            fontWeight: 600,
            color: theme.colors.receivedBubbleText,
            fontFamily: theme.typography.fontFamily,
          }}
        >
          {member.name}
        </div>
        {member.phone && (
          <div
            style={{
              ...typography.caption,
              marginTop: 1,
              color: theme.colors.timestamp,
              fontFamily: theme.typography.fontFamily,
            }}
          >
            {member.phone}
          </div>
        )}
      </div>
      {admin && (
        <span
          style={{
            padding: "3px 6px",
            borderRadius: 6,
            color: theme.colors.accent,
            backgroundColor: `${theme.colors.accent}12`,
            fontSize: 10,
            fontWeight: 700,
            fontFamily: theme.typography.fontFamily,
          }}
        >
          {t("group.admin")}
        </span>
      )}
    </div>
  );
}

export function GroupInfoScreen({
  world,
  conversationId,
  safeAreaInsets,
}: GroupInfoScreenProps) {
  const theme = useTheme();
  const { direction, locale, t } = useWhatsAppLocale();
  const { uiTypography: typography } = theme;
  const safeAreaTop = safeAreaInsets?.top ?? theme.safeArea.top;
  const safeAreaBottom = safeAreaInsets?.bottom ?? theme.safeArea.bottom;
  const state = world.appState?.app_whatsapp as WhatsAppState | undefined;
  const conversation: WhatsAppConversation | undefined = state?.conversations[conversationId];
  if (!conversation || conversation.type !== "group") {
    throw new Error(`WhatsApp group info requires group conversation "${conversationId}"`);
  }

  const messages = conversation.messages;
  const mediaCount = messages.filter((message) =>
    ["image", "video", "gif", "sticker", "document", "link"].includes(message.type),
  ).length;
  const admins = new Set(conversation.admins ?? []);
  const fallbackGroupName = t("profile.group");
  const groupName = conversation.name ?? fallbackGroupName;

  return (
    <AppScaffold
      title={t("screen.groupInfo")}
      safeAreaTop={safeAreaTop}
      safeAreaBottom={safeAreaBottom}
      showTabs={false}
      leading={
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <ChevronLeft
            size={21}
            style={{ transform: direction === "rtl" ? "scaleX(-1)" : undefined }}
          />
          <span style={{ fontSize: 15 }}>{t("action.back")}</span>
        </div>
      }
      actions={<span style={{ fontSize: 15, fontWeight: 600 }}>{t("action.edit")}</span>}
    >
      <div data-anchor="profile_hero" style={{ padding: "14px 16px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 82,
              height: 82,
              overflow: "hidden",
              borderRadius: 22,
              backgroundColor: theme.colors.divider,
              flexShrink: 0,
            }}
          >
            <DeterministicImage
              src={resolveAvatarWithFallback(conversation.avatar, groupName)}
              alt={groupName}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: 23,
                fontWeight: 650,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                color: theme.colors.receivedBubbleText,
                fontFamily: theme.typography.fontFamily,
              }}
            >
              {groupName}
            </div>
            <div
              style={{
                ...typography.caption,
                marginTop: 4,
                color: theme.colors.timestamp,
                fontFamily: theme.typography.fontFamily,
              }}
            >
              {t("group.summary", {
                count: conversation.members?.length ?? 0,
              })}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 13 }}>
          <ActionTile label={t("action.audio")} icon={<Phone size={18} />} />
          <ActionTile label={t("action.video")} icon={<Video size={19} />} />
          <ActionTile label={t("action.search")} icon={<Search size={18} />} />
        </div>
      </div>

      {conversation.description && (
        <div
          style={{
            margin: "0 16px 11px",
            padding: "9px 11px",
            border: `1px solid ${theme.colors.divider}`,
            borderRadius: 13,
            color: theme.colors.receivedBubbleText,
            backgroundColor: theme.colors.background,
            fontSize: 14,
            lineHeight: "19px",
            fontFamily: theme.typography.fontFamily,
          }}
        >
          {conversation.description}
        </div>
      )}

      <SettingsGroup>
        <SettingsRow
          icon={<ImageIcon size={17} />}
          iconBackground="#4C6FFF"
          title={t("profile.mediaLinksDocs")}
          trailing={formatWhatsAppNumber(locale, mediaCount)}
        />
        <SettingsRow
          icon={<Bell size={17} />}
          iconBackground="#F39C12"
          title={t("profile.notifications")}
          trailing={
            conversation.preferences?.notifications ??
            t(conversation.isMuted ? "profile.muted" : "profile.on")
          }
        />
        <SettingsRow
          icon={<Timer size={17} />}
          iconBackground="#15A085"
          title={t("profile.disappearingMessages")}
          trailing={
            conversation.preferences?.disappearingMessages ?? t("profile.off")
          }
          isLast
        />
      </SettingsGroup>

      <SectionHeader
        title={t("group.members", {
          count: conversation.members?.length ?? 0,
        })}
        action={t("action.search")}
      />
      <div
        data-anchor="group_members"
        style={{
          margin: "0 16px 12px",
          overflow: "hidden",
          border: `1px solid ${theme.colors.divider}`,
          borderRadius: 13,
          backgroundColor: theme.colors.background,
        }}
      >
        <div
          style={{
            minHeight: 50,
            padding: "6px 12px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            color: theme.colors.accent,
            borderBottom: `0.5px solid ${theme.colors.divider}`,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 19,
              color: theme.colors.unreadBadgeText,
              backgroundColor: theme.colors.accent,
            }}
          >
            <UserPlus size={18} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 650 }}>
            {t("group.addMembers")}
          </span>
        </div>
        {(conversation.members ?? []).slice(0, 4).map((member, index, members) => (
          <MemberRow
            key={member.id}
            member={member}
            admin={admins.has(member.id)}
            isLast={index === members.length - 1}
          />
        ))}
      </div>

      <SettingsGroup>
        <SettingsRow
          icon={<Users size={17} />}
          iconBackground="#4C6FFF"
          title={t("group.inviteViaLink")}
        />
        <SettingsRow
          icon={<LogOut size={17} />}
          iconBackground="#D64545"
          title={t("group.exit")}
          danger
          isLast
        />
      </SettingsGroup>
    </AppScaffold>
  );
}

export default GroupInfoScreen;
