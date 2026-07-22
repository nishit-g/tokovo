import React from "react";
import { useXExperience } from "../../experience/context.js";
import {
  requireTweet,
  requireUser,
  requireXState,
  selectActiveTweet,
  selectNotificationBadgeCount,
  selectUnreadThreadCount,
} from "../../runtime/selectors.js";
import { PostCard } from "../posts/PostCard.js";
import { Avatar } from "../primitives/Avatar.js";
import { AppHeader, BottomNav } from "../primitives/Chrome.js";
import type { XScreenProps } from "./types.js";
import { requireDeviceClock } from "./types.js";

export const TweetScreen: React.FC<XScreenProps> = ({ world, deviceId, width }) => {
  const experience = useXExperience();
  const state = requireXState(world, deviceId);
  const tweet = selectActiveTweet(world, deviceId);
  const currentUser = state.currentUserId ? requireUser(state, state.currentUserId, "currentUserId") : undefined;
  const nowMs = requireDeviceClock(world, deviceId);
  const replies = tweet.replyIds.map((id) => requireTweet(state, id, `tweet "${tweet.id}" replyIds`));

  return (
    <div style={{ height: "100%", minHeight: 0, display: "flex", flexDirection: "column" }}>
      <AppHeader title={experience.t("post")} onBack />
      <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
        <div>
          <PostCard state={state} tweet={tweet} width={width} nowMs={nowMs} detail />
          <div data-x-anchor="x.reply.composer" style={{ height: 56, padding: "7px 16px", display: "flex", alignItems: "center", gap: 10, boxSizing: "border-box", borderBottom: `1px solid ${experience.colors.border}` }}>
            {currentUser ? <Avatar user={currentUser} size={34} /> : null}
            <div style={{ flex: 1, color: experience.colors.textSecondary, fontSize: 15 }}>{experience.t("replyPlaceholder")}</div>
            <div style={{ color: experience.colors.accent, fontSize: 14, fontWeight: 700, paddingInline: 4 }}>{experience.t("reply")}</div>
          </div>
          {replies.map((reply) => (
            <PostCard key={reply.id} state={state} tweet={reply} width={width} nowMs={nowMs} />
          ))}
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
