import { Camera, Plus, Radio, Search } from "lucide-react";
import type { WorldState } from "@tokovo/core";
import { DeterministicImage } from "@tokovo/react";
import {
  useTheme,
  useWhatsAppLocale,
} from "../../experience/ExperienceContext.js";
import type {
  WhatsAppChannel,
  WhatsAppState,
  WhatsAppStatusUpdate,
} from "../../types/index.js";
import {
  formatConversationListTimestamp,
  getBaseTime,
} from "../../utils/messages.js";
import { resolveAvatarWithFallback } from "../../utils/avatar.js";
import { AppScaffold, EmptyState, SectionHeader } from "../surfaces/index.js";
import { StatusRing, type StatusSegmentState } from "../StatusRing.js";
import { formatWhatsAppNumber } from "../../localization/index.js";

export interface UpdatesScreenProps {
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

interface StatusAuthor {
  id: string;
  name: string;
  avatar?: string;
  latest: WhatsAppStatusUpdate;
  hasUnviewed: boolean;
  segments: StatusSegmentState[];
}

function collectStatusAuthors(statuses: WhatsAppStatusUpdate[]): StatusAuthor[] {
  const authors = new Map<string, StatusAuthor>();
  [...statuses]
    .sort((left, right) => right.postedAt - left.postedAt)
    .forEach((status) => {
      const existing = authors.get(status.authorId);
      if (existing) {
        existing.hasUnviewed ||= !status.viewed;
        existing.segments.push(status.viewed ? "viewed" : "unviewed");
        return;
      }
      authors.set(status.authorId, {
        id: status.authorId,
        name: status.authorName,
        avatar: status.avatar,
        latest: status,
        hasUnviewed: !status.viewed,
        segments: [status.viewed ? "viewed" : "unviewed"],
      });
    });
  return [...authors.values()];
}

function StatusAvatar({
  name,
  avatar,
  unviewed,
  segments,
  add,
}: {
  name: string;
  avatar?: string;
  unviewed?: boolean;
  segments?: readonly StatusSegmentState[];
  add?: boolean;
}) {
  const theme = useTheme();
  return (
    <div style={{ position: "relative", width: 62, height: 62 }}>
      {segments && segments.length > 0 && (
        <div style={{ position: "absolute", inset: 0 }}>
          <StatusRing size={62} segments={segments} />
        </div>
      )}
      <div
        style={{
          position: "absolute",
          inset: 4,
          boxSizing: "border-box",
          borderRadius: 27,
          border: add
            ? `1px solid ${theme.colors.divider}`
            : segments?.length
              ? undefined
              : `2px solid ${unviewed ? theme.colors.statusRingUnviewed : theme.colors.statusRingViewed}`,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            overflow: "hidden",
            borderRadius: "50%",
            backgroundColor: theme.colors.divider,
          }}
        >
          <DeterministicImage
            src={resolveAvatarWithFallback(avatar, name)}
            alt={name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </div>
      {add && (
        <div
          style={{
            position: "absolute",
            right: -1,
            bottom: -1,
            width: 22,
            height: 22,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: `2px solid ${theme.colors.background}`,
            borderRadius: 11,
            color: theme.colors.unreadBadgeText,
            backgroundColor: theme.colors.accent,
          }}
        >
          <Plus size={14} strokeWidth={3} />
        </div>
      )}
    </div>
  );
}

function ChannelRow({
  channel,
  baseTime,
}: {
  channel: WhatsAppChannel;
  baseTime: Date;
}) {
  const theme = useTheme();
  const { locale, t } = useWhatsAppLocale();
  const { uiTypography: typography } = theme;
  return (
    <div
      data-anchor="channel_row"
      data-channel-id={channel.id}
      style={{
        minHeight: 78,
        padding: "9px 16px",
        display: "flex",
        alignItems: "center",
        gap: 11,
        borderBottom: `0.5px solid ${theme.colors.divider}`,
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          overflow: "hidden",
          flexShrink: 0,
          backgroundColor: theme.colors.divider,
        }}
      >
        <DeterministicImage
          src={resolveAvatarWithFallback(channel.avatar, channel.name)}
          alt={channel.name}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <span
            style={{
              ...typography.headline,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              color: theme.colors.receivedBubbleText,
              fontFamily: theme.typography.fontFamily,
            }}
          >
            {channel.name}
          </span>
          {channel.verified && (
            <span
              style={{
                width: 15,
                height: 15,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 8,
                color: "#FFFFFF",
                backgroundColor: theme.colors.accent,
                fontSize: 9,
                fontWeight: 700,
              }}
            >
              ✓
            </span>
          )}
        </div>
        <div
          style={{
            ...typography.body,
            marginTop: 2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            color: theme.colors.timestamp,
            fontFamily: theme.typography.fontFamily,
          }}
        >
          {channel.latestUpdate?.text ?? channel.description}
        </div>
        <div
          style={{
            ...typography.caption,
            marginTop: 2,
            color: theme.colors.timestamp,
            fontFamily: theme.typography.fontFamily,
          }}
        >
          {channel.followersLabel}
          {channel.latestUpdate
            ? ` · ${formatConversationListTimestamp(
                channel.latestUpdate.postedAt,
                baseTime,
                locale,
              )}`
            : ""}
        </div>
      </div>
      <div
        style={{
          width: 62,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 5,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: "100%",
            padding: "5px 7px",
            border: `1px solid ${channel.followed ? theme.colors.divider : theme.colors.accent}`,
            borderRadius: 14,
            textAlign: "center",
            color: channel.followed
              ? theme.colors.receivedBubbleText
              : theme.colors.accent,
            fontSize: 10,
            fontWeight: 600,
            fontFamily: theme.typography.fontFamily,
          }}
        >
          {channel.followed ? t("action.following") : t("action.follow")}
        </div>
        {channel.unreadCount > 0 && (
          <div
            style={{
              padding: "1px 7px",
              borderRadius: 9,
              color: theme.colors.unreadBadgeText,
              backgroundColor: theme.colors.unreadBadge,
              fontSize: 9,
              fontWeight: 700,
              fontFamily: theme.typography.fontFamily,
            }}
          >
            {t("updates.newCount", {
              count:
                channel.unreadCount > 99
                  ? "99+"
                  : formatWhatsAppNumber(locale, channel.unreadCount),
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function UpdatesScreen({
  world,
  safeAreaInsets,
}: UpdatesScreenProps) {
  const theme = useTheme();
  const { t } = useWhatsAppLocale();
  const { uiTypography: typography } = theme;
  const safeAreaTop = safeAreaInsets?.top ?? theme.safeArea.top;
  const safeAreaBottom = safeAreaInsets?.bottom ?? theme.safeArea.bottom;
  const state = (world.appState?.app_whatsapp ?? {}) as Partial<WhatsAppState>;
  const deviceId = Object.keys(world.devices ?? {})[0];
  const device = deviceId ? world.devices[deviceId] : undefined;
  const profile = state.profile;
  const statusAuthors = collectStatusAuthors(state.statuses ?? []).slice(0, 4);
  const channels = [...(state.channels ?? [])]
    .sort((left, right) => {
      if (left.followed !== right.followed) return left.followed ? -1 : 1;
      return (right.latestUpdate?.postedAt ?? 0) - (left.latestUpdate?.postedAt ?? 0);
    })
    .slice(0, 4);
  const baseTime = getBaseTime(world, deviceId);

  return (
    <AppScaffold
      title={t("nav.updates")}
      activeTab="updates"
      safeAreaTop={safeAreaTop}
      safeAreaBottom={safeAreaBottom}
      actions={
        <>
          <Search size={19} />
          <Camera size={19} />
          <Plus size={20} />
        </>
      }
    >
      <SectionHeader title={t("section.status")} action={t("section.privacy")} />
      <div
        data-anchor="updates_status_strip"
        style={{
          height: 102,
          padding: "0 16px 10px",
          display: "flex",
          alignItems: "flex-start",
          gap: 15,
          overflow: "hidden",
          borderBottom: `0.5px solid ${theme.colors.divider}`,
        }}
      >
        <div
          style={{
            width: 66,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
          }}
        >
          <StatusAvatar
            name={profile?.name ?? device?.ownerName ?? t("chat.you")}
            avatar={profile?.avatar}
            add
          />
          <span
            style={{
              ...typography.caption,
              width: 72,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              textAlign: "center",
              color: theme.colors.receivedBubbleText,
              fontFamily: theme.typography.fontFamily,
            }}
          >
            {t("updates.myStatus")}
          </span>
        </div>
        {statusAuthors.map((author) => (
          <div
            key={author.id}
            data-anchor={`updates_status_${author.id}`}
            data-status-author-id={author.id}
            style={{
              width: 66,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              flexShrink: 0,
            }}
          >
            <StatusAvatar
              name={author.name}
              avatar={author.avatar}
              unviewed={author.hasUnviewed}
              segments={author.segments}
            />
            <span
              style={{
                ...typography.caption,
                width: 72,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                textAlign: "center",
                color: theme.colors.receivedBubbleText,
                fontFamily: theme.typography.fontFamily,
              }}
            >
              {author.name}
            </span>
          </div>
        ))}
      </div>

      <SectionHeader
        title={t("updates.channels")}
        action={t("action.explore")}
      />
      <div data-anchor="updates_channels">
        {channels.length > 0 ? (
          channels.map((channel) => (
            <ChannelRow key={channel.id} channel={channel} baseTime={baseTime} />
          ))
        ) : (
          <EmptyState
            icon={<Radio size={28} />}
            title={t("updates.emptyTitle")}
            body={t("updates.emptyBody")}
          />
        )}
      </div>
    </AppScaffold>
  );
}

export default UpdatesScreen;
