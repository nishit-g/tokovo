import React from "react";
import { KeyboardAwareView, ScrollableContent, useKeyboardState } from "@tokovo/react";
import type { TeamsState } from "../../types/index.js";
import {
  selectActiveDm,
  selectActiveDraftText,
  selectActiveThread,
  selectActiveTypingUserIds,
  selectVisibleMessages,
} from "../../selectors/index.js";
import { Composer } from "../shared/Composer.js";
import { HeaderBar } from "../shared/HeaderBar.js";
import { BackIcon, PhoneIcon, VideoIcon } from "../shared/Icons.js";
import { MessageCluster } from "../shared/MessageCluster.js";
import {
  threadContextCardStyle,
  threadContextMetaStyle,
  threadContextTitleStyle,
  threadDatePillStyle,
  threadViewportStyle,
  topSurfaceStyle,
  unreadDividerStyle,
} from "../../styles.js";
import { TEAMS_SELF_USER_ID } from "../../constants.js";

function frameLabel(frame: number): string {
  const seconds = Math.max(0, Math.floor(frame / 30));
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m`;
}

export const ThreadScreen: React.FC<{ state: TeamsState }> = ({ state }) => {
  const keyboardState = useKeyboardState();
  const dm = selectActiveDm(state);
  const thread = selectActiveThread(state);
  const messages = selectVisibleMessages(state);
  const storedDraftText = selectActiveDraftText(state);
  const title =
    dm
      ? state.users[dm.participantIds.find((id) => id !== "u_me") ?? dm.participantIds[0]]?.displayName ?? dm.id
      : thread?.title ?? state.activeThreadId ?? "Thread";
  const subtitle =
    dm
      ? state.users[dm.participantIds.find((id) => id !== "u_me") ?? ""]?.role ??
        state.presence[dm.participantIds.find((id) => id !== "u_me") ?? ""] ??
        "offline"
      : `#${state.activeChannelId ?? "channel"} • ${thread?.participantIds.length ?? 0} people`;

  const draftText =
    keyboardState.isKeyboardVisible && keyboardState.inputText
      ? keyboardState.inputText
      : storedDraftText;
  const typingIds = selectActiveTypingUserIds(state).filter(
    (userId) => userId !== TEAMS_SELF_USER_ID,
  );
  const typingLabel =
    typingIds.length > 0
      ? `${typingIds
          .map((userId) => state.users[userId]?.displayName ?? userId)
          .slice(0, 2)
          .join(", ")} typing`
      : undefined;

  return (
    <KeyboardAwareView style={{ flex: 1, minHeight: 0 }}>
      <div style={topSurfaceStyle}>
        <HeaderBar
          title={title}
          subtitle={subtitle}
          leading={<BackIcon size={20} color="var(--teams-text-secondary)" />}
          trailing={
            <div style={{ display: "flex", gap: 12 }}>
              <VideoIcon size={20} color="var(--teams-text-secondary)" />
              <PhoneIcon size={20} color="var(--teams-text-secondary)" />
            </div>
          }
        />
      </div>
      <ScrollableContent className="tokovo-teams-scrollbar" style={threadViewportStyle}>
        <div style={threadContextCardStyle}>
          <div style={threadContextTitleStyle}>
            {dm ? "Chat details" : `Thread in #${state.activeChannelId ?? "channel"}`}
          </div>
          <div style={threadContextMetaStyle}>
            {dm
              ? "Priority chat with status, mentions, and live drafting."
              : `${thread?.replyCount ?? 0} replies • ${thread?.state ?? "open"} • updates stay scoped to this thread.`}
          </div>
        </div>
        <div style={threadDatePillStyle}>Today</div>
        {thread?.unreadCount ? <div style={unreadDividerStyle}>New messages</div> : null}
        {messages.map((message, index) => {
          const prev = messages[index - 1];
          const next = messages[index + 1];
          const showAvatar = !prev || prev.senderId !== message.senderId;
          const hasPrevSameSender = Boolean(prev && prev.senderId === message.senderId);
          const hasNextSameSender = Boolean(next && next.senderId === message.senderId);
          const clusterPosition = hasPrevSameSender
            ? hasNextSameSender
              ? "middle"
              : "end"
            : hasNextSameSender
              ? "start"
              : "single";
          const senderPresence = state.presence[message.senderId];
          const replyPreview = message.replyToMessageId
            ? state.messages[message.replyToMessageId]?.text
            : undefined;
          return (
            <MessageCluster
              key={message.id}
              senderName={message.senderName}
              text={message.text}
              isMine={message.isFromMe}
              showAvatar={showAvatar}
              presence={senderPresence}
              timeLabel={frameLabel(message.createdAtFrame)}
              replyPreview={replyPreview}
              clusterPosition={clusterPosition}
              deliveryState={message.status}
              showReactionRail={!message.isFromMe && Boolean(message.mentionedUserIds.length || replyPreview)}
            />
          );
        })}
      </ScrollableContent>
      <Composer
        text={draftText}
        typingLabel={typingLabel}
        liveTyping={keyboardState.isKeyboardVisible}
      />
    </KeyboardAwareView>
  );
};
