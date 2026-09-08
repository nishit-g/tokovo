import React from "react";
import { AnimatedImage, staticFile } from "remotion";
import { resolveStaticAssetSrc } from "@tokovo/core";
import { DeterministicImage as Img } from "@tokovo/react";
import { requireAppStateForDevice, type PluginViewProps } from "@tokovo/core";
import { useInputField, useKeyboardHeight, useLayout } from "@tokovo/react";
import type { ChatLayoutState } from "@tokovo/core";
import { dateLabel, messageGeometry } from "../layout/message.js";
import {
  Header,
  InputBar,
  MessageBubble,
  TypingIndicator,
  ScreenEffect,
  SearchBar,
} from "../components/index.js";
import { iMessageSpacing, getReplyPreview, shouldShowTail } from "../config/index.js";
import { ConversationAvatar } from "../components/ConversationAvatar.js";
import { iMessageTypography } from "../config/tokens.js";
import type { IMessageConversation, IMessageState } from "../types/index.js";
import { IMessageThemeProvider, useIMessageTheme } from "./ThemeContext.js";
import type { ScreenEffectType } from "../components/ScreenEffect.js";

type IMessageViewProps = PluginViewProps;

export const IMessageView: React.FC<IMessageViewProps> = (props) => {
  const world = props.world;
  const layout = useLayout<ChatLayoutState>();

  const state = requireAppStateForDevice<IMessageState>(world, "app_imessage", props.deviceId);
  const themeMode = state.themeMode ?? "light";

  const screen = state.currentScreen ?? "list";
  const activeConversationId = state.activeConversationId;

  const renderContent = () => {
    if (screen === "list" || !activeConversationId) {
      return (
        <ConversationListView
          conversations={state.conversations ?? {}}
          contentInsetTop={props.appViewport.interactiveInsets.top}
        />
      );
    }

    if (screen === "info") {
      return (
        <InfoView
          conversation={state.conversations?.[activeConversationId]}
          contentInsetTop={props.appViewport.interactiveInsets.top}
        />
      );
    }

    if (screen === "media") {
      return (
        <MediaView
          conversation={state.conversations?.[activeConversationId]}
          contentInsetTop={props.appViewport.interactiveInsets.top}
        />
      );
    }

    if (!layout || layout.kind !== "CHAT") throw new Error("IMESSAGE_CHAT_LAYOUT_MISSING");
    return (
      <ChatView
        world={world}
        deviceId={props.deviceId}
        t={props.t}
        width={props.width}
        layout={layout}
        conversation={state.conversations?.[activeConversationId]}
        contentInsetTop={props.appViewport.interactiveInsets.top}
        contentInsetBottom={props.appViewport.interactiveInsets.bottom}
        activeScreenEffect={state.activeScreenEffect as ScreenEffectType | undefined}
        activeScreenEffectStartedAtFrame={state.activeScreenEffectStartedAtFrame}
        searchQuery={state.searchQuery}
      />
    );
  };

  return <IMessageThemeProvider mode={themeMode}>{renderContent()}</IMessageThemeProvider>;
};

