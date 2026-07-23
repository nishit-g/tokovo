import React from "react";
import { useXExperience } from "../../experience/context.js";
import { formatXTimestamp } from "../../localization/index.js";
import {
  requireUser,
  requireXState,
  selectDMThreads,
  selectNotificationBadgeCount,
  selectUnreadThreadCount,
} from "../../runtime/selectors.js";
import { Avatar, VerifiedBadge } from "../primitives/Avatar.js";
import {
  AppHeader,
  BottomNav,
  EmptyState,
  IconButton,
} from "../primitives/Chrome.js";
import { XIcon } from "../primitives/Icon.js";
import type { XScreenProps } from "./types.js";
import { requireDeviceClock } from "./types.js";

export const MessagesScreen: React.FC<XScreenProps> = ({ world, deviceId }) => {
  const experience = useXExperience();
  const state = requireXState(world, deviceId);
  const threads = selectDMThreads(world, deviceId);
  const nowMs = requireDeviceClock(world, deviceId);

  return (
    <div
      style={{
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AppHeader
        title={experience.t("messages")}
        trailing={
          <IconButton
            icon="edit"
            label={experience.t("newMessage")}
            size={20}
          />
        }
      />
      <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
        {threads.length === 0 ? (
          <EmptyState
            icon="mail"
            title={experience.t("emptyMessagesTitle")}
            body={experience.t("emptyMessagesBody")}
          />
        ) : (
          <div
            style={{
              transform: `translateY(${-state.scroll.messages}px)`,
              willChange: "transform",
            }}
          >
            {threads.map((thread) => {
              const otherIds = thread.participantIds.filter(
                (id) => id !== state.currentUserId,
              );
              const users = otherIds.map((id) =>
                requireUser(state, id, `thread "${thread.id}" participantIds`),
              );
              const primary =
                users[0] ??
                requireUser(
                  state,
                  thread.participantIds[0],
                  `thread "${thread.id}" participantIds`,
                );
              const lastMessageId =
                thread.messageIds[thread.messageIds.length - 1];
              const lastMessage = lastMessageId
                ? state.dmMessagesById[lastMessageId]
                : undefined;
              const title =
                thread.title ??
                (users.map((user) => user.name).join(", ") || primary.name);
              const typingNames = thread.typingUserIds.map(
                (id) =>
                  requireUser(state, id, `thread "${thread.id}" typingUserIds`)
                    .name,
              );
              const typingLabel =
                typingNames.length === 0
                  ? null
                  : typingNames.length === 1
                    ? `${typingNames[0]} ${experience.t("typing")}`
                    : `${typingNames.slice(0, 2).join(", ")} ${experience.t("peopleTyping")}`;
              return (
                <article
                  key={thread.id}
                  data-x-anchor={`x.dm.${thread.id}`}
                  style={{
                    minHeight: 74,
                    padding: "10px 14px",
                    display: "grid",
                    gridTemplateColumns: "48px minmax(0,1fr)",
                    gap: 11,
                    borderBottom: `1px solid ${experience.colors.border}`,
                    boxSizing: "border-box",
                    background:
                      thread.unreadCount > 0
                        ? experience.colors.accentSoft
                        : experience.colors.background,
                  }}
                >
                  <Avatar user={primary} size={48} />
                  <div
                    style={{
                      minWidth: 0,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        minWidth: 0,
                        gap: 4,
                      }}
                    >
                      {thread.pinned ? (
                        <XIcon
                          name="pin"
                          size={13}
                          color={experience.colors.textSecondary}
                        />
                      ) : null}
                      <strong
                        style={{
                          fontSize: 14.5,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {title}
                      </strong>
                      <VerifiedBadge variant={primary.verified} size={14} />
                      {thread.lastMessageAt ? (
                        <span
                          style={{
                            marginInlineStart: "auto",
                            color: experience.colors.textSecondary,
                            fontSize: 12,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatXTimestamp(
                            thread.lastMessageAt,
                            nowMs,
                            experience.locale,
                          )}
                        </span>
                      ) : null}
                    </div>
                    <div
                      style={{
                        marginTop: 4,
                        display: "flex",
                        alignItems: "center",
                        minWidth: 0,
                        gap: 8,
                        color: typingLabel
                          ? experience.colors.accent
                          : experience.colors.textSecondary,
                        fontSize: 13.5,
                      }}
                    >
                      <span
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {typingLabel ??
                          lastMessage?.text ??
                          experience.t("newMessage")}
                      </span>
                      {thread.unreadCount > 0 ? (
                        <span
                          aria-label={`${thread.unreadCount} ${experience.t("unread")}`}
                          style={{
                            marginInlineStart: "auto",
                            minWidth: 20,
                            height: 20,
                            borderRadius: 11,
                            paddingInline: 5,
                            display: "grid",
                            placeItems: "center",
                            background: experience.colors.accent,
                            color: "white",
                            fontSize: 10,
                            fontWeight: 750,
                          }}
                        >
                          {thread.unreadCount}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
      <BottomNav
        active="messages"
        notificationBadge={selectNotificationBadgeCount(world, deviceId)}
        messageBadge={selectUnreadThreadCount(world, deviceId)}
      />
    </div>
  );
};
