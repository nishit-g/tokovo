import type { WorldState } from "@tokovo/core";
import type {
  TeamsChannel,
  TeamsDm,
  TeamsMessage,
  TeamsNotification,
  TeamsState,
  TeamsThread,
} from "../types/index.js";

function frameToListLabel(frame?: number): string | undefined {
  if (frame === undefined) return undefined;
  const seconds = Math.max(0, Math.floor(frame / 30));
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h`;
}

export function selectTeamsState(world: Pick<WorldState, "appState">): TeamsState | undefined {
  const raw = world.appState?.app_teams;
  if (!raw || typeof raw !== "object") return undefined;
  return raw as TeamsState;
}

export function selectCurrentSurface(state: TeamsState): TeamsState["screen"] {
  return state.ui.surface;
}

export function selectActiveDm(state: TeamsState): TeamsDm | undefined {
  return state.activeDmId ? state.dms[state.activeDmId] : undefined;
}

export function selectActiveChannel(state: TeamsState): TeamsChannel | undefined {
  return state.activeChannelId ? state.channels[state.activeChannelId] : undefined;
}

export function selectActiveThread(state: TeamsState): TeamsThread | undefined {
  return state.activeThreadId ? state.threads[state.activeThreadId] : undefined;
}

export function selectMessageThreadId(state: TeamsState): string | undefined {
  return state.activeThreadId ?? state.activeDmId;
}

function selectActiveTargetKey(state: TeamsState): string | undefined {
  if (state.activeDmId) return `dm:${state.activeDmId}`;
  if (state.activeChannelId && state.activeThreadId) {
    return `thread:${state.activeChannelId}:${state.activeThreadId}`;
  }
  return undefined;
}

export function selectVisibleMessages(state: TeamsState): TeamsMessage[] {
  const threadId = selectMessageThreadId(state);
  if (!threadId) return [];
  return Object.values(state.messages)
    .filter((message) => message.threadId === threadId)
    .sort((a, b) => a.createdAtFrame - b.createdAtFrame);
}

export function selectNotifications(
  state: TeamsState,
  frame = Number.POSITIVE_INFINITY,
): TeamsNotification[] {
  return state.ui.notificationIds
    .map((id) => state.notifications[id])
    .filter(
      (notification): notification is TeamsNotification =>
        Boolean(notification) &&
        notification.dismissedAtFrame === undefined &&
        notification.expiresAtFrame >= frame,
    );
}

export function selectActiveDraftText(state: TeamsState): string {
  const key = selectActiveTargetKey(state);
  if (key && state.drafts[key]) {
    return state.drafts[key].text;
  }
  if (state.activeDmId) {
    return state.dms[state.activeDmId]?.draftText ?? "";
  }
  if (state.activeThreadId) {
    return state.threads[state.activeThreadId]?.draftText ?? "";
  }
  return "";
}

export function selectActiveTypingUserIds(state: TeamsState): string[] {
  const key = selectActiveTargetKey(state);
  const typingFromMap = key ? state.typing[key]?.userIds ?? [] : [];
  if (typingFromMap.length > 0) {
    return typingFromMap;
  }
  if (state.activeThreadId) {
    return state.threads[state.activeThreadId]?.typingUserIds ?? [];
  }
  return [];
}

export function selectUnreadSummary(state: TeamsState): {
  total: number;
  mentions: number;
} {
  const dms = Object.values(state.dms).reduce(
    (acc, dm) => {
      acc.total += dm.unreadCount;
      acc.mentions += dm.mentionCount;
      return acc;
    },
    { total: 0, mentions: 0 },
  );

  const channels = Object.values(state.channels).reduce(
    (acc, channel) => {
      acc.total += channel.unreadCount;
      acc.mentions += channel.mentionCount;
      return acc;
    },
    { total: 0, mentions: 0 },
  );

  return {
    total: dms.total + channels.total,
    mentions: dms.mentions + channels.mentions,
  };
}

export function selectChatListRows(state: TeamsState) {
  const filter = state.ui.activeListFilter;

  const dmRows = Object.values(state.dms).map((dm) => {
    const lastMessage = dm.lastMessageId ? state.messages[dm.lastMessageId] : undefined;
    const participantIds = dm.participantIds.filter((id) => id !== "u_me");
    const primaryParticipantId = participantIds[0] ?? dm.participantIds[0];
    const primaryParticipant = primaryParticipantId
      ? state.users[primaryParticipantId]
      : undefined;
    const participantNames = participantIds
      .map((id) => state.users[id]?.displayName ?? id)
      .filter(Boolean);
    const title =
      participantNames.length > 2
        ? `${participantNames[0]} +${participantNames.length - 1}`
        : participantNames.join(", ") || primaryParticipant?.displayName || dm.id;

    return {
      id: dm.id,
      kind: "dm" as const,
      title,
      subtitle:
        dm.draftText && dm.draftText.length > 0
          ? `Draft: ${dm.draftText}`
          : lastMessage
            ? `${lastMessage.isFromMe ? "You" : (primaryParticipant?.displayName ?? lastMessage.senderName)}: ${lastMessage.text}`
            : "No messages yet",
      footerLabel: primaryParticipant?.role ?? primaryParticipant?.headline ?? "Direct message",
      unreadCount: dm.unreadCount,
      mentionCount: dm.mentionCount,
      muted: Boolean(dm.muted),
      pinned: Boolean(dm.pinned),
      timeFrame: lastMessage?.createdAtFrame,
      timestampLabel: frameToListLabel(lastMessage?.createdAtFrame),
      presence: primaryParticipantId ? state.presence[primaryParticipantId] : undefined,
      avatarNames: participantNames.length > 0 ? participantNames : [title],
      deliveryState: lastMessage?.isFromMe ? lastMessage.status : undefined,
      isMeeting: participantNames.some((name) => /meeting|standup|sync|review/i.test(name)),
      replyCount: dm.messageIds.length > 1 ? Math.max(0, dm.messageIds.length - 1) : 0,
    };
  });

  const channelRows = Object.values(state.channels).map((channel) => {
    const latestThread = channel.threadIds
      .map((threadId) => state.threads[threadId])
      .filter((thread): thread is TeamsThread => Boolean(thread))
      .sort((a, b) => (b.lastActivityFrame ?? 0) - (a.lastActivityFrame ?? 0))[0];
    const latestMessageId = latestThread?.messageIds[latestThread.messageIds.length - 1];
    const latestMessage = latestMessageId ? state.messages[latestMessageId] : undefined;

    return {
      id: channel.id,
      kind: "channel" as const,
      title: channel.name,
      subtitle:
        latestMessage?.text ??
        channel.description ??
        `${channel.threadIds.length} active thread${channel.threadIds.length === 1 ? "" : "s"}`,
      footerLabel: latestThread?.title ?? `${channel.threadIds.length} active threads`,
      unreadCount: channel.unreadCount,
      mentionCount: channel.mentionCount,
      muted: false,
      pinned: false,
      timeFrame: channel.lastActivityFrame,
      timestampLabel: frameToListLabel(channel.lastActivityFrame),
      presence: undefined,
      avatarNames: [channel.name],
      deliveryState: undefined,
      isMeeting: /meeting|standup|review|town hall/i.test(
        `${latestThread?.title ?? ""} ${latestMessage?.text ?? ""}`,
      ),
      replyCount: latestThread?.replyCount ?? 0,
    };
  });

  const rows = [...dmRows, ...channelRows].sort(
    (a, b) => (b.timeFrame ?? 0) - (a.timeFrame ?? 0),
  );

  if (filter === "unread") {
    return rows.filter((row) => row.unreadCount > 0);
  }
  if (filter === "chat") {
    return rows.filter((row) => row.kind === "dm");
  }
  if (filter === "channels") {
    return rows.filter((row) => row.kind === "channel");
  }
  if (filter === "meetings") {
    return rows.filter((row) => row.isMeeting);
  }
  if (filter === "muted") {
    return rows.filter((row) => row.muted);
  }
  return rows;
}

export function selectChannelFeedRows(state: TeamsState) {
  const channel = selectActiveChannel(state);
  if (!channel) return [];

  return channel.threadIds
    .map((threadId) => state.threads[threadId])
    .filter((thread): thread is TeamsThread => Boolean(thread))
    .sort((a, b) => (b.lastActivityFrame ?? 0) - (a.lastActivityFrame ?? 0))
    .map((thread) => {
      const lastMessageId = thread.messageIds[thread.messageIds.length - 1];
      const lastMessage = lastMessageId ? state.messages[lastMessageId] : undefined;
      return {
        id: thread.id,
        kind: "thread" as const,
        title: thread.title ?? thread.id,
        subtitle: lastMessage?.text ?? "No activity yet",
        footerLabel: `${thread.participantIds.length} participants`,
        timestampLabel: frameToListLabel(thread.lastActivityFrame),
        replyCount: thread.replyCount,
        unreadCount: thread.unreadCount,
        mentionCount: thread.mentionCount,
        typingUserIds: thread.typingUserIds,
      };
    });
}