const ChatView: React.FC<{
  world: PluginViewProps["world"];
  deviceId: string;
  t: number;
  width: number;
  layout: ChatLayoutState;
  conversation?: IMessageConversation;
  contentInsetTop: number;
  contentInsetBottom: number;
  activeScreenEffect?: ScreenEffectType;
  activeScreenEffectStartedAtFrame?: number;
  searchQuery?: string;
}> = ({
  world: _world,
  deviceId: _deviceId,
  t,
  width,
  layout,
  conversation,
  contentInsetTop,
  contentInsetBottom,
  activeScreenEffect,
  activeScreenEffectStartedAtFrame,
  searchQuery,
}) => {
  const theme = useIMessageTheme();

  const composerInput = useInputField("composer");
  const keyboardHeight = useKeyboardHeight();
  if (!conversation) {
    return <EmptyState />;
  }

  const draftText = composerInput?.value ?? conversation.draft ?? "";

  const messages = (conversation.messages ?? []).filter((message) => message.timestamp <= t);
  const thread = layout.semantic?.regions.imessage_thread?.rect;
  const composer = layout.semantic?.regions.imessage_composer?.rect;
  if (!thread || !composer) throw new Error("IMESSAGE_CHAT_CHROME_MISSING");
  const lastOutgoingId = (() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].fromMe && !messages[i].isUnsent && !messages[i].isSystem)
        return messages[i].id;
    }
    return undefined;
  })();
  const typingUsers = Object.entries(conversation.typing || {})
    .filter(([, value]) => value)
    .map(([userId]) => userId);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: theme.colors.system.chatBackground,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Header
        name={
          conversation.title ||
          conversation.participants.map((p) => p.name).join(", ") ||
          "Messages"
        }
        avatar={
          conversation.avatar ??
          (!conversation.isGroup
            ? conversation.participants.find((participant) => !participant.isMe)?.avatar
            : undefined)
        }
        isGroup={conversation.isGroup}
        participantCount={conversation.participants.length}
        contentInsetTop={contentInsetTop}
      />

      {/* Search bar - visible when search is active */}
      {searchQuery !== undefined && <SearchBar query={searchQuery} />}

      <div
        style={{
          position: "absolute",
          top: thread.y,
          height: thread.height,
          width: "100%",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "relative",
            height: layout.contentHeight,
            transform: `translateY(${-layout.scrollY}px)`,
          }}
        >
          <div
            style={{
              textAlign: "center",
              color: theme.colors.system.timestamp,
              fontFamily: theme.typography.timestamp.family,
              fontSize: 11,
              lineHeight: "16px",
              marginBottom: 14,
              paddingTop: 16,
            }}
          >
            {conversation.transport === "sms" ? "Text Message" : "iMessage"}
          </div>
          {messages.map((message, index) => {
            const prev = messages[index - 1];
            const showSenderLabel =
              conversation.isGroup &&
              !message.fromMe &&
              (prev?.senderId !== message.senderId || prev?.fromMe);
            const replyPreview = getReplyPreview(messages, index);
            const item = layout.messageLayouts[message.id];
            if (!item?.rect) throw new Error(`IMESSAGE_MESSAGE_LAYOUT_MISSING: ${message.id}`);
            const geometry = messageGeometry(
              message,
              width,
              replyPreview,
              Boolean(showSenderLabel),
              message.id === lastOutgoingId,
            );
            const label = dateLabel(message, prev);
            const replyRef = message.replyTo;
            const replyTarget =
              messages
                .slice(0, index)
                .find((candidate) => candidate.id === (replyRef?.messageId ?? replyRef?.id)) ??
              (replyRef?.index === "last"
                ? prev
                : typeof replyRef?.index === "number"
                  ? messages[replyRef.index]
                  : undefined);
            return (
              <React.Fragment key={message.id}>
                {label && (
                  <div
                    style={{
                      position: "absolute",
                      top: item.y - thread.y + layout.scrollY - 30,
                      width: "100%",
                      textAlign: "center",
                      fontSize: 11,
                      lineHeight: "16px",
                      color: theme.colors.system.timestamp,
                    }}
                  >
                    {label}
                  </div>
                )}
                <div
                  style={{
                    position: "absolute",
                    left: item.rect.x,
                    top: item.y - thread.y + layout.scrollY,
                    width: item.rect.width,
                    height: item.height,
                    opacity: item.opacity,
                    transform: `translateY(${item.translateY}px)`,
                  }}
                >
                  <MessageBubble
                    message={message}
                    isSMS={conversation.transport === "sms"}
                    showTail={shouldShowTail(messages, index)}
                    theme={theme}
                    showSenderLabel={showSenderLabel}
                    senderLabel={message.senderName ?? message.senderId}
                    showStatus={message.fromMe && message.id === lastOutgoingId}
                    replyPreview={replyPreview}
                    replySender={
                      replyTarget?.fromMe
                        ? "You"
                        : (replyTarget?.senderName ?? replyTarget?.senderId)
                    }
                    replyThumbnail={
                      replyTarget?.isUnsent
                        ? undefined
                        : replyTarget?.attachments?.find(
                            (attachment) => attachment.kind === "image",
                          )?.url
                    }
                    geometry={geometry}
                  />
                </div>
              </React.Fragment>
            );
          })}

          {typingUsers.length > 0 && layout.typingLayout && (
            <div
              style={{
                position: "absolute",
                left: 16,
                top: layout.typingLayout.y - thread.y + layout.scrollY - 12,
              }}
            >
              <TypingIndicator />
            </div>
          )}
        </div>
      </div>

      <div style={{ position: "absolute", top: composer.y, width: "100%" }}>
        <InputBar
          width={width}
          draft={draftText}
          isSMS={conversation.transport === "sms"}
          contentInsetBottom={Math.max(0, contentInsetBottom - keyboardHeight)}
          showCursor={composerInput?.isKeyboardVisible ?? false}
          inputDirection={composerInput?.direction}
          inputLanguage={composerInput?.locale.tag}
          selection={composerInput?.selection}
          lastActivityFrame={composerInput?.lastActivityFrame}
        />
      </div>

      {/* Screen effect overlay */}
      {activeScreenEffect && activeScreenEffectStartedAtFrame !== undefined ? (
        <ScreenEffect effect={activeScreenEffect} startFrame={activeScreenEffectStartedAtFrame} />
      ) : null}
    </div>
  );
};

