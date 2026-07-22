import React from "react";
import type { WorldState } from "@tokovo/core";
import { AppShell } from "./AppShell.js";
import { BottomNav, Icon, InstagramWordmark, PostCard, StoryChip } from "./components.js";
import { useInstagramTheme } from "./ThemeContext.js";
import { computeInstagramFeedScrollY } from "../feed-metrics.js";
import {
  getCommentsForPost,
  getCurrentUser,
  getFocusedFeedPostId,
  getStorySets,
  getUserById,
  getVisibleFeedPosts,
} from "../runtime/selectors.js";

export const HomeFeed: React.FC<{ world: WorldState; deviceId: string }> = ({
  world,
  deviceId,
}) => {
  const theme = useInstagramTheme();
  const posts = getVisibleFeedPosts(world, deviceId);
  const storySets = getStorySets(world, deviceId);
  const currentUser = getCurrentUser(world, deviceId);
  const focusedFeedPostId = getFocusedFeedPostId(world, deviceId);
  const nowMs = posts.reduce((max, post) => Math.max(max, post.createdAt), 0);
  const commentCounts = new Map(
    posts.map((post) => [post.id, getCommentsForPost(world, deviceId, post.id).length]),
  );
  const scrollY = computeInstagramFeedScrollY(posts, commentCounts, focusedFeedPostId);

  return (
    <AppShell>
      <div
        style={{
          height: theme.spacing.headerHeight,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          borderBottom: `1px solid ${theme.colors.border}`,
          background: theme.colors.surface,
          flexShrink: 0,
        }}
      >
        <InstagramWordmark />
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Icon name="plus" size={25} />
          <Icon name="heart" size={25} />
          <Icon name="send" size={24} />
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
        <div
          style={{
            transform: scrollY > 0 ? `translateY(-${scrollY}px)` : undefined,
            willChange: "transform",
          }}
        >
          <div
            style={{
              padding: "12px 12px 14px",
              display: "flex",
              gap: theme.spacing.storyGap,
              overflow: "hidden",
              borderBottom: `1px solid ${theme.colors.border}`,
              background: theme.colors.surface,
            }}
          >
            {currentUser ? <StoryChip user={{ ...currentUser, username: "Your story" }} /> : null}
            {storySets.map((set) => {
              const user = getUserById(world, deviceId, set.userId);
              return user ? (
                <StoryChip
                  key={set.id}
                  user={user}
                  active={set.lastViewedStoryId === null || set.lastViewedStoryId === undefined}
                />
              ) : null;
            })}
          </div>

          {posts.map((post) => {
            const author = getUserById(world, deviceId, post.authorId) ?? undefined;
            const liked = Boolean(currentUser && post.likedBy.includes(currentUser.id));
            const isFocused = post.id === focusedFeedPostId;
            const comments = getCommentsForPost(world, deviceId, post.id);
            const commentPreview = comments
              .slice(
                isFocused ? Math.max(0, comments.length - 4) : 0,
                isFocused ? comments.length : 2,
              )
              .map((comment) => {
                const user = getUserById(world, deviceId, comment.authorId);
                return `${user?.username ?? "unknown"} ${comment.text}`;
              });
            return (
              <PostCard
                key={post.id}
                post={post}
                author={author}
                liked={liked}
                commentPreview={commentPreview}
                nowMs={nowMs}
                isFocused={isFocused}
                totalCommentCount={commentCounts.get(post.id) ?? 0}
              />
            );
          })}
        </div>
      </div>

      <BottomNav active="home" />
    </AppShell>
  );
};
