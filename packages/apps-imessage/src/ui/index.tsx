import React, { useEffect } from "react";
import type { PluginViewProps } from "@tokovo/core";
import { Header, InputBar, MessageBubble, TypingIndicator, ScreenEffect, SearchBar } from "../components";
import { LAYOUT_CONSTANTS, computeMessageGap, iMessageSpacing } from "../config";
import type { IMessageTheme } from "../config/imessage-theme";
import type { IMessageConversation, IMessageMessage, IMessageState } from "../types";
import { injectIMessageStyles } from "../styles";
import { IMessageThemeProvider, useIMessageTheme } from "./ThemeContext";
import type { ScreenEffectType } from "../components/ScreenEffect";

type IMessageViewProps = PluginViewProps & {
  safeAreaInsets?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
};

export const IMessageView: React.FC<IMessageViewProps> = (props) => {
  const world = props.world;

  useEffect(() => {
    injectIMessageStyles();
  }, []);

  const state = world.appState?.app_imessage as IMessageState | undefined;
  const themeMode = state?.themeMode ?? "light";

  if (!state) {
    return (
      <IMessageThemeProvider mode={themeMode}>
        <EmptyState />
      </IMessageThemeProvider>
    );
  }

  const screen = state.currentScreen ?? "list";
  const activeConversationId = state.activeConversationId;

  const renderContent = () => {
    if (screen === "list" || !activeConversationId) {
      return (
        <ConversationListView
          conversations={state.conversations ?? {}}
          safeAreaTop={props.safeAreaInsets?.top}
        />
      );
    }

    if (screen === "info") {
      return (
        <InfoView
          conversation={state.conversations?.[activeConversationId]}
          safeAreaTop={props.safeAreaInsets?.top}
        />
      );
    }

    if (screen === "media") {
      return (
        <MediaView
          conversation={state.conversations?.[activeConversationId]}
          safeAreaTop={props.safeAreaInsets?.top}
        />
      );
    }

    return (
      <ChatView
        conversation={state.conversations?.[activeConversationId]}
        safeAreaTop={props.safeAreaInsets?.top}
        safeAreaBottom={props.safeAreaInsets?.bottom}
        activeScreenEffect={state.activeScreenEffect as ScreenEffectType | undefined}
        searchQuery={state.searchQuery}
      />
    );
  };

  return (
    <IMessageThemeProvider mode={themeMode}>
      {renderContent()}
    </IMessageThemeProvider>
  );
};

const ChatView: React.FC<{
  conversation?: IMessageConversation;
  safeAreaTop?: number;
  safeAreaBottom?: number;
  activeScreenEffect?: ScreenEffectType;
  searchQuery?: string;
}> = ({ conversation, safeAreaTop, safeAreaBottom, activeScreenEffect, searchQuery }) => {
  const theme = useIMessageTheme();

  if (!conversation) {
    return <EmptyState />;
  }

  const messages = conversation.messages ?? [];
  const lastOutgoingId = (() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].fromMe) return messages[i].id;
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
      }}
    >
      <Header
        name={conversation.title || conversation.participants.map((p) => p.name).join(", ") || "Messages"}
        avatar={conversation.avatar}
        isGroup={conversation.isGroup}
        participantCount={conversation.participants.length}
        theme={theme}
        safeAreaTop={safeAreaTop}
      />

      {/* Search bar - visible when search is active */}
      {searchQuery !== undefined && <SearchBar query={searchQuery} />}

      <div
        style={{
          flex: 1,
          padding: iMessageSpacing.listPaddingH,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          overflow: "hidden",
        }}
      >
        {messages.map((message, index) => {
          const prev = messages[index - 1];
          const gap = computeMessageGap(prev, message);
          const showSenderLabel =
            conversation.isGroup &&
            !message.fromMe &&
            (prev?.senderId !== message.senderId || prev?.fromMe);
          const replyPreview = (() => {
            const ref = message.replyTo;
            if (!ref) return undefined;
            if (ref.messageId) {
              const target = messages.find((m) => m.id === ref.messageId);
              return target?.text ?? target?.systemText;
            }
            if (ref.index === "last") {
              const target = messages[messages.length - 1];
              return target?.text ?? target?.systemText;
            }
            if (typeof ref.index === "number") {
              const target = messages[ref.index];
              return target?.text ?? target?.systemText;
            }
            return undefined;
          })();
          return (
            <div key={message.id} style={{ marginBottom: gap }}>
              <MessageBubble
                message={message}
                isSMS={conversation.transport === "sms"}
                showTail={shouldShowTail(messages, index)}
                theme={theme}
                showSenderLabel={showSenderLabel}
                senderLabel={message.senderName ?? message.senderId}
                showStatus={message.fromMe && message.id === lastOutgoingId}
                replyPreview={replyPreview}
              />
            </div>
          );
        })}

        {typingUsers.length > 0 && <TypingIndicator theme={theme} />}
      </div>

      <InputBar theme={theme} draft={conversation.draft} safeAreaBottom={safeAreaBottom} />

      {/* Screen effect overlay */}
      {activeScreenEffect && <ScreenEffect effect={activeScreenEffect} />}
    </div>
  );
};