const ConversationListView: React.FC<{
  conversations: Record<string, IMessageConversation>;
  contentInsetTop: number;
}> = ({ conversations, contentInsetTop }) => {
  const theme = useIMessageTheme();
  const list = Object.values(conversations).sort(
    (a, b) =>
      Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) ||
      (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0),
  );
  const toolbarButton: React.CSSProperties = {
    border: 0,
    background: "transparent",
    padding: 0,
    height: 44,
    minWidth: 44,
    color: theme.colors.header.icons,
    font: "inherit",
  };
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: theme.colors.system.background,
        fontFamily: theme.typography.message.family,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        data-cinematic-subject="imessage_list_header"
        style={{
          paddingTop: contentInsetTop,
          height: contentInsetTop + iMessageSpacing.listHeaderHeight,
          flexShrink: 0,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            height: 44,
            paddingInline: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <button type="button" aria-label="Edit conversations" style={toolbarButton}>
            Edit
          </button>
          <button type="button" aria-label="New message" style={toolbarButton}>
            <svg
              width="25"
              height="25"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M12 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-7M14 4l4-3 4 4-12 12-5 1 1-5Z" />
            </svg>
          </button>
        </div>
        <h1
          style={{
            ...iMessageTypography.largeTitle,
            lineHeight: `${iMessageTypography.largeTitle.lineHeight}px`,
            height: 52,
            boxSizing: "border-box",
            padding: "4px 16px 7px",
            margin: 0,
            color: theme.colors.header.title,
          }}
        >
          Messages
        </h1>
        <SearchBar />
      </header>
      <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
        {list.map((conversation) => (
          <ConversationListItem key={conversation.id} conversation={conversation} />
        ))}
      </div>
    </div>
  );
};

