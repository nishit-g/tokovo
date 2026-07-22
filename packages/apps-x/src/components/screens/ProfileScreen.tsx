import React from "react";
import { DeterministicImage } from "@tokovo/react";
import { useXExperience } from "../../experience/context.js";
import { formatXCount } from "../../localization/index.js";
import {
  requireXState,
  selectActiveUser,
  selectNotificationBadgeCount,
  selectTweetsByAuthor,
  selectUnreadThreadCount,
} from "../../runtime/selectors.js";
import { PostCard } from "../posts/PostCard.js";
import { Avatar, VerifiedBadge } from "../primitives/Avatar.js";
import { AppHeader, BottomNav, IconButton, TabBar } from "../primitives/Chrome.js";
import { XIcon } from "../primitives/Icon.js";
import type { XScreenProps } from "./types.js";
import { requireDeviceClock } from "./types.js";
import { X_PROFILE_HEADER_HEIGHT } from "../../layout/measure.js";

export const ProfileScreen: React.FC<XScreenProps> = ({ world, deviceId, width }) => {
  const experience = useXExperience();
  const state = requireXState(world, deviceId);
  const user = selectActiveUser(world, deviceId);
  const allTweets = selectTweetsByAuthor(world, deviceId, user.id);
  const tweets = allTweets.filter((tweet) => {
    if (state.profileTab === "posts") return !tweet.replyToId;
    if (state.profileTab === "replies") return Boolean(tweet.replyToId);
    if (state.profileTab === "media") return Boolean(tweet.media);
    return tweet.likedBy.includes(user.id);
  });
  const nowMs = requireDeviceClock(world, deviceId);
  const isCurrent = state.currentUserId === user.id;

  return (
    <div style={{ height: "100%", minHeight: 0, display: "flex", flexDirection: "column" }}>
      <AppHeader title={user.name} subtitle={`${formatXCount(allTweets.length, experience.locale)} ${experience.t("posts")}`} onBack trailing={<IconButton icon="more" label="More profile actions" size={20} />} />
      <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
        <div>
          <section data-x-anchor={`x.profile.${user.id}.header`} style={{ height: X_PROFILE_HEADER_HEIGHT, overflow: "hidden" }}>
            <div
              style={{
                height: 124,
                background: experience.appearance === "dark"
                    ? "linear-gradient(135deg, #22303C 0%, #334B5F 48%, #1B2A36 100%)"
                    : "linear-gradient(135deg, #C7D9E6 0%, #9DBED4 48%, #D4E6F1 100%)",
                position: "relative",
              }}
            >
              {user.bannerUrl ? <DeterministicImage src={user.bannerUrl} alt="" aria-hidden style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} /> : null}
            </div>
            <div style={{ height: 68, paddingInline: 16, position: "relative" }}>
              <div style={{ position: "absolute", top: -40, insetInlineStart: 16 }}><Avatar user={user} size={84} ring /></div>
              <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                <div style={{ height: 36, paddingInline: 17, borderRadius: 20, border: `1px solid ${experience.colors.borderStrong}`, display: "flex", alignItems: "center", fontSize: 14, fontWeight: 750 }}>
                  {isCurrent ? experience.t("editProfile") : experience.t("message")}
                </div>
              </div>
            </div>
            <div style={{ padding: "0 16px 13px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontFamily: experience.type.displayFamily, fontSize: 22 * experience.type.scale, lineHeight: 1.12, fontWeight: 800, letterSpacing: "-.025em" }}>
                <span>{user.name}</span><VerifiedBadge variant={user.verified} size={18} />
              </div>
              <div style={{ marginTop: 2, color: experience.colors.textSecondary, fontSize: 14 }}>@{user.handle}</div>
              {user.bio ? <div style={{ marginTop: 11, fontSize: 14.5, lineHeight: 1.38, whiteSpace: "pre-wrap", unicodeBidi: "plaintext" }}>{user.bio}</div> : null}
              <div style={{ marginTop: 10, display: "flex", alignItems: "center", flexWrap: "wrap", gap: "7px 15px", color: experience.colors.textSecondary, fontSize: 13 }}>
                {user.location ? <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><XIcon name="location" size={15} />{user.location}</span> : null}
                {user.website ? <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: experience.colors.accent }}><XIcon name="link" size={15} />{user.website}</span> : null}
                {user.joinedAt ? <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><XIcon name="calendar" size={15} />{experience.t("joined")} {new Intl.DateTimeFormat(experience.locale, { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(user.joinedAt))}</span> : null}
              </div>
              <div style={{ marginTop: 11, display: "flex", gap: 18, fontSize: 13 }}>
                <span><strong>{formatXCount(user.following, experience.locale)}</strong> <span style={{ color: experience.colors.textSecondary }}>{experience.t("followingCount")}</span></span>
                <span><strong>{formatXCount(user.followers, experience.locale)}</strong> <span style={{ color: experience.colors.textSecondary }}>{experience.t("followers")}</span></span>
              </div>
            </div>
          </section>
          <TabBar
            active={state.profileTab}
            tabs={[
              { id: "posts", label: experience.t("posts") },
              { id: "replies", label: experience.t("replies") },
              { id: "media", label: experience.t("media") },
              { id: "likes", label: experience.t("likes") },
            ]}
          />
          {tweets.map((tweet) => <PostCard key={tweet.id} state={state} tweet={tweet} width={width} nowMs={nowMs} />)}
        </div>
      </div>
      <BottomNav active="home" notificationBadge={selectNotificationBadgeCount(world, deviceId)} messageBadge={selectUnreadThreadCount(world, deviceId)} />
    </div>
  );
};
