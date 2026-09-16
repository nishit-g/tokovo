import { xComposerHeight } from "../../layout/measure.js";
import React from "react";
import { useInputField, DraftText, useFps, useTime } from "@tokovo/react";
import { useXExperience } from "../../experience/context.js";
import { xInputFields } from "../../input-fields.js";
import { projectXConversation } from "../../layout/project.js";
import {
  requireUser,
  requireXState,
  selectActiveTweet,
  selectNotificationBadgeCount,
  selectTweetConversation,
  selectUnreadThreadCount,
} from "../../runtime/selectors.js";
import { PostCard } from "../posts/PostCard.js";
import { Avatar } from "../primitives/Avatar.js";
import { AppHeader, BottomNav } from "../primitives/Chrome.js";
import type { XScreenProps } from "./types.js";
import { requireDeviceClock } from "./types.js";

export const TweetScreen: React.FC<XScreenProps> = ({ world, deviceId, width, height }) => {
  const experience = useXExperience();
  const frame = useTime();
  const fps = useFps();
  const state = requireXState(world, deviceId);
  const tweet = selectActiveTweet(world, deviceId);
  const conversation = selectTweetConversation(world, deviceId, tweet.id);
  const currentUser = state.currentUserId
    ? requireUser(state, state.currentUserId, "currentUserId")
    : undefined;
  const input = useInputField(xInputFields.replyComposer(tweet.id));
  const replyDraft = input?.value ?? "";
  const nowMs = requireDeviceClock(world, deviceId);
  const scrollY = state.scroll.tweetById[tweet.id] ?? 0;
  const conversationHeight = Math.max(
    0,
    height - experience.metrics.headerHeight - experience.metrics.navHeight,
  );
  const composerHeight = xComposerHeight(replyDraft, width, experience.text, "reply");
  const projection = projectXConversation({
    tokens: experience.text,
    frame,
    reducedMotion: experience.reducedMotion,
    composerHeight,
    state,
    conversation,
    width,
    viewportHeight: conversationHeight,
    scrollY,
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
      <AppHeader title={experience.t("post")} onBack />
      <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
        <div
          style={{
            height: projection.contentHeight,
            transform: `translateY(${-scrollY}px)`,
            willChange: "transform",
            position: "relative",
          }}
        >
          {projection.visibleItems.map((item) => {
            const conversationItem = item.conversation;
            return (
              <div
                key={conversationItem.tweet.id}
                data-conversation-depth={conversationItem.depth}
                style={{
                  position: "absolute",
                  top: item.y,
                  insetInline: 0,
                  height: item.slotHeight,
                  opacity: item.opacity,
                  overflow: "hidden",
                }}
              >
                <div style={{ position: "relative", height: item.postHeight }}>
                  {conversationItem.role !== "focus" && conversationItem.continuesThread ? (
                    <span
                      aria-hidden
                      style={{
                        position: "absolute",
                        zIndex: 2,
                        insetInlineStart: 37,
                        top: 54,
                        bottom: 0,
                        width: 2,
                        borderRadius: 2,
                        background: experience.colors.borderStrong,
                      }}
                    />
                  ) : null}
                  <PostCard
                    state={state}
                    tweet={conversationItem.tweet}
                    width={width}
                    nowMs={nowMs}
                    detail={conversationItem.role === "focus"}
                    showBorder={conversationItem.role !== "ancestor"}
                  />
                </div>
                {conversationItem.role === "focus" ? (
                  <div
                    data-x-anchor="x.reply.composer"
                    style={{
                      height: composerHeight,
                      padding: "7px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      boxSizing: "border-box",
                      borderBottom: `1px solid ${experience.colors.border}`,
                    }}
                  >
                    {currentUser ? <Avatar user={currentUser} size={34} /> : null}
                    <div
                      role="textbox"
                      aria-label={experience.t("replyPlaceholder")}
                      lang={input?.locale.tag ?? experience.locale}
                      dir={input?.direction ?? experience.direction}
                      style={{
                        flex: 1,
                        minWidth: 0,
                        color: replyDraft
                          ? experience.colors.text
                          : experience.colors.textSecondary,
                        fontSize: experience.text.message,
                        whiteSpace: "pre-wrap",
                        unicodeBidi: "plaintext",
                        overflow: "hidden",
                      }}
                    >
                      <DraftText
                        text={replyDraft}
                        selection={input?.selection}
                        lastActivityFrame={input?.lastActivityFrame}
                        focused={Boolean(input?.focused)}
                        frame={frame}
                        fps={fps}
                        accent={experience.colors.accent}
                        lineHeight={experience.text.messageLine}
                        locale={input?.locale.tag ?? experience.locale}
                        placeholder={experience.t("replyPlaceholder")}
                      />
                    </div>
                    <div
                      style={{
                        width: 64,
                        minWidth: 64,
                        boxSizing: "border-box",
                        textAlign: "center",
                        color: replyDraft ? "#fff" : experience.colors.accent,
                        background: replyDraft ? experience.colors.accent : "transparent",
                        borderRadius: 18,
                        fontSize: 14,
                        fontWeight: 700,
                        padding: replyDraft ? "7px 14px" : "7px 4px",
                      }}
                    >
                      {experience.t("reply")}
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      <BottomNav
        active="home"
        notificationBadge={selectNotificationBadgeCount(world, deviceId)}
        messageBadge={selectUnreadThreadCount(world, deviceId)}
      />
    </div>
  );
};
