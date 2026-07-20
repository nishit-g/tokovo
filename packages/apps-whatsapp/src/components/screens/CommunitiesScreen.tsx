import type { WorldState } from "@tokovo/core";
import { DeterministicImage } from "@tokovo/react";
import {
  BellRing,
  ChevronRight,
  Megaphone,
  Plus,
  Users,
} from "lucide-react";
import {
  useTheme,
  useWhatsAppLocale,
} from "../../experience/ExperienceContext.js";
import type {
  WhatsAppCommunity,
  WhatsAppConversation,
  WhatsAppState,
} from "../../types/index.js";
import { resolveAvatarWithFallback } from "../../utils/avatar.js";
import { formatWhatsAppNumber } from "../../localization/index.js";
import { AppScaffold, EmptyState, SectionHeader } from "../surfaces/index.js";

export interface CommunitiesScreenProps {
  world: WorldState;
  safeAreaInsets?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  width: number;
  height: number;
}

function CommunityGroupRow({
  conversation,
  isAnnouncement,
}: {
  conversation: WhatsAppConversation;
  isAnnouncement: boolean;
}) {
  const theme = useTheme();
  const { locale, t } = useWhatsAppLocale();
  const { uiTypography: typography } = theme;
  const lastMessage = conversation.messages.at(-1);
  const fallbackGroupName = t("profile.group");
  const preview =
    lastMessage?.text ?? conversation.description ?? t("chat.noMessages");

  return (
    <div
      data-community-group-id={conversation.id}
      style={{
        minHeight: 62,
        padding: "7px 12px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        borderTop: `0.5px solid ${theme.colors.divider}`,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          borderRadius: isAnnouncement ? 11 : 20,
          color: isAnnouncement ? theme.colors.accent : undefined,
          backgroundColor: isAnnouncement
            ? `${theme.colors.accent}18`
            : theme.colors.divider,
          flexShrink: 0,
        }}
      >
        {isAnnouncement ? (
          <Megaphone size={19} />
        ) : (
          <DeterministicImage
            src={resolveAvatarWithFallback(
              conversation.avatar,
              conversation.name ?? fallbackGroupName,
            )}
            alt={conversation.name ?? fallbackGroupName}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            ...typography.body,
            fontWeight: 600,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            color: theme.colors.receivedBubbleText,
            fontFamily: theme.typography.fontFamily,
          }}
        >
          {isAnnouncement
            ? t("communities.announcements")
            : conversation.name ?? fallbackGroupName}
        </div>
        <div
          style={{
            ...typography.caption,
            marginTop: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            color: theme.colors.timestamp,
            fontFamily: theme.typography.fontFamily,
          }}
        >
          {preview}
        </div>
      </div>
      {(conversation.unreadCount ?? 0) > 0 && (
        <div
          style={{
            minWidth: 19,
            height: 19,
            padding: "0 5px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 10,
            color: theme.colors.unreadBadgeText,
            backgroundColor: theme.colors.unreadBadge,
            fontSize: 10,
            fontWeight: 700,
          }}
        >
          {formatWhatsAppNumber(
            locale,
            Math.min(conversation.unreadCount ?? 0, 99),
          )}
        </div>
      )}
    </div>
  );
}

