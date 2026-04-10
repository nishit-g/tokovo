import React from "react";
import type { WorldState } from "@tokovo/core";
import { LIAvatar, LIIcon } from "./components.js";
import { PostCard } from "./PostCard.js";
import { useLinkedInTheme } from "./ThemeContext.js";
import { computeLinkedInFeedScrollY } from "../feed-metrics.js";
import {
  formatRelativeFrameTime,
  getCurrentUser,
  getFeedFocusPostId,
  getFeedPosts,
  getLatestCommentsForPost,
  getReferenceFrame,
  getRepostCountForPost,
  getUnreadMessageCount,
  getUserById,
} from "../runtime/selectors.js";

const HomeHeader: React.FC<{ avatarSrc?: string; unreadMessages: number }> = ({ avatarSrc, unreadMessages }) => {
  const theme = useLinkedInTheme();

  return (
    <div
      style={{
        minHeight: theme.spacing.headerHeight,
        background: theme.colors.surface,
        borderBottom: `1px solid ${theme.colors.border}`,
        display: "flex",
        alignItems: "center",
        gap: theme.spacing.sm,
        padding: `0 ${theme.spacing.screenPadding}px`,
      }}
    >
      <LIAvatar size="xs" src={avatarSrc} />
      <div
        style={{
          flex: 1,
          height: theme.spacing.inputHeight,
          borderRadius: theme.radius.sm,
          background: theme.colors.surfaceHover,
          display: "flex",
          alignItems: "center",
          gap: theme.spacing.sm,
          padding: `0 ${theme.spacing.sm}px`,
          color: theme.colors.textSecondary,
          fontSize: theme.typography.body.fontSize,
        }}
      >
        <LIIcon name="search" size={16} color={theme.colors.textSecondary} />
        <span>Search</span>
      </div>
      <LIIcon name="message" size={22} color={theme.colors.textSecondary} />
      {unreadMessages > 0 ? (
        <div
          style={{
            marginLeft: -18,
            marginTop: -12,
            minWidth: 16,
            height: 16,
            borderRadius: theme.radius.pill,
            background: theme.colors.badge,
            color: theme.colors.textInverse,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 4px",
            fontSize: theme.typography.micro.fontSize,
            fontWeight: 700,
          }}
        >
          {unreadMessages > 9 ? "9+" : unreadMessages}
        </div>
      ) : null}
    </div>
  );
};

const StartPostPrompt: React.FC<{ avatarSrc?: string }> = ({ avatarSrc }) => {
  const theme = useLinkedInTheme();

  return (
    <section
      style={{
        background: theme.colors.surface,
        borderRadius: 0,
        borderTop: `1px solid ${theme.colors.border}`,
        borderBottom: `1px solid ${theme.colors.border}`,
        padding: `${theme.spacing.cardPadding}px ${theme.spacing.cardPadding}px ${theme.spacing.sm}px`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: theme.spacing.md }}>
        <LIAvatar size="lg" src={avatarSrc} />
        <div
          style={{
            flex: 1,
            height: theme.spacing.inputHeight + 2,
            border: `1px solid ${theme.colors.borderStrong}`,
            borderRadius: theme.radius.pill,
            display: "flex",
            alignItems: "center",
            padding: `0 ${theme.spacing.lg}px`,
            color: theme.colors.textSecondary,
            fontSize: theme.typography.body.fontSize,
            fontWeight: 500,
          }}
        >
          Start a post
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: theme.spacing.xs,
          marginTop: theme.spacing.sm,
          paddingLeft: theme.spacing.avatarLg + theme.spacing.md,
          fontSize: theme.typography.caption.fontSize,
          color: theme.colors.textSecondary,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: `2px ${theme.spacing.sm}px`,
            borderRadius: theme.radius.pill,
            border: `1px solid ${theme.colors.border}`,
          }}
        >
          Anyone
        </span>
        <span>Post to your network and profile</span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: theme.spacing.sm,
          marginTop: theme.spacing.md,
          paddingTop: theme.spacing.sm,
          borderTop: `1px solid ${theme.colors.border}`,
        }}
      >
        <FeedAction icon="photo" label="Photo" color="#378FE9" />
        <FeedAction icon="video" label="Video" color="#5F9B41" />
        <FeedAction icon="article" label="Write article" color="#C37D16" />
      </div>
    </section>
  );
};

const FeedAction: React.FC<{
  icon: "photo" | "video" | "article";
  label: string;
  color: string;
}> = ({ icon, label, color }) => {
  const theme = useLinkedInTheme();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: theme.spacing.xs,
        minHeight: 34,
        borderRadius: theme.radius.sm,
      }}
    >
      <LIIcon name={icon} size={18} color={color} />
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

