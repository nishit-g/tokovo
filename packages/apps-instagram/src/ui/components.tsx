import React from "react";
import type { InstagramPost, InstagramStory, InstagramUser } from "../runtime/state.js";
import { useInstagramTheme } from "./ThemeContext.js";

export function formatRelativeTime(ts: number, nowMs: number): string {
  const diffMs = Math.max(0, nowMs - ts);
  const diffMinutes = Math.floor(diffMs / 60_000);
  if (diffMinutes < 1) return "now";
  if (diffMinutes < 60) return `${diffMinutes}m`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h`;
  return `${Math.floor(diffHours / 24)}d`;
}

export const Avatar: React.FC<{
  size?: number;
  src?: string;
  ring?: boolean;
  ringMuted?: boolean;
}> = ({ size = 32, src, ring = false, ringMuted = false }) => {
  const theme = useInstagramTheme();
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        padding: ring ? 2 : 0,
        background: ring
          ? ringMuted
            ? theme.colors.border
            : `linear-gradient(135deg, ${theme.colors.storyRingA}, ${theme.colors.storyRingB}, ${theme.colors.storyRingC})`
          : "transparent",
        boxSizing: "border-box",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "50%",
          overflow: "hidden",
          background: theme.mode === "dark" ? "#25252C" : "#EDEDED",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: theme.colors.textMuted,
          fontSize: Math.round(size * 0.35),
          border: ring ? `2px solid ${theme.colors.surface}` : undefined,
          boxSizing: "border-box",
        }}
      >
        {src ? (
          <img
            src={src}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          "•"
        )}
      </div>
    </div>
  );
};

export const InstagramWordmark: React.FC = () => {
  const theme = useInstagramTheme();
  return (
    <div
      style={{
        fontSize: 26,
        fontWeight: 700,
        fontStyle: "italic",
        letterSpacing: -0.75,
        color: theme.colors.textPrimary,
      }}
    >
      Instagram
    </div>
  );
};

export const Icon: React.FC<{
  name:
    | "home"
    | "search"
    | "reels"
    | "heart"
    | "profile"
    | "send"
    | "comment"
    | "bookmark"
    | "more"
    | "camera"
    | "back"
    | "plus"
    | "spark";
  size?: number;
  color?: string;
  filled?: boolean;
}> = ({ name, size = 22, color, filled = false }) => {
  const theme = useInstagramTheme();
  const resolved = color ?? theme.colors.textPrimary;
  const strokeWidth = name === "back" ? 2.4 : 2;

  const path = (() => {
    switch (name) {
      case "home":
        return filled ? (
          <path d="M6 10.5 12 5l6 5.5V18a1 1 0 0 1-1 1h-3.7v-4.7h-2.6V19H7a1 1 0 0 1-1-1z" fill={resolved} />
        ) : (
          <>
            <path d="M3.8 10.7 12 4l8.2 6.7" fill="none" stroke={resolved} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} />
            <path d="M6.5 9.8V19h11V9.8" fill="none" stroke={resolved} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} />
          </>
        );
      case "search":
        return (
          <>
            <circle cx="11" cy="11" r="5.5" fill="none" stroke={resolved} strokeWidth={strokeWidth} />
            <path d="M15.3 15.3 19 19" fill="none" stroke={resolved} strokeLinecap="round" strokeWidth={strokeWidth} />
          </>
        );
      case "reels":
        return (
          <>
            <rect x="5" y="4.5" width="14" height="15" rx="4.2" fill="none" stroke={resolved} strokeWidth={strokeWidth} />
            <path d="M5.5 9h13" fill="none" stroke={resolved} strokeWidth={strokeWidth} />
            <path d="m8 4.8 3 4.1M13 4.8l3 4.1" fill="none" stroke={resolved} strokeLinecap="round" strokeWidth={strokeWidth} />
            <path d="m10.4 11.7 4.8 2.8-4.8 2.8z" fill={filled ? resolved : "none"} stroke={resolved} strokeLinejoin="round" strokeWidth={filled ? 0 : 1.6} />
          </>
        );
      case "heart":
        return filled ? (
          <path d="M12 19s-6.8-4.5-8.7-8C1.8 8.1 3 5 6.1 5c1.9 0 3 1 3.9 2.2C10.9 6 12 5 13.9 5 17 5 18.2 8.1 20.7 11 18.8 14.5 12 19 12 19Z" fill={resolved} />
        ) : (
          <path d="M12 19s-6.8-4.5-8.7-8C1.8 8.1 3 5 6.1 5c1.9 0 3 1 3.9 2.2C10.9 6 12 5 13.9 5 17 5 18.2 8.1 20.7 11 18.8 14.5 12 19 12 19Z" fill="none" stroke={resolved} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} />
        );
      case "profile":
        return (
          <>
            <circle cx="12" cy="8.5" r="3.4" fill="none" stroke={resolved} strokeWidth={strokeWidth} />
            <path d="M5.6 18.6c1.6-3 4-4.3 6.4-4.3s4.8 1.3 6.4 4.3" fill="none" stroke={resolved} strokeLinecap="round" strokeWidth={strokeWidth} />
            <circle cx="12" cy="12" r="8.5" fill="none" stroke={resolved} strokeWidth={strokeWidth} />
          </>
        );
      case "send":
        return (
          <path d="M20 4 9.5 14.4M20 4l-5.3 16-5.2-5.6L4 9.1 20 4Z" fill="none" stroke={resolved} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} />
        );
      case "comment":
        return (
          <path d="M6.6 17.6 5.5 20l3.6-1.8a8.5 8.5 0 1 0-2.5-.6Z" fill="none" stroke={resolved} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} />
        );
      case "bookmark":
        return filled ? (
          <path d="M7 4.8h10v14.5L12 16l-5 3.3z" fill={resolved} />
        ) : (
          <path d="M7 4.8h10v14.5L12 16l-5 3.3z" fill="none" stroke={resolved} strokeLinejoin="round" strokeWidth={strokeWidth} />
        );
      case "more":
        return (
          <>
            <circle cx="6" cy="12" r="1.6" fill={resolved} />
            <circle cx="12" cy="12" r="1.6" fill={resolved} />
            <circle cx="18" cy="12" r="1.6" fill={resolved} />
          </>
        );
      case "camera":
        return (
          <>
            <rect x="4.5" y="7.2" width="15" height="11" rx="3" fill="none" stroke={resolved} strokeWidth={strokeWidth} />
            <circle cx="12" cy="12.7" r="3.2" fill="none" stroke={resolved} strokeWidth={strokeWidth} />
            <path d="M8 7.2 9.4 5.5h5.2L16 7.2" fill="none" stroke={resolved} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} />
          </>
        );
      case "back":
        return <path d="M14.8 5 8.2 12l6.6 7" fill="none" stroke={resolved} strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} />;
      case "plus":
        return (
          <>
            <rect x="5" y="5" width="14" height="14" rx="4" fill="none" stroke={resolved} strokeWidth={strokeWidth} />
            <path d="M12 8v8M8 12h8" fill="none" stroke={resolved} strokeLinecap="round" strokeWidth={strokeWidth} />
          </>
        );
      case "spark":
        return (
          <path d="m12 4 1.8 5.2L19 11l-5.2 1.8L12 18l-1.8-5.2L5 11l5.2-1.8z" fill={filled ? resolved : "none"} stroke={resolved} strokeLinejoin="round" strokeWidth={filled ? 0 : strokeWidth} />
        );
      default:
        return null;
    }
  })();

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      style={{ display: "block", color: resolved, flexShrink: 0 }}
      aria-hidden="true"
    >
      {path}
    </svg>
  );
};

export const BottomNav: React.FC<{
  active: "home" | "search" | "reels" | "heart" | "profile";
}> = ({ active }) => {
  const theme = useInstagramTheme();
  const items: Array<{ id: "home" | "search" | "reels" | "heart" | "profile"; icon: "home" | "search" | "reels" | "heart" | "profile" }> = [
    { id: "home", icon: "home" },
    { id: "search", icon: "search" },
    { id: "reels", icon: "reels" },
    { id: "heart", icon: "heart" },
    { id: "profile", icon: "profile" },
  ];
  return (
    <div
      style={{
        height: theme.spacing.tabBarHeight,
        borderTop: `1px solid ${theme.colors.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        background: theme.colors.surface,
        flexShrink: 0,
        paddingBottom: 2,
      }}
    >
      {items.map((item) => (
        <div
          key={item.id}
          style={{
            width: 56,
            height: 46,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: active === item.id ? theme.colors.textPrimary : theme.colors.textSecondary,
          }}
        >
          <Icon
            name={item.icon}
            size={item.icon === "profile" ? 25 : 24}
            filled={active === item.id && item.icon === "heart"}
            color={active === item.id ? theme.colors.textPrimary : theme.colors.textSecondary}
          />
        </div>
      ))}
    </div>
  );
};

