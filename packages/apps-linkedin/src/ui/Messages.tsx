import React from "react";
import type { WorldState } from "@tokovo/core";
import { Header, LIAvatar, LIIcon } from "./components.js";
import { useLinkedInTheme } from "./ThemeContext.js";
import {
  formatRelativeFrameTime,
  getCurrentUser,
  getDMThreads,
  getLastMessageForThread,
  getReferenceFrame,
  getUnreadMessageCount,
  getUserById,
} from "../runtime/selectors.js";

const SectionLabel: React.FC<{ label: string }> = ({ label }) => {
  const theme = useLinkedInTheme();

  return (
    <div
      style={{
        padding: `0 ${theme.spacing.screenPadding}px ${theme.spacing.sm}px`,
        fontSize: theme.typography.captionSemibold.fontSize,
        color: theme.colors.textSecondary,
      }}
    >
      {label}
    </div>
  );
};

const FilterChip: React.FC<{ label: string; active?: boolean }> = ({ label, active = false }) => {
  const theme = useLinkedInTheme();

  return (
    <div
      style={{
        height: 28,
        padding: `0 ${theme.spacing.sm}px`,
        borderRadius: theme.radius.pill,
        border: `1px solid ${active ? theme.colors.accent : theme.colors.border}`,
        background: active ? theme.colors.accentLight : theme.colors.surface,
        display: "inline-flex",
        alignItems: "center",
        color: active ? theme.colors.accent : theme.colors.textSecondary,
        fontSize: theme.typography.captionSemibold.fontSize,
        fontWeight: theme.typography.captionSemibold.fontWeight,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </div>
  );
};

const InboxRow: React.FC<{
  world: WorldState;
  thread: ReturnType<typeof getDMThreads>[number];
  currentUserId: string | null;
  currentUserConnectionIds: string[];
  referenceFrame: number;
}> = ({ world, thread, currentUserId, currentUserConnectionIds, referenceFrame }) => {
  const theme = useLinkedInTheme();
  const otherUserId = thread.participantIds.find((id) => id !== currentUserId) ?? thread.participantIds[0] ?? null;
  const user = getUserById(world, otherUserId);
  const message = getLastMessageForThread(world, thread.id);
  const isInMail = Boolean(otherUserId && !currentUserConnectionIds.includes(otherUserId));
  const hasDraft = thread.draftText.trim().length > 0;

  return (
    <div
      style={{
        display: "flex",
        gap: theme.spacing.md,
        padding: `${theme.spacing.md}px ${theme.spacing.screenPadding}px`,
        borderBottom: `1px solid ${theme.colors.border}`,
        background: thread.unreadCount > 0 ? theme.colors.surface : "transparent",
      }}
    >
      <LIAvatar size="lg" src={user?.avatarUrl} name={user?.name} showOnline={thread.unreadCount === 0 && !isInMail} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: theme.spacing.sm,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: theme.spacing.xs,
                minWidth: 0,
                flexWrap: "wrap",
              }}
            >
              <span
                style={{
                  fontSize: theme.typography.headline.fontSize,
                  fontWeight: theme.typography.headline.fontWeight,
                  color: theme.colors.textPrimary,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {thread.title ?? user?.name ?? "LinkedIn Member"}
              </span>
              {thread.pinned ? (
                <span style={{ fontSize: theme.typography.micro.fontSize, color: theme.colors.accent }}>
                  PINNED
                </span>
              ) : null}
              {isInMail ? (
                <span
                  style={{
                    padding: "1px 6px",
                    borderRadius: theme.radius.pill,
                    background: theme.colors.warningLight,
                    color: theme.colors.warning,
                    fontSize: theme.typography.micro.fontSize,
                    fontWeight: 700,
                  }}
                >
                  INMAIL
                </span>
              ) : null}
            </div>
            <div
              style={{
                marginTop: 2,
                fontSize: theme.typography.caption.fontSize,
                color: theme.colors.textSecondary,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user?.headline ?? (isInMail ? "Outside your network" : "1st degree connection")}
            </div>
          </div>
          <span
            style={{
              fontSize: theme.typography.caption.fontSize,
              color: theme.colors.textTertiary,
              flexShrink: 0,
            }}
          >
            {formatRelativeFrameTime(thread.lastMessageAt ?? message?.createdAt ?? 0, referenceFrame)}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: theme.spacing.sm,
            marginTop: 6,
          }}
        >
          <div
            style={{
              flex: 1,
              fontSize: theme.typography.bodySmall.fontSize,
              color: thread.unreadCount > 0 ? theme.colors.textPrimary : theme.colors.textSecondary,
              fontWeight: thread.unreadCount > 0 ? 600 : 400,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {hasDraft ? `Draft: ${thread.draftText}` : message?.text ?? "Start a conversation"}
          </div>
          {thread.unreadCount > 0 ? (
            <div
              style={{
                minWidth: 18,
                height: 18,
                borderRadius: theme.radius.pill,
                background: theme.colors.accent,
                color: theme.colors.textInverse,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0 4px",
                fontSize: theme.typography.micro.fontSize,
                fontWeight: 700,
              }}
            >
              {thread.unreadCount > 9 ? "9+" : thread.unreadCount}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export const Messages: React.FC<{ world: WorldState }> = ({ world }) => {
  const theme = useLinkedInTheme();
  const currentUser = getCurrentUser(world);
  const threads = getDMThreads(world);
  const referenceFrame = getReferenceFrame(world);
  const unreadCount = getUnreadMessageCount(world);
  const connectionIds = currentUser?.connectionIds ?? [];
  const focusedThreads = threads.filter((thread) => thread.pinned || thread.unreadCount > 0);
  const otherThreads = threads.filter((thread) => !(thread.pinned || thread.unreadCount > 0));
  const inMailCount = threads.filter((thread) => {
    const otherUserId = thread.participantIds.find((id) => id !== currentUser?.id) ?? null;
    return Boolean(otherUserId && !connectionIds.includes(otherUserId));
  }).length;
  const draftCount = threads.filter((thread) => thread.draftText.trim().length > 0).length;

  return (
    <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", position: "relative" }}>
      <Header avatarSrc={currentUser?.avatarUrl} title="Messaging" showSearch={false} />

      <div
        style={{
          padding: `${theme.spacing.sm}px ${theme.spacing.screenPadding}px`,
          display: "flex",
          gap: theme.spacing.sm,
        }}
      >
        <div
          style={{
            flex: 1,
            height: theme.spacing.inputHeight,
            borderRadius: theme.radius.input,
            background: theme.colors.surfaceHover,
            display: "flex",
            alignItems: "center",
            gap: theme.spacing.sm,
            padding: `0 ${theme.spacing.md}px`,
            color: theme.colors.textSecondary,
            fontSize: theme.typography.body.fontSize,
          }}
        >
          <LIIcon name="search" size={16} color={theme.colors.textSecondary} />
          <span>Search messages</span>
        </div>
        <div
          style={{
            width: 40,
            height: theme.spacing.inputHeight,
            borderRadius: theme.radius.input,
            background: theme.colors.surfaceHover,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LIIcon name="filter" size={18} color={theme.colors.textSecondary} />
        </div>
      </div>

      <div
        style={{
          padding: `0 ${theme.spacing.screenPadding}px ${theme.spacing.sm}px`,
          display: "flex",
          gap: theme.spacing.sm,
          overflowX: "auto",
        }}
      >
        <FilterChip label={`Focused${focusedThreads.length > 0 ? ` (${focusedThreads.length})` : ""}`} active />
        <FilterChip label={`Other${otherThreads.length > 0 ? ` (${otherThreads.length})` : ""}`} />
        <FilterChip label={`Unread${unreadCount > 0 ? ` (${unreadCount})` : ""}`} />
        <FilterChip label={`InMail${inMailCount > 0 ? ` (${inMailCount})` : ""}`} />
        <FilterChip label={`Drafts${draftCount > 0 ? ` (${draftCount})` : ""}`} />
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>
        {otherThreads.some((thread) => thread.unreadCount > 0) ? (
          <div
            style={{
              margin: `0 ${theme.spacing.screenPadding}px ${theme.spacing.sm}px`,
              padding: theme.spacing.md,
              borderRadius: theme.radius.md,
              background: theme.colors.accentLight,
              color: theme.colors.accent,
              fontSize: theme.typography.captionSemibold.fontSize,
              fontWeight: theme.typography.captionSemibold.fontWeight,
            }}
          >
            You have unread messages in Other
          </div>
        ) : null}

        <div
          style={{
            margin: `0 ${theme.spacing.screenPadding}px ${theme.spacing.sm}px`,
            padding: theme.spacing.md,
            borderRadius: theme.radius.md,
            background: theme.colors.surface,
            boxShadow: theme.shadows.card,
            display: "flex",
            alignItems: "center",
            gap: theme.spacing.md,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: theme.radius.md,
              background: theme.colors.accentLight,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <LIIcon name="briefcase" size={20} color={theme.colors.accent} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontSize: theme.typography.micro.fontSize,
                fontWeight: 700,
                color: theme.colors.textTertiary,
                marginBottom: 4,
                letterSpacing: 0.2,
              }}
            >
              PROMOTED
            </div>
            <div
              style={{
                fontSize: theme.typography.headline.fontSize,
                fontWeight: theme.typography.headline.fontWeight,
                color: theme.colors.textPrimary,
              }}
            >
              Sponsored InMail
            </div>
            <div
              style={{
                fontSize: theme.typography.bodySmall.fontSize,
                color: theme.colors.textSecondary,
                marginTop: 2,
              }}
            >
              Senior product teams are hiring designers who understand motion, systems, and narrative UX.
            </div>
          </div>
        </div>

        <SectionLabel label="Focused" />

        {focusedThreads.length > 0 ? (
          focusedThreads.map((thread) => (
            <InboxRow
              key={thread.id}
              world={world}
              thread={thread}
              currentUserId={currentUser?.id ?? null}
              currentUserConnectionIds={connectionIds}
              referenceFrame={referenceFrame}
            />
          ))
        ) : (
          <div
            style={{
              padding: `${theme.spacing.xxxl}px ${theme.spacing.xl}px`,
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 68,
                height: 68,
                margin: "0 auto",
                marginBottom: theme.spacing.lg,
                borderRadius: theme.radius.pill,
                background: theme.colors.accentLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LIIcon name="message" size={32} color={theme.colors.accent} />
            </div>
            <div
              style={{
                fontSize: theme.typography.title.fontSize,
                fontWeight: theme.typography.title.fontWeight,
                color: theme.colors.textPrimary,
              }}
            >
              No messages yet
            </div>
            <div
              style={{
                marginTop: theme.spacing.sm,
                fontSize: theme.typography.body.fontSize,
                color: theme.colors.textSecondary,
              }}
            >
              Start a conversation with your network.
            </div>
          </div>
        )}

        {otherThreads.length > 0 ? (
          <>
            <SectionLabel label="Other" />
            {otherThreads.map((thread) => (
              <InboxRow
                key={`other-${thread.id}`}
                world={world}
                thread={thread}
                currentUserId={currentUser?.id ?? null}
                currentUserConnectionIds={connectionIds}
                referenceFrame={referenceFrame}
              />
            ))}
          </>
        ) : null}

        <div
          style={{
            margin: `${theme.spacing.sm}px ${theme.spacing.screenPadding}px ${theme.spacing.xxxl}px`,
            padding: theme.spacing.md,
            borderRadius: theme.radius.card,
            background: theme.colors.surface,
            boxShadow: theme.shadows.card,
            border: `1px solid ${theme.colors.border}`,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: theme.spacing.xs,
              padding: "3px 8px",
              borderRadius: theme.radius.pill,
              background: theme.colors.accentLight,
              color: theme.colors.accent,
              fontSize: theme.typography.micro.fontSize,
              fontWeight: 700,
            }}
          >
            PROMOTED
          </div>
          <div
            style={{
              marginTop: theme.spacing.sm,
              fontSize: theme.typography.body.fontSize,
              color: theme.colors.textPrimary,
            }}
          >
            Want more replies? Premium Messaging unlocks better filtering, InMail, and candidate outreach tools.
          </div>
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          right: theme.spacing.screenPadding,
          bottom: theme.spacing.navHeight + theme.spacing.lg,
          width: theme.spacing.composerHeight,
          height: theme.spacing.composerHeight,
          borderRadius: theme.radius.pill,
          background: theme.colors.accent,
          boxShadow: theme.shadows.fab,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <LIIcon name="compose" size={22} color={theme.colors.textInverse} />
      </div>
    </div>
  );
};