const ConversationListView: React.FC<{
  conversations: Record<string, IMessageConversation>;
  safeAreaTop?: number;
}> = ({ conversations, safeAreaTop }) => {
  const theme = useIMessageTheme();
  const list = Object.values(conversations).sort(
    (a, b) => (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0),
  );
  const topInset = safeAreaTop ?? iMessageSpacing.safeAreaTop;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: theme.colors.system.background,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          paddingTop: topInset,
          padding: iMessageSpacing.listPaddingH,
          borderBottom: `1px solid ${theme.colors.system.separator}`,
        }}
      >
        <h1
          style={{
            fontFamily: theme.typography.headerTitle.family,
            fontSize: theme.typography.headerTitle.size,
            fontWeight: 700,
            color: theme.colors.header.title,
            margin: 0,
          }}
        >
          Messages
        </h1>
      </div>
      <div style={{ flex: 1, overflow: "hidden" }}>
        {list.map((conv) => (
          <ConversationListItem key={conv.id} conversation={conv} />
        ))}
      </div>
    </div>
  );
};

const ConversationListItem: React.FC<{
  conversation: IMessageConversation;
}> = ({ conversation }) => {
  const theme = useIMessageTheme();
  const lastMessage = conversation.messages[conversation.messages.length - 1];

  return (
    <div
      style={{
        height: iMessageSpacing.listItemHeight,
        display: "flex",
        alignItems: "center",
        padding: `0 ${iMessageSpacing.listPaddingH}px`,
        borderBottom: `1px solid ${theme.colors.system.separator}`,
      }}
    >
      <div
        style={{
          width: iMessageSpacing.listAvatarSize,
          height: iMessageSpacing.listAvatarSize,
          borderRadius: "50%",
          backgroundColor: theme.colors.bubble.received,
          marginRight: iMessageSpacing.listAvatarGap,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {conversation.avatar ? (
          <img
            src={conversation.avatar}
            alt={conversation.title ?? conversation.id}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span
            style={{
              fontFamily: theme.typography.headerTitle.family,
              fontSize: theme.typography.headerTitle.size,
              fontWeight: 500,
              color: theme.colors.system.timestamp,
            }}
          >
            {(conversation.title ?? conversation.id).charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: theme.typography.listTitle.family,
            fontSize: theme.typography.listTitle.size,
            fontWeight: conversation.unreadCount > 0 ? 600 : 400,
            color: theme.colors.header.title,
          }}
        >
          {conversation.title ?? conversation.id}
        </div>
        {lastMessage ? (
          <div
            style={{
              fontFamily: theme.typography.listSubtitle.family,
              fontSize: theme.typography.listSubtitle.size,
              color: theme.colors.system.timestamp,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {lastMessage.text || lastMessage.systemText || "Media"}
          </div>
        ) : null}
      </div>
      {conversation.unreadCount > 0 && (
        <div
          style={{
            width: iMessageSpacing.listUnreadBadgeSize,
            height: iMessageSpacing.listUnreadBadgeSize,
            borderRadius: iMessageSpacing.listUnreadBadgeSize / 2,
            backgroundColor: theme.colors.system.unreadBadge,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: theme.typography.timestamp.family,
            fontSize: 12,
            fontWeight: 600,
            color: "#FFFFFF",
          }}
        >
          {conversation.unreadCount}
        </div>
      )}
    </div>
  );
};

const InfoView: React.FC<{
  conversation?: IMessageConversation;
  safeAreaTop?: number;
}> = ({ conversation, safeAreaTop }) => {
  const theme = useIMessageTheme();

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: theme.colors.system.background,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header
        name="Info"
        avatar={conversation?.avatar}
        theme={theme}
        safeAreaTop={safeAreaTop}
      />
      <div style={{ padding: iMessageSpacing.screenPaddingH, color: theme.colors.system.timestamp }}>
        Group info, media, and member controls go here.
      </div>
    </div>
  );
};

const MediaView: React.FC<{
  conversation?: IMessageConversation;
  safeAreaTop?: number;
}> = ({ conversation, safeAreaTop }) => {
  const theme = useIMessageTheme();

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: theme.colors.system.background,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header
        name="Media"
        avatar={conversation?.avatar}
        theme={theme}
        safeAreaTop={safeAreaTop}
      />
      <div style={{ padding: iMessageSpacing.screenPaddingH, color: theme.colors.system.timestamp }}>
        Media grid goes here.
      </div>
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

function shouldShowTail(messages: IMessageMessage[], index: number) {
  if (index === messages.length - 1) return true;
  const current = messages[index];
  const next = messages[index + 1];
  if (next.isSystem) return true;
  return current.fromMe !== next.fromMe;
}

export default IMessageView;