const FeedSortRow: React.FC = () => {
  const theme = useLinkedInTheme();

  return (
    <div style={{ display: "flex", alignItems: "center", gap: theme.spacing.sm }}>
      <div style={{ flex: 1, height: 1, background: theme.colors.border }} />
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: theme.spacing.xs,
          padding: `0 ${theme.spacing.sm}px`,
          height: 24,
          borderRadius: theme.radius.pill,
          border: `1px solid ${theme.colors.border}`,
          background: theme.colors.surface,
          fontSize: theme.typography.caption.fontSize,
          color: theme.colors.textSecondary,
        }}
      >
        <span>Sort by</span>
        <span style={{ color: theme.colors.textPrimary, fontWeight: 600 }}>Top</span>
      </div>
    </div>
  );
};

export const Feed: React.FC<{ world: WorldState }> = ({ world }) => {
  const theme = useLinkedInTheme();
  const posts = getFeedPosts(world);
  const currentUser = getCurrentUser(world);
  const referenceFrame = getReferenceFrame(world);
  const unreadMessages = getUnreadMessageCount(world);
  const focusedPostId = getFeedFocusPostId(world);
  const scrollY = computeLinkedInFeedScrollY(posts, focusedPostId);

  return (
    <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <HomeHeader avatarSrc={currentUser?.avatarUrl} unreadMessages={unreadMessages} />

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          background: theme.colors.background,
        }}
      >
        <div
          style={{
            transform: scrollY > 0 ? `translateY(-${scrollY}px)` : undefined,
            transition: "transform 420ms cubic-bezier(0.22, 1, 0.36, 1)",
            willChange: "transform",
            display: "flex",
            flexDirection: "column",
            gap: theme.spacing.sm,
            padding: `${theme.spacing.sm}px 0`,
          }}
        >
          <div style={{ padding: `0 ${theme.spacing.screenPadding}px` }}>
            <StartPostPrompt avatarSrc={currentUser?.avatarUrl} />
          </div>
          <div style={{ padding: `0 ${theme.spacing.screenPadding}px` }}>
            <FeedSortRow />
          </div>

          {posts.length > 0 ? posts.map((post, index) => {
            const author = getUserById(world, post.authorId);
            const isFocused = post.id === focusedPostId;
            const latestComments = getLatestCommentsForPost(world, post.id, isFocused ? 4 : 2).map((comment) => ({
              authorName: getUserById(world, comment.authorId)?.name ?? "Member",
              text: comment.text,
            }));

            return (
              <div key={post.id} style={{ display: "flex", flexDirection: "column" }}>
                {index > 0 ? (
                  <div
                    style={{
                      height: 8,
                      background: theme.colors.background,
                      borderTop: `1px solid ${theme.colors.border}`,
                      borderBottom: `1px solid ${theme.colors.border}`,
                    }}
                  />
                ) : null}
                <PostCard
                  authorName={author?.name ?? "LinkedIn Member"}
                  authorHeadline={author?.headline}
                  authorAvatar={author?.avatarUrl}
                  timeAgo={formatRelativeFrameTime(post.createdAt, referenceFrame)}
                  content={post.text}
                  image={post.media?.urls?.[0]}
                  linkPreview={
                    post.linkPreview
                      ? {
                        url: post.linkPreview.url,
                        title: post.linkPreview.title,
                        domain: post.linkPreview.domain,
                        image: post.linkPreview.imageUrl,
                      }
                      : undefined
                  }
                  reactions={post.reactions}
                  commentCount={post.commentIds.length}
                  repostCount={getRepostCountForPost(world, post.id)}
                  isLiked={Boolean(currentUser && post.reactedBy[currentUser.id])}
                  showFollowButton={Boolean(currentUser && author && author.id !== currentUser.id && !currentUser.connectionIds.includes(author.id))}
                  commentPreview={latestComments}
                />
              </div>
            );
          }) : (
            <div
              style={{
                padding: `${theme.spacing.xxxl}px ${theme.spacing.xl}px`,
                borderRadius: theme.radius.card,
                background: theme.colors.surface,
                boxShadow: theme.shadows.card,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  margin: "0 auto",
                  marginBottom: theme.spacing.lg,
                  borderRadius: theme.radius.pill,
                  background: theme.colors.accentLight,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <LIIcon name="home" size={36} color={theme.colors.accent} />
              </div>
              <div
                style={{
                  fontSize: theme.typography.title.fontSize,
                  fontWeight: theme.typography.title.fontWeight,
                  color: theme.colors.textPrimary,
                  marginBottom: theme.spacing.sm,
                }}
              >
                Your feed is warming up
              </div>
              <div
                style={{
                  fontSize: theme.typography.body.fontSize,
                  color: theme.colors.textSecondary,
                }}
              >
                Posts from your network and followed creators will show up here.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