function CommunityCard({
  community,
  conversations,
}: {
  community: WhatsAppCommunity;
  conversations: Record<string, WhatsAppConversation>;
}) {
  const theme = useTheme();
  const { direction, locale, t } = useWhatsAppLocale();
  const { uiTypography: typography } = theme;
  const announcement = community.announcementConversationId
    ? conversations[community.announcementConversationId]
    : undefined;
  const groups = community.groupConversationIds
    .filter((id) => id !== community.announcementConversationId)
    .map((id) => conversations[id])
    .filter((value): value is WhatsAppConversation => Boolean(value))
    .slice(0, 2);

  return (
    <div
      data-community-id={community.id}
      style={{
        margin: "0 16px 14px",
        overflow: "hidden",
        border: `1px solid ${theme.colors.divider}`,
        borderRadius: 16,
        backgroundColor: theme.colors.background,
      }}
    >
      <div
        style={{
          minHeight: 72,
          padding: "10px 12px",
          display: "flex",
          alignItems: "center",
          gap: 11,
        }}
      >
        <div
          style={{
            width: 50,
            height: 50,
            overflow: "hidden",
            borderRadius: 14,
            backgroundColor: theme.colors.divider,
            flexShrink: 0,
          }}
        >
          <DeterministicImage
            src={resolveAvatarWithFallback(community.avatar, community.name)}
            alt={community.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              ...typography.headline,
              color: theme.colors.receivedBubbleText,
              fontFamily: theme.typography.fontFamily,
            }}
          >
            {community.name}
          </div>
          <div
            style={{
              ...typography.caption,
              marginTop: 2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              color: theme.colors.timestamp,
              fontFamily: theme.typography.fontFamily,
            }}
          >
            {community.description ??
              t("group.members", { count: community.memberCount ?? 0 })}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {(community.unreadCount ?? 0) > 0 && (
            <BellRing size={15} color={theme.colors.accent} />
          )}
          <ChevronRight
            size={17}
            color={theme.colors.timestamp}
            style={{ transform: direction === "rtl" ? "scaleX(-1)" : undefined }}
          />
        </div>
      </div>
      {announcement && (
        <CommunityGroupRow conversation={announcement} isAnnouncement />
      )}
      {groups.map((group) => (
        <CommunityGroupRow
          key={group.id}
          conversation={group}
          isAnnouncement={false}
        />
      ))}
      <div
        style={{
          height: 38,
          padding: "0 13px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: `0.5px solid ${theme.colors.divider}`,
          color: theme.colors.accent,
          fontSize: 13,
          fontWeight: 600,
          fontFamily: theme.typography.fontFamily,
        }}
      >
        <span>{t("communities.viewAllGroups")}</span>
        <span>
          {formatWhatsAppNumber(
            locale,
            new Set(community.groupConversationIds).size,
          )}
        </span>
      </div>
    </div>
  );
}

export function CommunitiesScreen({
  world,
  safeAreaInsets,
}: CommunitiesScreenProps) {
  const theme = useTheme();
  const { direction, t } = useWhatsAppLocale();
  const { uiTypography: typography } = theme;
  const safeAreaTop = safeAreaInsets?.top ?? theme.safeArea.top;
  const safeAreaBottom = safeAreaInsets?.bottom ?? theme.safeArea.bottom;
  const state = (world.appState?.app_whatsapp ?? {}) as Partial<WhatsAppState>;
  const conversations = state.conversations ?? {};
  const communities = state.communities ?? [];

  return (
    <AppScaffold
      title={t("nav.communities")}
      activeTab="communities"
      safeAreaTop={safeAreaTop}
      safeAreaBottom={safeAreaBottom}
      actions={<Plus size={20} />}
    >
      <div
        style={{
          margin: "14px 16px 10px",
          minHeight: 70,
          padding: "10px 12px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          border: `1px solid ${theme.colors.divider}`,
          borderRadius: 16,
          backgroundColor: theme.colors.headerBackground,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 14,
            color: theme.colors.unreadBadgeText,
            backgroundColor: theme.colors.accent,
          }}
        >
          <Users size={23} />
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              ...typography.headline,
              color: theme.colors.receivedBubbleText,
              fontFamily: theme.typography.fontFamily,
            }}
          >
            {t("communities.new")}
          </div>
          <div
            style={{
              ...typography.caption,
              marginTop: 2,
              color: theme.colors.timestamp,
              fontFamily: theme.typography.fontFamily,
            }}
          >
            {t("communities.newBody")}
          </div>
        </div>
        <ChevronRight
          size={17}
          color={theme.colors.timestamp}
          style={{ transform: direction === "rtl" ? "scaleX(-1)" : undefined }}
        />
      </div>

      <SectionHeader title={t("communities.yours")} />
      <div data-anchor="communities_list">
        {communities.length > 0 ? (
          communities.slice(0, 2).map((community) => (
            <CommunityCard
              key={community.id}
              community={community}
              conversations={conversations}
            />
          ))
        ) : (
          <EmptyState
            icon={<Users size={28} />}
            title={t("communities.emptyTitle")}
            body={t("communities.emptyBody")}
          />
        )}
      </div>
    </AppScaffold>
  );
}

export default CommunitiesScreen;
