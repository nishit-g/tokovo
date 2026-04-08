/**
 * Microsoft Teams View — 1:1 Pixel-accurate Mobile UI
 *
 * Every detail matches real Teams mobile:
 * - Header: hamburger left, "Chat" title left-aligned, bell + avatar right
 * - All / Unread filter tabs (NOT Chat/Channels)
 * - Linear message feed: ALL messages left-aligned with avatar, name, text, time
 * - Compose bar: paperclip, text field, smiley, mic
 * - Bottom tab bar: Chat, Teams, Calendar, Calls, More (SVG icons)
 * - Avatar circles with presence indicator dots
 * - Presence-aware status subtitles
 * - Safe area insets + keyboard-aware layout
 */

import React, { useEffect, useRef } from "react";
import { useKeyboardHeight, useKeyboardState, useSafeAreaInsets } from "@tokovo/react";
import type { PluginViewProps } from "@tokovo/core";
import { TEAMS_APP_ID } from "../constants.js";
import type { TeamsState } from "../types/index.js";
import {
  teamsTheme,
  shellBaseStyle,
  appBodyStyle,
  headerStyle,
  headerTitleStyle,
  headerMetaStyle,
  filterTabsContainerStyle,
  filterTabStyle,
  listViewportStyle,
  chatRowStyle,
  unreadBadgeStyle,
  rowMetaStyle,
  threadPaneStyle,
  messageRowStyle,
  messageSenderStyle,
  messageTextStyle,
  messageTimeStyle,
  composerStyle,
  composerInputStyle,
  tabBarStyle,
  tabItemStyle,
  avatarStyle,
  presenceDotStyle,
  callSurfaceStyle,
  callHeaderStyle,
  callGridStyle,
  participantCardStyle,
  callControlsWrapStyle,
  callControlStyle,
  endCallControlStyle,
  injectTeamsStyles,
} from "../styles.js";

const FONT = "'Segoe UI Variable', 'Segoe UI', system-ui, sans-serif";

function getState(world: PluginViewProps["world"]): TeamsState {
  const state = world.appState?.[TEAMS_APP_ID];
  if (state && typeof state === "object" && "screen" in state && "viewMode" in state) {
    return state as TeamsState;
  }
  return {
    viewMode: "FEED",
    screen: "chat_list",
    users: {},
    dms: {},
    channels: {},
    threads: {},
    messages: {},
    notifications: {},
    presence: {},
    calls: {},
  };
}

// =============================================================================
// SVG ICONS — Fluent UI style (thin 1.5px stroke)
// =============================================================================

const HamburgerIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = teamsTheme.color.textSecondary }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const BellIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = teamsTheme.color.textSecondary }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);

const BackIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = teamsTheme.color.textSecondary }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const PhoneIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = teamsTheme.color.textSecondary }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
  </svg>
);

const VideoIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = teamsTheme.color.textSecondary }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

const PaperclipIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = teamsTheme.color.textSecondary }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
  </svg>
);

const SmileyIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = teamsTheme.color.textSecondary }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
);

const MicIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = teamsTheme.color.textSecondary }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
    <path d="M19 10v2a7 7 0 01-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);

const SendIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = "#ffffff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

