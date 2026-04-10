import React from "react";
import type { WorldState } from "@tokovo/core";
import { AppShell } from "./AppShell.js";
import { BottomNav, Icon, InstagramWordmark, PostCard, StoryChip } from "./components.js";
import { useInstagramTheme } from "./ThemeContext.js";
import {
  getCommentsForPost,
  getCurrentUser,
  getStorySets,
  getUserById,
  getVisibleFeedPosts,
} from "../runtime/selectors.js";

export const HomeFeed: React.FC<{ world: WorldState }> = ({ world }) => {
  const theme = useInstagramTheme();
  const posts = getVisibleFeedPosts(world);
  const storySets = getStorySets(world);
  const currentUser = getCurrentUser(world);
  const nowMs = posts.reduce((max, post) => Math.max(max, post.createdAt), 0);

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
        <div style={{ display: "flex", gap: 14 }}>
          <Icon name="plus" />
          <Icon name="heart" />
          <Icon name="send" />
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
        <div
          style={{
            padding: "14px 12px 12px",
            display: "flex",
            gap: theme.spacing.storyGap,
            overflow: "hidden",
            borderBottom: `1px solid ${theme.colors.border}`,
          }}
        >
          {currentUser ? <StoryChip user={{ ...currentUser, username: "Your story" }} /> : null}
          {storySets.map((set) => {
            const user = getUserById(world, set.userId);
            return user ? (
              <StoryChip
                key={set.id}
                user={user}
                active={set.lastViewedStoryId == null}
              />
            ) : null;
          })}
        </div>

        {posts.map((post) => {
          const author = getUserById(world, post.authorId) ?? undefined;
          const liked = Boolean(currentUser && post.likedBy.includes(currentUser.id));
          const commentPreview = getCommentsForPost(world, post.id)
            .slice(0, 2)
            .map((comment) => {
              const user = getUserById(world, comment.authorId);
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
            />
          );
        })}
      </div>

      <BottomNav active="home" />
    </AppShell>
  );
};
