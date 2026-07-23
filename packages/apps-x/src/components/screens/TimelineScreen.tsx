import React from "react";
import {
  findUser,
  requireXState,
  selectNotificationBadgeCount,
  selectTimelineTweets,
  selectUnreadThreadCount,
} from "../../runtime/selectors.js";
import { useXExperience } from "../../experience/context.js";
import { Avatar } from "../primitives/Avatar.js";
import {
  BottomNav,
  EmptyState,
  IconButton,
  TabBar,
} from "../primitives/Chrome.js";
import { XIcon, XLogo } from "../primitives/Icon.js";
import { PostCard } from "../posts/PostCard.js";
import { projectXFeed } from "../../layout/project.js";
import type { XScreenProps } from "./types.js";
import { requireDeviceClock } from "./types.js";

export const TimelineScreen: React.FC<XScreenProps> = ({
  world,
  deviceId,
  width,
  height,
}) => {
  const experience = useXExperience();
  const state = requireXState(world, deviceId);
  const tweets = selectTimelineTweets(world, deviceId);
  const currentUser = findUser(state, state.currentUserId);
  const nowMs = requireDeviceClock(world, deviceId);
  const notificationBadge = selectNotificationBadgeCount(world, deviceId);
  const messageBadge = selectUnreadThreadCount(world, deviceId);
  const feedHeight = Math.max(
    0,
    height -
      experience.metrics.headerHeight -
      48 -
      experience.metrics.navHeight,
  );
  const projection = projectXFeed({
    state,
    tweets,
    width,
    viewportHeight: feedHeight,
    scrollY: state.scroll.timeline,
  });

  return (
    <div
      style={{
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        background: experience.colors.background,
      }}
    >
      <header
        data-x-anchor="x.timeline.header"
        style={{
          height: experience.metrics.headerHeight,
          minHeight: experience.metrics.headerHeight,
          paddingInline: 8,
          display: "grid",
          gridTemplateColumns: "52px 1fr 52px",
          alignItems: "center",
          background: experience.colors.background,
          position: "relative",
          zIndex: 5,
        }}
      >
        <div style={{ display: "grid", placeItems: "center" }}>
          {currentUser ? (
            <Avatar user={currentUser} size={32} />
          ) : (
            <XIcon name="user" size={22} />
          )}
        </div>
        <div style={{ display: "grid", placeItems: "center" }}>
          <XLogo size={24} />
        </div>
        <IconButton icon="sparkle" label="Timeline settings" size={20} />
      </header>
      <TabBar
        active={state.timelineTab}
        tabs={[
          { id: "forYou", label: experience.t("forYou") },
          { id: "following", label: experience.t("following") },
        ]}
      />

      <div
        data-x-anchor="x.timeline.feed"
        style={{
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {tweets.length > 0 ? (
          <div
            style={{
              height: projection.contentHeight,
              transform: `translateY(${-state.scroll.timeline}px)`,
              willChange: "transform",
              position: "relative",
            }}
          >
            {projection.visibleItems.map((item) => (
              <div
                key={item.id}
                style={{
                  position: "absolute",
                  top: item.y,
                  insetInline: 0,
                  height: item.height,
                }}
              >
                <PostCard
                  state={state}
                  tweet={item.tweet}
                  width={width}
                  nowMs={nowMs}
                />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="home"
            title={experience.t("emptyTimelineTitle")}
            body={experience.t("emptyTimelineBody")}
          />
        )}
        <div
          data-x-anchor="x.compose.fab"
          aria-label={experience.t("post")}
          style={{
            position: "absolute",
            insetInlineEnd: 18,
            bottom: 18,
            width: 54,
            height: 54,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            color: "#fff",
            background: experience.colors.accent,
            boxShadow:
              experience.appearance === "dark"
                ? "0 8px 24px rgba(0,0,0,.42)"
                : "0 8px 24px rgba(15,20,25,.2)",
          }}
        >
          <XIcon name="plus" size={26} color="#fff" strokeWidth={2.2} />
        </div>
      </div>
      <BottomNav
        active="home"
        notificationBadge={notificationBadge}
        messageBadge={messageBadge}
      />
    </div>
  );
};
