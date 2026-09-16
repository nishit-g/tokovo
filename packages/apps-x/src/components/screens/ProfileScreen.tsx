import { projectXFeed } from "../../layout/project.js";
import React from "react";
import { DeterministicImage, ShapedText } from "@tokovo/react";
import { useXExperience } from "../../experience/context.js";
import { formatXCount, xProfileDetails } from "../../localization/index.js";
import {
  requireXState,
  selectActiveUser,
  selectNotificationBadgeCount,
  selectTweetsByAuthor,
  selectProfileTweets,
  selectUnreadThreadCount,
} from "../../runtime/selectors.js";
import { PostCard, PostMedia } from "../posts/PostCard.js";
import { Avatar } from "../primitives/Avatar.js";
import { AppHeader, BottomNav, IconButton, TabBar } from "../primitives/Chrome.js";
import type { XScreenProps } from "./types.js";
import { requireDeviceClock } from "./types.js";
import { measureXProfile } from "../../layout/measure.js";

export const ProfileScreen: React.FC<XScreenProps> = ({ world, deviceId, width, height }) => {
  const experience = useXExperience();
  const state = requireXState(world, deviceId);
  const user = selectActiveUser(world, deviceId);
  const allTweets = selectTweetsByAuthor(world, deviceId, user.id);
  const tweets = selectProfileTweets(world, deviceId, user.id);
  const nowMs = requireDeviceClock(world, deviceId);
  const profile = measureXProfile(
    user,
    width,
    experience.text,
    xProfileDetails(user, experience.locale, experience.t("joined")),
  );
  const scrollY = state.scroll.profileById[user.id] ?? 0;
  const projection = projectXFeed({
    state,
    tweets,
    width,
    viewportHeight: height - experience.metrics.headerHeight - experience.metrics.navHeight,
    scrollY: scrollY - profile.height - 48,
    tokens: experience.text,
  });
  const following = state.currentUserId
    ? state.usersById[state.currentUserId].followingIds.includes(user.id)
    : false;
  const isCurrent = state.currentUserId === user.id;

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
        title={user.name}
        subtitle={`${formatXCount(allTweets.length, experience.locale)} ${experience.t("posts")}`}
        onBack
        trailing={<IconButton icon="more" label="More profile actions" size={20} />}
      />
      <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
        <div
          style={{
            transform: `translateY(${-(state.scroll.profileById[user.id] ?? 0)}px)`,
            willChange: "transform",
          }}
        >
          <section
            data-x-anchor={`x.profile.${user.id}.header`}
            style={{ height: profile.height, overflow: "hidden" }}
          >
            <div
              style={{
                height: 124,
                background:
                  experience.appearance === "dark"
                    ? "linear-gradient(135deg, #22303C 0%, #334B5F 48%, #1B2A36 100%)"
                    : "linear-gradient(135deg, #C7D9E6 0%, #9DBED4 48%, #D4E6F1 100%)",
                position: "relative",
              }}
            >
              {user.bannerUrl ? (
                <DeterministicImage
                  src={user.bannerUrl}
                  alt=""
                  aria-hidden
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              ) : null}
            </div>
            <div style={{ height: 68, paddingInline: 16, position: "relative" }}>
              <div style={{ position: "absolute", top: -40, insetInlineStart: 16 }}>
                <Avatar user={user} size={84} ring />
              </div>
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: 8,
                }}
              >
                {!isCurrent ? (
                  <IconButton icon="mail" label={experience.t("message")} size={20} />
                ) : null}
                <div
                  role="button"
                  aria-label={
                    isCurrent
                      ? experience.t("editProfile")
                      : experience.t(following ? "following" : "follow")
                  }
                  style={{
                    height: 36,
                    paddingInline: 17,
                    borderRadius: 20,
                    border: `1px solid ${experience.colors.borderStrong}`,
                    display: "flex",
                    alignItems: "center",
                    fontSize: 14,
                    fontWeight: 750,
                  }}
                >
                  {isCurrent
                    ? experience.t("editProfile")
                    : experience.t(following ? "following" : "follow")}
                </div>
              </div>
            </div>
            <div style={{ padding: "0 16px 13px" }}>
              <div
                style={{
                  fontSize: experience.text.detail,
                  lineHeight: `${experience.text.detailLine}px`,
                  fontWeight: 700,
                }}
              >
                {profile.nameLines.map((line, i) => (
                  <div key={i}>
                    <ShapedText text={line} />
                  </div>
                ))}
              </div>
              <div
                style={{
                  height: experience.text.bodyLine,
                  lineHeight: `${experience.text.bodyLine}px`,
                  fontSize: experience.text.body,
                  color: experience.colors.textSecondary,
                }}
              >
                @{user.handle}
              </div>
              {profile.bioLines.length ? (
                <div
                  style={{
                    marginTop: 11,
                    fontSize: experience.text.body,
                    lineHeight: `${experience.text.bodyLine}px`,
                  }}
                >
                  {profile.bioLines.map((line, i) => (
                    <div key={i} style={{ height: experience.text.bodyLine, whiteSpace: "pre" }}>
                      <ShapedText text={line} />
                    </div>
                  ))}
                </div>
              ) : null}
              {profile.detailLines.length ? (
                <div
                  style={{
                    marginTop: 10,
                    fontSize: experience.text.small,
                    color: experience.colors.textSecondary,
                  }}
                >
                  {profile.detailLines.map((line, i) => (
                    <div
                      key={i}
                      style={{
                        height: experience.text.smallLine + 4,
                        lineHeight: `${experience.text.smallLine + 4}px`,
                        whiteSpace: "pre",
                      }}
                    >
                      <ShapedText text={line} />
                    </div>
                  ))}
                </div>
              ) : null}
              <div
                style={{
                  marginTop: 11,
                  height: experience.text.smallLine,
                  lineHeight: `${experience.text.smallLine}px`,
                  fontSize: experience.text.small,
                  display: "flex",
                  gap: 18,
                }}
              >
                <span>
                  <strong>{formatXCount(user.following, experience.locale)}</strong>{" "}
                  {experience.t("followingCount")}
                </span>
                <span>
                  <strong>{formatXCount(user.followers, experience.locale)}</strong>{" "}
                  {experience.t("followers")}
                </span>
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
          {state.profileTab === "media" ? (
            <div
              style={{ position: "relative", height: Math.ceil(tweets.length / 3) * (width / 3) }}
            >
              {tweets.map((tweet, index) => {
                const y = Math.floor(index / 3) * (width / 3);
                if (
                  y + width / 3 < scrollY - profile.height - 48 - 160 ||
                  y > scrollY - profile.height - 48 + height + 160
                )
                  return null;
                const media = tweet.media;
                if (!media) throw new Error(`X_MEDIA_MISSING: "${tweet.id}"`);
                return (
                  <div
                    key={tweet.id}
                    data-x-anchor={`x.post.${tweet.id}`}
                    style={{
                      position: "absolute",
                      top: y,
                      insetInlineStart: ((index % 3) * width) / 3,
                      width: width / 3,
                      height: width / 3,
                      padding: 1,
                      boxSizing: "border-box",
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ width: "100%", height: "100%" }}>
                      <PostMedia tweet={tweet} height={width / 3 - 2} compact />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ position: "relative", height: projection.contentHeight }}>
              {projection.visibleItems.map((item) => (
                <div
                  key={item.id}
                  style={{ position: "absolute", top: item.y, width: "100%", height: item.height }}
                >
                  <PostCard state={state} tweet={item.tweet} width={width} nowMs={nowMs} />
                </div>
              ))}
            </div>
          )}
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