// Bottom tab bar SVG icons
const ChatTabIcon: React.FC<{ size?: number; color?: string }> = ({ size = 22, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);

const TeamsTabIcon: React.FC<{ size?: number; color?: string }> = ({ size = 22, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const CalendarTabIcon: React.FC<{ size?: number; color?: string }> = ({ size = 22, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const CallsTabIcon: React.FC<{ size?: number; color?: string }> = ({ size = 22, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
  </svg>
);

const MoreTabIcon: React.FC<{ size?: number; color?: string }> = ({ size = 22, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round">
    <circle cx="5" cy="12" r="1.5" fill={color} />
    <circle cx="12" cy="12" r="1.5" fill={color} />
    <circle cx="19" cy="12" r="1.5" fill={color} />
  </svg>
);

// Call control icons
const MicControlIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = "#ffffff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" />
    <path d="M19 10v2a7 7 0 01-14 0v-2" />
  </svg>
);

const ScreenShareIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = "#ffffff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

const HandIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = "#ffffff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 11V6a2 2 0 00-4 0v1" />
    <path d="M14 10V4a2 2 0 00-4 0v6" />
    <path d="M10 10.5V6a2 2 0 00-4 0v8" />
    <path d="M18 8a2 2 0 014 0v7a8 8 0 01-8 8h-2c-2.21 0-4.5-1.5-6-3.5L4 16" />
  </svg>
);

const EndCallIcon: React.FC<{ size?: number; color?: string }> = ({ size = 22, color = "#ffffff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.68 13.31a16 16 0 003.41 2.6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91" />
    <line x1="23" y1="1" x2="1" y2="23" />
  </svg>
);

// =============================================================================
// AVATAR WITH PRESENCE DOT
// =============================================================================

const Avatar: React.FC<{
  name: string;
  size?: number;
  presence?: string;
  bgColor?: string;
}> = ({ name, size = 40, presence, bgColor }) => {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div style={{ ...avatarStyle(size), backgroundColor: bgColor ?? teamsTheme.color.brand }}>
      <span>{initials}</span>
      {presence && <div style={presenceDotStyle(presence, size)} />}
    </div>
  );
};

// =============================================================================
// BOTTOM TAB BAR — Chat / Teams / Calendar / Calls / More
// =============================================================================

const TAB_ITEMS = [
  { id: "chat", label: "Chat", Icon: ChatTabIcon },
  { id: "teams", label: "Teams", Icon: TeamsTabIcon },
  { id: "calendar", label: "Calendar", Icon: CalendarTabIcon },
  { id: "calls", label: "Calls", Icon: CallsTabIcon },
  { id: "more", label: "More", Icon: MoreTabIcon },
] as const;

const BottomTabBar: React.FC<{ activeTab?: string }> = ({ activeTab = "chat" }) => (
  <div style={tabBarStyle}>
    {TAB_ITEMS.map((tab) => {
      const active = tab.id === activeTab;
      const color = active ? teamsTheme.color.tabBarActive : teamsTheme.color.tabBarInactive;
      return (
        <div key={tab.id} style={tabItemStyle(active)}>
          <tab.Icon size={22} color={color} />
          <span>{tab.label}</span>
          {active && (
            <div
              style={{
                position: "absolute",
                top: -1,
                width: 24,
                height: 3,
                borderRadius: 1.5,
                backgroundColor: teamsTheme.color.tabBarActive,
              }}
            />
          )}
        </div>
      );
    })}
  </div>
);

// =============================================================================
// CHAT LIST SCREEN
// =============================================================================

function ChatList({ state }: { state: TeamsState }) {
  const dmRows = Object.values(state.dms).map((dm) => {
    const lastId = dm.messageIds[dm.messageIds.length - 1];
    const msg = lastId ? state.messages[lastId] : undefined;
    const participant = dm.participantIds?.[0];
    const user = participant ? state.users[participant] : undefined;
    const presence = state.presence[participant ?? ""] ?? "offline";

    // Presence-aware subtitle
    let statusText = "";
    if (msg) {
      statusText = msg.text.length > 40 ? msg.text.slice(0, 40) + "…" : msg.text;
    } else {
      statusText = presence === "available" ? "Active now" : presence === "away" ? "Away" : "Offline";
    }

    return {
      id: dm.id,
      title: user?.displayName ?? dm.id,
      preview: statusText,
      unread: dm.unreadCount,
      presence,
      time: msg ? "2m" : "",
    };
  });

  const channelRows = Object.values(state.channels).map((channel) => ({
    id: channel.id,
    title: `# ${channel.name}`,
    preview: `${channel.threadIds.length} thread(s)`,
    unread: channel.unreadCount,
    presence: undefined as string | undefined,
    time: "",
  }));

  const allRows = [...dmRows, ...channelRows];

  return (
    <>
      {/* Header: hamburger, title, bell, avatar */}
      <div style={headerStyle}>
        <HamburgerIcon size={20} color={teamsTheme.color.textSecondary} />
        <span style={headerTitleStyle}>Chat</span>
        <BellIcon size={20} color={teamsTheme.color.textSecondary} />
        <Avatar name="Me" size={28} presence="available" />
      </div>

      {/* Filter tabs: All / Unread */}
      <div style={filterTabsContainerStyle}>
        <div style={filterTabStyle(true)}>All</div>
        <div style={filterTabStyle(false)}>Unread</div>
        <div style={filterTabStyle(false)}>Muted</div>
      </div>

      {/* List */}
      <div style={listViewportStyle}>
        {allRows.map((row) => (
          <div key={row.id} style={chatRowStyle}>
            <Avatar
              name={row.title}
              size={40}
              presence={row.presence}
              bgColor={row.title.startsWith("#") ? teamsTheme.color.info : undefined}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: row.unread > 0 ? 600 : 400,
                    color: teamsTheme.color.textPrimary,
                    fontFamily: FONT,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flex: 1,
                  }}
                >
                  {row.title}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, marginLeft: 8 }}>
                  {row.time && (
                    <span style={{ fontSize: 11, color: teamsTheme.color.textMuted, fontFamily: FONT }}>
                      {row.time}
                    </span>
                  )}
                  {row.unread > 0 && <span style={unreadBadgeStyle}>{row.unread}</span>}
                </div>
              </div>
              <div
                style={{
                  ...rowMetaStyle,
                  marginTop: 2,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {row.preview}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// =============================================================================
// CHANNEL FEED
// =============================================================================

function ChannelFeedView({ state }: { state: TeamsState }) {
  const channel = state.activeChannelId ? state.channels[state.activeChannelId] : undefined;
  const threadRows = Object.values(state.threads)
    .filter((thread) => thread.channelId === state.activeChannelId)
    .map((thread) => {
      const lastMessageId = thread.messageIds[thread.messageIds.length - 1];
      const last = lastMessageId ? state.messages[lastMessageId] : undefined;
      return {
        id: thread.id,
        title: thread.topic ?? thread.id,
        preview: last?.text ?? "No messages yet",
        count: thread.messageIds.length,
      };
    });

  return (
    <>
      <div style={headerStyle}>
        <BackIcon size={20} color={teamsTheme.color.textSecondary} />
        <div style={{ flex: 1 }}>
          <div style={headerTitleStyle}>{channel ? `# ${channel.name}` : "Channel"}</div>
          <div style={headerMetaStyle}>{threadRows.length} threads</div>
        </div>
      </div>
      <div style={listViewportStyle}>
        {threadRows.map((row) => (
          <div key={row.id} style={chatRowStyle}>
            <Avatar name={row.title} size={36} bgColor={teamsTheme.color.info} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <strong style={{ fontFamily: FONT, fontSize: 14 }}>{row.title}</strong>
                <span style={{ ...rowMetaStyle, fontSize: 11 }}>{row.count} replies</span>
              </div>
              <div style={{ ...rowMetaStyle, marginTop: 2 }}>{row.preview}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// =============================================================================
// THREAD VIEW — LINEAR MESSAGE FEED (all left-aligned)
// =============================================================================

function ThreadView({ state, keyboardHeight }: { state: TeamsState; keyboardHeight: number }) {
  const activeThreadId = state.activeThreadId ?? state.activeDmId;
  const messages = Object.values(state.messages)
    .filter((m) => m.threadId === activeThreadId)
    .sort((a, b) => a.createdAtFrame - b.createdAtFrame);

  // Resolve thread title from participant name
  let threadTitle = "Thread";
  if (state.activeDmId) {
    const dm = state.dms[state.activeDmId];
    const participantId = dm?.participantIds?.[0];
    const user = participantId ? state.users[participantId] : undefined;
    threadTitle = user?.displayName ?? state.activeDmId;
  } else if (state.activeThreadId) {
    const thread = state.threads[state.activeThreadId];
    threadTitle = thread?.topic ?? state.activeThreadId;
  }

  // Presence
  const activeDm = state.activeDmId ? state.dms[state.activeDmId] : undefined;
  const firstParticipant = activeDm?.participantIds?.[0];
  const presence = firstParticipant ? (state.presence[firstParticipant] ?? "offline") : "offline";
  const presenceLabel = presence === "available" ? "Active now"
    : presence === "busy" ? "Busy"
      : presence === "away" ? "Away"
        : "Offline";

  const messageListRef = useRef<HTMLDivElement>(null);
  const lastMessageId = messages[messages.length - 1]?.id;
  const keyboardState = useKeyboardState();
  const composerText = keyboardState.inputText;

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages.length, lastMessageId, keyboardHeight]);

  return (
    <>
      {/* Thread header */}
      <div style={headerStyle}>
        <BackIcon size={20} color={teamsTheme.color.textSecondary} />
        <Avatar name={threadTitle} size={32} presence={presence} />
        <div style={{ flex: 1 }}>
          <div style={{ ...headerTitleStyle, fontSize: 15 }}>{threadTitle}</div>
          <div style={headerMetaStyle}>{presenceLabel}</div>
        </div>
        <VideoIcon size={20} color={teamsTheme.color.textSecondary} />
        <PhoneIcon size={20} color={teamsTheme.color.textSecondary} />
      </div>

      {/* Linear message feed — ALL messages left-aligned */}
      <div ref={messageListRef} style={threadPaneStyle}>
        {messages.map((message, idx) => {
          // Show sender name for first message or when sender changes
          const prev = messages[idx - 1];
          const showSender = !prev || prev.senderId !== message.senderId;
          const senderUser = state.users[message.senderId];
          const senderName = senderUser?.displayName ?? message.senderName;
          const isMine = message.senderId === "u_me" || message.senderName === "Me" || message.senderName === "You";

          return (
            <div key={message.id} style={messageRowStyle}>
              {/* Avatar (only shown when sender changes) */}
              <div style={{ width: 28, flexShrink: 0 }}>
                {showSender && (
                  <Avatar
                    name={senderName}
                    size={28}
                    bgColor={isMine ? teamsTheme.color.brand : undefined}
                  />
                )}
              </div>
              {/* Message content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {showSender && (
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={messageSenderStyle}>{senderName}</span>
                    <span style={messageTimeStyle}>just now</span>
                  </div>
                )}
                <div style={messageTextStyle}>{message.text}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Compose bar: paperclip, text, smiley, mic */}
      <div style={composerStyle}>
        <PaperclipIcon size={20} color={teamsTheme.color.textSecondary} />
        <div style={composerInputStyle}>
          <span
            style={{
              color:
                composerText.length > 0
                  ? teamsTheme.color.textPrimary
                  : teamsTheme.color.textSecondary,
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            {composerText || "Type a message"}
            {keyboardState.isKeyboardVisible && (
              <span
                style={{
                  display: "inline-block",
                  width: 2,
                  height: 16,
                  borderRadius: 1,
                  backgroundColor: teamsTheme.color.brand,
                }}
              />
            )}
          </span>
        </div>
        <SmileyIcon size={20} color={teamsTheme.color.textSecondary} />
        <MicIcon size={20} color={teamsTheme.color.textSecondary} />
      </div>
    </>
  );
}

// =============================================================================
// CALL OVERLAY
// =============================================================================

function CallOverlay({ state }: { state: TeamsState }) {
  const call = state.activeCallId ? state.calls[state.activeCallId] : undefined;
  const participantIds = call?.participantIds ?? [];
  const participants = participantIds.map((id) => {
    const user = state.users[id];
    return user?.displayName ?? id;
  });

  return (
    <div style={callSurfaceStyle}>
      <div style={callHeaderStyle}>
        <div>
          <div style={{ ...headerTitleStyle, color: "#ffffff" }}>Teams call</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontFamily: FONT }}>
            {participants.length > 0 ? `${participants.length} participants` : "Connecting..."}
          </div>
        </div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", fontFamily: FONT }}>
          00:42
        </div>
      </div>

      <div style={callGridStyle}>
        {(participants.length > 0 ? participants : ["Alice", "Bob"])
          .slice(0, 4)
          .map((name) => (
            <div key={name} style={participantCardStyle}>
              <Avatar name={name} size={48} />
              <span style={{ fontSize: 13, fontWeight: 500 }}>{name}</span>
            </div>
          ))}
      </div>

      <div style={callControlsWrapStyle}>
        <div style={callControlStyle}>
          <MicControlIcon size={20} />
          <span>Mute</span>
        </div>
        <div style={callControlStyle}>
          <VideoIcon size={20} color="#ffffff" />
          <span>Camera</span>
        </div>
        <div style={callControlStyle}>
          <ScreenShareIcon size={20} />
          <span>Share</span>
        </div>
        <div style={callControlStyle}>
          <HandIcon size={20} />
          <span>Raise</span>
        </div>
        <div style={endCallControlStyle}>
          <EndCallIcon size={20} />
          <span>End</span>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN VIEW
// =============================================================================

export const TeamsView: React.FC<PluginViewProps> = ({ world }) => {
  const state = getState(world);
  const safeArea = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();

  const activeTab = state.screen === "call_overlay" ? "calls" : "chat";
  const isThread = state.screen === "dm_thread" || state.screen === "channel_thread";

  useEffect(() => {
    injectTeamsStyles();
  }, []);

  return (
    <div
      style={{
        ...shellBaseStyle,
        paddingTop: safeArea.top,
        paddingBottom: isThread && keyboardHeight > 0 ? 0 : safeArea.bottom,
        height: isThread && keyboardHeight > 0 ? `calc(100% - ${keyboardHeight}px)` : "100%",
      }}
    >
      <div style={appBodyStyle}>
        {state.screen === "chat_list" && <ChatList state={state} />}
        {state.screen === "channel_feed" && <ChannelFeedView state={state} />}
        {(state.screen === "dm_thread" || state.screen === "channel_thread") && (
          <ThreadView state={state} keyboardHeight={keyboardHeight} />
        )}
        {state.screen === "call_overlay" && <CallOverlay state={state} />}
      </div>
      {state.screen !== "call_overlay" && <BottomTabBar activeTab={activeTab} />}
    </div>
  );
};