export const ConversationListItem: React.FC<{ conversation: IMessageConversation }> = ({
  conversation,
}) => {
  const theme = useIMessageTheme();
  const lastMessage = conversation.messages[conversation.messages.length - 1];
  const name =
    conversation.title ??
    conversation.participants
      .filter((p) => !p.isMe)
      .map((p) => p.name)
      .join(", ");
  const preview =
    conversation.draft ||
    (lastMessage?.isUnsent
      ? lastMessage.fromMe
        ? "You unsent a message"
        : `${lastMessage.senderName ?? "Someone"} unsent a message`
      : lastMessage?.text ||
        lastMessage?.systemText ||
        (lastMessage?.attachments?.length ? "Attachment" : "No messages"));
  return (
    <div
      aria-label={
        conversation.unreadCount > 0 ? `${name}, ${conversation.unreadCount} unread messages` : name
      }
      style={{
        height: iMessageSpacing.listItemHeight,
        display: "flex",
        alignItems: "center",
        padding: "0 16px 0 24px",
        gap: iMessageSpacing.listAvatarGap,
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      {conversation.unreadCount > 0 && (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 8,
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: theme.colors.system.unreadBadge,
          }}
        />
      )}
      <ConversationAvatar
        name={name}
        src={
          conversation.avatar ??
          (!conversation.isGroup
            ? conversation.participants.find((participant) => !participant.isMe)?.avatar
            : undefined)
        }
        size={iMessageSpacing.listAvatarSize}
        isGroup={conversation.isGroup}
      />
      <div
        style={{
          flex: 1,
          minWidth: 0,
          height: "100%",
          borderBottom: `0.5px solid ${theme.colors.system.separator}`,
          boxSizing: "border-box",
          paddingTop: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              ...iMessageTypography.listTitle,
              lineHeight: `${iMessageTypography.listTitle.lineHeight}px`,
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              color: theme.colors.header.title,
            }}
          >
            {name}
          </span>
          {lastMessage?.sentAt !== undefined && (
            <span style={{ fontSize: 13, color: theme.colors.system.timestamp }}>
              {new Intl.DateTimeFormat("en-US", {
                hour: "numeric",
                minute: "2-digit",
                timeZone: "UTC",
              }).format(lastMessage.sentAt)}
            </span>
          )}
          <svg
            width="8"
            height="12"
            viewBox="0 0 8 12"
            fill="none"
            stroke={theme.colors.system.timestamp}
            strokeWidth="1.4"
            aria-hidden="true"
          >
            <path d="m1 1 5 5-5 5" />
          </svg>
        </div>
        <div
          style={{
            ...iMessageTypography.listPreview,
            lineHeight: `${iMessageTypography.listPreview.lineHeight}px`,
            color: theme.colors.system.timestamp,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {conversation.draft && <span style={{ color: theme.colors.bubble.sms }}>Draft: </span>}
          {preview}
        </div>
      </div>
    </div>
  );
};

const InfoView: React.FC<{
  conversation?: IMessageConversation;
  contentInsetTop: number;
}> = ({ conversation, contentInsetTop }) => {
  const theme = useIMessageTheme();
  const name = conversation?.title ?? "Conversation";
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: theme.colors.system.chatBackground,
        color: theme.colors.header.title,
        fontFamily: theme.typography.message.family,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header name="Details" contentInsetTop={contentInsetTop} compact />
      <div
        style={{
          padding: 24,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        <ConversationAvatar
          name={name}
          src={conversation?.avatar}
          size={80}
          isGroup={conversation?.isGroup}
        />
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600 }}>{name}</h1>
        <span style={{ color: theme.colors.system.timestamp, fontSize: 13 }}>
          {conversation?.transport === "sms" ? "Text Message" : "iMessage"}
        </span>
      </div>
      <section
        aria-label="Participants"
        style={{
          margin: 16,
          padding: "0 16px",
          background: theme.colors.bubble.received,
          borderRadius: 14,
        }}
      >
        {conversation?.participants.map((participant, index) => (
          <div
            key={participant.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              paddingBlock: 12,
              borderTop: index ? `0.5px solid ${theme.colors.system.separator}` : undefined,
            }}
          >
            <ConversationAvatar name={participant.name} src={participant.avatar} size={36} />
            <span style={{ fontSize: 16 }}>{participant.name}</span>
            {participant.isMe && (
              <span
                style={{ marginLeft: "auto", color: theme.colors.system.timestamp, fontSize: 13 }}
              >
                You
              </span>
            )}
          </div>
        ))}
      </section>
    </div>
  );
};

const MediaView: React.FC<{
  conversation?: IMessageConversation;
  contentInsetTop: number;
}> = ({ conversation, contentInsetTop }) => {
  const theme = useIMessageTheme();
  const media =
    conversation?.messages
      .flatMap((message) => (message.isUnsent ? [] : (message.attachments ?? [])))
      .filter((attachment) => attachment.kind === "image" || attachment.kind === "gif") ?? [];
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: theme.colors.system.background,
        fontFamily: theme.typography.message.family,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header name="Photos" contentInsetTop={contentInsetTop} compact />
      {media.length ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 3,
            padding: 3,
          }}
        >
          {media.map((attachment, index) => {
            const Image = attachment.kind === "gif" ? AnimatedImage : Img;
            return (
              <Image
                key={index}
                src={
                  attachment.kind === "gif"
                    ? resolveStaticAssetSrc(attachment.url, (path) =>
                        staticFile(path.replace(/^\//, "")),
                      )
                    : attachment.url
                }
                alt={
                  attachment.kind === "image"
                    ? (attachment.caption ?? "Shared photo")
                    : "Shared animation"
                }
                style={{ width: "100%", aspectRatio: "1", objectFit: "cover" }}
              />
            );
          })}
        </div>
      ) : (
        <div
          style={{
            flex: 1,
            display: "grid",
            placeItems: "center",
            color: theme.colors.system.timestamp,
            fontSize: 17,
          }}
        >
          No photos shared
        </div>
      )}
    </div>
  );
};

const EmptyState: React.FC = () => {
  const theme = useIMessageTheme();

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: theme.colors.system.background,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <span
        style={{
          fontFamily: theme.typography.headerTitle.family,
          fontSize: 20,
          color: theme.colors.system.timestamp,
        }}
      >
        No messages
      </span>
    </div>
  );
};

export default IMessageView;
