import React from "react";
import { useInputField, useTime } from "@tokovo/react";
import { useXExperience } from "../../experience/context.js";
import { xInputFields } from "../../input-fields.js";
import { formatXTimestamp } from "../../localization/index.js";
import { projectXThread } from "../../layout/project.js";
import {
  requireUser,
  requireXState,
  selectActiveThread,
  selectThreadDraft,
  selectThreadMessages,
} from "../../runtime/selectors.js";
import { Avatar, VerifiedBadge } from "../primitives/Avatar.js";
import { AppHeader, IconButton } from "../primitives/Chrome.js";
import { XIcon } from "../primitives/Icon.js";
import type { XScreenProps } from "./types.js";
import { requireDeviceClock } from "./types.js";

export const ThreadScreen: React.FC<XScreenProps> = ({
  world,
  deviceId,
  width,
  height,
}) => {
  const experience = useXExperience();
  const state = requireXState(world, deviceId);
  const thread = selectActiveThread(world, deviceId);
  const messages = selectThreadMessages(world, deviceId, thread.id);
  const input = useInputField(xInputFields.threadComposer(thread.id));
  const draft = input?.value ?? selectThreadDraft(world, deviceId, thread.id);
  const frame = useTime();
  const otherIds = thread.participantIds.filter(
    (id) => id !== state.currentUserId,
  );
  const participants = otherIds.map((id) =>
    requireUser(state, id, `thread "${thread.id}" participantIds`),
  );
  const primary =
    participants[0] ??
    requireUser(
      state,
      thread.participantIds[0],
      `thread "${thread.id}" participantIds`,
    );
  const title =
    thread.title ??
    (participants.map((user) => user.name).join(", ") || primary.name);
  const typingUsers = thread.typingUserIds.map((id) =>
    requireUser(state, id, `thread "${thread.id}" typingUserIds`),
  );
  const typingSubtitle =
    typingUsers.length === 0
      ? `@${primary.handle}`
      : typingUsers.length === 1
        ? `${typingUsers[0].name} ${experience.t("typing")}`
        : `${typingUsers
            .slice(0, 2)
            .map((user) => user.name)
            .join(", ")} ${experience.t("peopleTyping")}`;
  const nowMs = requireDeviceClock(world, deviceId);
  const composerHeight = experience.metrics.composerHeight + 10;
  const threadHeight = Math.max(
    0,
    height - experience.metrics.headerHeight - composerHeight,
  );
  const projection = projectXThread({
    state,
    threadId: thread.id,
    messages,
    width,
    viewportHeight: threadHeight,
  });

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
        onBack
        title={title}
        subtitle={typingSubtitle}
        leading={<IconButton icon="back" label="Back" size={22} />}
        trailing={<Avatar user={primary} size={30} />}
      />
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          padding: "12px 12px 8px",
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        {projection.visibleItems.map((item) => {
          const { message } = item;
          const sender = requireUser(
            state,
            message.senderId,
            `message "${message.id}" senderId`,
          );
          const self = message.senderId === state.currentUserId;
          const replyTarget = message.replyToMessageId
            ? state.dmMessagesById[message.replyToMessageId]
            : undefined;
          const deliveryLabel =
            message.delivery === "failed"
              ? experience.t("failed")
              : experience.t(message.delivery);
          return (
            <div
              key={message.id}
              data-x-anchor={`x.dm.${thread.id}.message.${message.id}`}
              style={{
                position: "absolute",
                top: item.y - projection.viewportStart,
                insetInline: 12,
                height: item.height,
                display: "flex",
                flexDirection: self ? "row-reverse" : "row",
                alignItems: "flex-end",
                gap: 7,
              }}
            >
              {self ? null : item.endsRun ? (
                <Avatar user={sender} size={25} />
              ) : (
                <span style={{ width: 25 }} />
              )}
              <div
                style={{
                  width: item.bubbleWidth,
                  height: item.height,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: self ? "flex-end" : "flex-start",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: item.bubbleWidth,
                    height: item.bubbleHeight,
                    padding: "9px 13px",
                    boxSizing: "border-box",
                    borderRadius: self
                      ? "18px 18px 5px 18px"
                      : "18px 18px 18px 5px",
                    background:
                      message.delivery === "failed" && self
                        ? experience.colors.danger
                        : self
                          ? experience.colors.outgoingBubble
                          : experience.colors.incomingBubble,
                    color: self ? "#fff" : experience.colors.text,
                    fontSize: 14.5 * experience.type.scale,
                    lineHeight: "20px",
                    whiteSpace: "pre-wrap",
                    unicodeBidi: "plaintext",
                    overflow: "hidden",
                    boxShadow:
                      message.delivery === "sending" && self
                        ? `inset 0 0 0 1px ${experience.colors.borderStrong}`
                        : "none",
                  }}
                >
                  {item.startsRun && !self && participants.length > 1 ? (
                    <div
                      style={{
                        marginBottom: 3,
                        fontSize: 11,
                        fontWeight: 700,
                        color: experience.colors.accent,
                      }}
                    >
                      {sender.name}{" "}
                      <VerifiedBadge variant={sender.verified} size={11} />
                    </div>
                  ) : null}
                  {replyTarget ? (
                    <div
                      style={{
                        marginBottom: 7,
                        padding: "5px 8px",
                        borderInlineStart: `3px solid ${self ? "rgba(255,255,255,.72)" : experience.colors.accent}`,
                        borderRadius: 5,
                        background: self
                          ? "rgba(255,255,255,.1)"
                          : experience.colors.surfaceRaised,
                        color: self
                          ? "rgba(255,255,255,.86)"
                          : experience.colors.textSecondary,
                        fontSize: 11,
                        lineHeight: "14px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {experience.t("replyingToMessage")}: {replyTarget.text}
                    </div>
                  ) : null}
                  {message.text}
                  {item.endsRun ? (
                    <div
                      style={{
                        marginTop: 3,
                        textAlign: "end",
                        color: self
                          ? "rgba(255,255,255,.74)"
                          : experience.colors.textSecondary,
                        fontSize: 9.5,
                      }}
                    >
                      {formatXTimestamp(
                        message.createdAt,
                        nowMs,
                        experience.locale,
                      )}
                      {self ? ` · ${deliveryLabel}` : ""}
                    </div>
                  ) : null}
                </div>
                {message.reactions.length > 0 ? (
                  <div
                    style={{
                      height: item.reactionsHeight,
                      marginTop: -3,
                      marginInline: 8,
                      display: "flex",
                      gap: 4,
                      position: "relative",
                      zIndex: 2,
                    }}
                  >
                    {message.reactions.map((reaction) => (
                      <span
                        key={reaction.emoji}
                        aria-label={`${reaction.emoji} ${reaction.userIds.length}`}
                        style={{
                          minWidth: 28,
                          height: 21,
                          paddingInline: 6,
                          borderRadius: 11,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 3,
                          border: `1px solid ${experience.colors.borderStrong}`,
                          background: experience.colors.surface,
                          color: experience.colors.text,
                          fontSize: 12,
                          boxSizing: "border-box",
                          boxShadow: "0 2px 5px rgba(0,0,0,.16)",
                        }}
                      >
                        <span>{reaction.emoji}</span>
                        {reaction.userIds.length > 1 ? (
                          <span
                            style={{
                              fontSize: 9,
                              color: experience.colors.textSecondary,
                            }}
                          >
                            {reaction.userIds.length}
                          </span>
                        ) : null}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
        {typingUsers.length > 0 ? (
          <div
            style={{
              position: "absolute",
              bottom: 8,
              insetInlineStart: 12,
              display: "flex",
              alignItems: "flex-end",
              gap: 7,
            }}
          >
            <Avatar user={typingUsers[0]} size={25} />
            <div
              style={{
                width: 54,
                height: 36,
                borderRadius: "18px 18px 18px 5px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 4,
                background: experience.colors.incomingBubble,
              }}
            >
              {[0, 1, 2].map((dot) => (
                <span
                  key={dot}
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: experience.colors.textSecondary,
                    opacity:
                      0.48 +
                      0.38 * ((Math.sin((frame + dot * 5) * 0.38) + 1) / 2),
                    transform: `translateY(${Math.sin((frame + dot * 5) * 0.38) * -1.5}px)`,
                  }}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
      <div
        style={{
          minHeight: experience.metrics.composerHeight + 10,
          padding: "5px 9px",
          display: "flex",
          alignItems: "center",
          gap: 7,
          borderTop: `1px solid ${experience.colors.border}`,
          boxSizing: "border-box",
        }}
      >
        <IconButton icon="image" label="Add media" size={20} />
        <div
          role="textbox"
          aria-label="Message"
          lang={input?.locale.tag ?? experience.locale}
          dir={input?.direction ?? experience.direction}
          style={{
            flex: 1,
            minHeight: 38,
            borderRadius: 20,
            border: `1px solid ${input?.focused ? experience.colors.accent : experience.colors.borderStrong}`,
            padding: "8px 13px",
            boxSizing: "border-box",
            color: draft
              ? experience.colors.text
              : experience.colors.textSecondary,
            fontSize: 14,
            lineHeight: "20px",
            boxShadow: input?.focused
              ? `0 0 0 1px ${experience.colors.accentSoft}`
              : "none",
            whiteSpace: "pre-wrap",
            unicodeBidi: "plaintext",
          }}
        >
          {draft || experience.t("message")}
          {draft && input?.focused ? (
            <span
              aria-hidden
              style={{
                display: "inline-block",
                width: 1.5,
                height: 15,
                marginInlineStart: 1,
                verticalAlign: -2,
                background: experience.colors.accent,
              }}
            />
          ) : null}
        </div>
        <span
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            background: draft
              ? experience.colors.accent
              : experience.colors.surfaceRaised,
            color: draft ? "#fff" : experience.colors.textSecondary,
          }}
        >
          <XIcon name="send" size={18} color="currentColor" />
        </span>
      </div>
    </div>
  );
};