export const StoryChip: React.FC<{
  user: InstagramUser;
  active?: boolean;
}> = ({ user, active = true }) => {
  const theme = useInstagramTheme();
  return (
    <div style={{ width: 78, display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
      <Avatar size={68} src={user.avatarUrl} ring ringMuted={!active} />
      <div
        style={{
          width: "100%",
          fontSize: 12.5,
          color: theme.colors.textPrimary,
          textAlign: "center",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {user.username}
      </div>
    </div>
  );
};

export const PostCard: React.FC<{
  post: InstagramPost;
  author: InstagramUser | undefined;
  liked: boolean;
  commentPreview: string[];
  nowMs: number;
  isFocused?: boolean;
  totalCommentCount?: number;
}> = ({ post, author, liked, commentPreview, nowMs, isFocused = false, totalCommentCount = 0 }) => {
  const theme = useInstagramTheme();
  const likeLine = post.likeCount > 0
    ? `${post.likeCount.toLocaleString()} likes`
    : "Be the first to like this";
  return (
    <div
      style={{
        borderBottom: `1px solid ${theme.colors.border}`,
        background: theme.colors.surface,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "10px 12px 10px",
          gap: 10,
        }}
      >
        <Avatar size={34} src={author?.avatarUrl} ring />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{author?.username ?? "unknown"}</div>
            {author?.verified ? (
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: "#3897F0",
                  color: "#FFF",
                  fontSize: 9,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                ✓
              </div>
            ) : null}
          </div>
          {post.location ? (
            <div style={{ fontSize: 11, color: theme.colors.textSecondary }}>{post.location}</div>
          ) : null}
        </div>
        <Icon name="more" size={18} color={theme.colors.textSecondary} />
      </div>

      <div
        style={{
          width: "100%",
          aspectRatio:
            post.aspect === "square"
              ? "1 / 1"
              : post.aspect === "landscape"
                ? "4 / 3"
                : "4 / 5",
          background: theme.colors.backgroundAlt,
          overflow: "hidden",
        }}
      >
        <img
          src={post.imageUrl}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </div>

      <div style={{ padding: "10px 12px 14px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 16 }}>
            <Icon name="heart" size={25} filled={liked} color={liked ? theme.colors.accent : theme.colors.textPrimary} />
            <Icon name="comment" size={24} />
            <Icon name="send" size={23} />
          </div>
          <Icon name="bookmark" size={21} color={theme.colors.textPrimary} />
        </div>

        <div style={{ marginTop: 10, fontSize: 13.5, fontWeight: 700 }}>
          {likeLine}
        </div>
        <div style={{ marginTop: 6, fontSize: 14, lineHeight: 1.42 }}>
          <span style={{ fontWeight: 700 }}>{author?.username ?? "unknown"}</span>{" "}
          {post.caption}
        </div>
        {totalCommentCount > 0 ? (
          <div style={{ marginTop: 6, fontSize: 13, color: theme.colors.textSecondary }}>
            View all {totalCommentCount.toLocaleString()} comments
          </div>
        ) : null}
        {commentPreview.map((text, index) => (
          <div
            key={`${post.id}-comment-${index}`}
            style={{
              marginTop: 4,
              fontSize: isFocused ? 13.5 : 13,
              color: theme.colors.textPrimary,
              lineHeight: 1.4,
            }}
          >
            {text}
          </div>
        ))}
        <div style={{ marginTop: 7, fontSize: 13, color: theme.colors.textSecondary }}>
          Add a comment...
        </div>
        <div style={{ marginTop: 8, fontSize: 11, letterSpacing: 0.3, color: theme.colors.textMuted, textTransform: "uppercase" }}>
          {formatRelativeTime(post.createdAt, nowMs)}
        </div>
      </div>
    </div>
  );
};

export const ProgressBars: React.FC<{
  items: InstagramStory[];
  activeStoryId: string | null;
}> = ({ items, activeStoryId }) => {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {items.map((item) => (
        <div
          key={item.id}
          style={{
            flex: 1,
            height: 3,
            borderRadius: 999,
            overflow: "hidden",
            background: "rgba(255,255,255,0.28)",
          }}
        >
          <div
            style={{
              width: item.id === activeStoryId ? "68%" : item.createdAt < (items.find((story) => story.id === activeStoryId)?.createdAt ?? 0) ? "100%" : "0%",
              height: "100%",
              background: "#FFFFFF",
            }}
          />
        </div>
      ))}
    </div>
  );
};
