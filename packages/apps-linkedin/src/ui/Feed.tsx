/**
 * Feed Screen
 * ===========
 * LinkedIn home feed with "Start a post" prompt and posts.
 */
import React from "react";
import type { WorldState } from "@tokovo/core";
import { useLinkedInTheme } from "./ThemeContext.js";
import { Header, LIAvatar, LIIcon } from "./components.js";
import { PostCard } from "./PostCard.js";
import { getFeedPosts, getUserById, getActiveUser } from "../runtime/selectors.js";
import type { LIReactionType } from "../types/index.js";
import { getStableCount } from "./stable.js";

/**
 * "Start a post" prompt at top of feed
 */
const StartPostPrompt: React.FC<{ avatarSrc?: string }> = ({ avatarSrc }) => {
  const theme = useLinkedInTheme();

  return (
    <div
      style={{
        background: theme.colors.surface,
        borderRadius: theme.radius.card,
        boxShadow: theme.shadows.card,
        padding: theme.spacing.cardPadding,
      }}
    >
      {/* Avatar + Input Row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: theme.spacing.md,
        }}
      >
        <LIAvatar size="lg" src={avatarSrc} />
        <div
          style={{
            flex: 1,
            height: theme.spacing.inputHeight + 8,
            border: `1px solid ${theme.colors.borderStrong}`,
            borderRadius: theme.radius.pill,
            display: "flex",
            alignItems: "center",
            padding: `0 ${theme.spacing.lg}px`,
            color: theme.colors.textSecondary,
            fontSize: theme.typography.body.fontSize,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Start a post
        </div>
      </div>

      {/* Media Buttons Row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          marginTop: theme.spacing.md,
          paddingTop: theme.spacing.sm,
        }}
      >
        <MediaButton icon="photo" label="Photo" color="#378FE9" />
        <MediaButton icon="video" label="Video" color="#5F9B41" />
        <MediaButton icon="calendar" label="Event" color="#C37D16" />
        <MediaButton icon="send" label="Write article" color="#E06847" />
      </div>
    </div>
  );
};

const MediaButton: React.FC<{ icon: "photo" | "video" | "calendar" | "send"; label: string; color: string }> = ({
  icon,
  label,
  color,
}) => {
  const theme = useLinkedInTheme();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: theme.spacing.xs,
        padding: `${theme.spacing.sm}px ${theme.spacing.sm}px`,
        borderRadius: theme.radius.sm,
        cursor: "pointer",
      }}
    >
      <LIIcon name={icon} size={20} color={color} />
      <span
        style={{
          fontSize: theme.typography.captionSemibold.fontSize,
          fontWeight: theme.typography.captionSemibold.fontWeight,
          color: theme.colors.textSecondary,
        }}
      >
        {label}
      </span>
    </div>
  );
};

/**
 * Sort/Filter Pills
 */
const FeedSortPills: React.FC = () => {
  const theme = useLinkedInTheme();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: theme.spacing.sm,
      }}
    >
      <div
        style={{
          flex: 1,
          height: 1,
          background: theme.colors.border,
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: theme.spacing.xs,
          fontSize: theme.typography.captionSemibold.fontSize,
          color: theme.colors.textSecondary,
          cursor: "pointer",
        }}
      >
        <span>Sort by:</span>
        <span style={{ fontWeight: 600, color: theme.colors.textPrimary }}>Top</span>
        <span style={{ fontSize: 8 }}>▼</span>
      </div>
    </div>
  );
};

export const Feed: React.FC<{ world: WorldState }> = ({ world }) => {
  const theme = useLinkedInTheme();
  const posts = getFeedPosts(world);
  const currentUser = getActiveUser(world);

  return (
    <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Header avatarSrc={currentUser?.avatarUrl} showSearch />

      {/* Feed Content */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: theme.spacing.screenPadding,
          display: "flex",
          flexDirection: "column",
          gap: theme.spacing.sm,
        }}
      >
        {/* Start a Post */}
        <StartPostPrompt avatarSrc={currentUser?.avatarUrl} />

        {/* Sort Pills */}
        <FeedSortPills />

        {/* Posts */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: theme.spacing.sm,
          }}
        >
          {posts.map((post, index) => {
            const author = getUserById(world, post.authorId);

            return (
              <PostCard
                key={post.id}
                authorName={author?.name ?? "LinkedIn User"}
                authorHeadline={author?.headline}
                authorAvatar={author?.avatarUrl}
                timeAgo={getRandomTimeAgo(index)}
                content={post.text}
                linkPreview={post.linkPreview}
                reactions={post.reactions as Partial<Record<LIReactionType, number>>}
                commentCount={post.commentIds.length}
                repostCount={getStableCount(post.id, 50)}
                isLiked={index === 0}
                showFollowButton={index > 0}
                isPromoted={index === 2}
              />
            );
          })}
        </div>

        {posts.length === 0 && (
          <div
            style={{
              padding: theme.spacing.xxl,
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                margin: "0 auto",
                marginBottom: theme.spacing.lg,
                borderRadius: theme.radius.pill,
                background: theme.colors.accentLight,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LIIcon name="home" size={40} color={theme.colors.accent} />
            </div>
            <div
              style={{
                fontSize: theme.typography.title.fontSize,
                fontWeight: theme.typography.title.fontWeight,
                color: theme.colors.textPrimary,
                marginBottom: theme.spacing.sm,
              }}
            >
              Welcome to your feed
            </div>
            <div
              style={{
                fontSize: theme.typography.body.fontSize,
                color: theme.colors.textSecondary,
              }}
            >
              Posts from your network will appear here
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper to generate varied timestamps
function getRandomTimeAgo(index: number): string {
  const times = ["Just now", "12m", "1h", "2h", "5h", "1d", "2d", "3d", "1w"];
  return times[index % times.length];
}
