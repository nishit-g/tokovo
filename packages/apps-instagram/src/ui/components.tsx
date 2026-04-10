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
        fontSize: 24,
        fontWeight: 700,
        fontStyle: "italic",
        letterSpacing: -0.6,
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
  const common = {
    width: size,
    height: size,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: resolved,
    fontSize: size * 0.85,
    lineHeight: 1,
  } as const;
  const glyphMap: Record<string, string> = {
    home: filled ? "⌂" : "⌂",
    search: "⌕",
    reels: "▣",
    heart: filled ? "♥" : "♡",
    profile: "◌",
    send: "➤",
    comment: "◔",
    bookmark: "▮",
    more: "⋯",
    camera: "⌖",
    back: "‹",
    plus: "+",
    spark: "✦",
  };
  return <span style={common}>{glyphMap[name]}</span>;
};

export const BottomNav: React.FC<{
  active: "home" | "heart" | "profile" | "send";
}> = ({ active }) => {
  const theme = useInstagramTheme();
  const items: Array<{ id: "home" | "heart" | "profile" | "send"; icon: "home" | "heart" | "profile" | "send" }> = [
    { id: "home", icon: "home" },
    { id: "send", icon: "send" },
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
      }}
    >
      {items.map((item) => (
        <div
          key={item.id}
          style={{
            width: 52,
            height: 42,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: active === item.id ? theme.colors.textPrimary : theme.colors.textSecondary,
            fontWeight: active === item.id ? 700 : 500,
          }}
        >
          <Icon
            name={item.icon}
            size={22}
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
    <div style={{ width: 74, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <Avatar size={62} src={user.avatarUrl} ring ringMuted={!active} />
      <div
        style={{
          width: "100%",
          fontSize: 12,
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
}> = ({ post, author, liked, commentPreview, nowMs }) => {
  const theme = useInstagramTheme();
  return (
    <div style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "10px 12px",
          gap: 10,
        }}
      >
        <Avatar size={32} src={author?.avatarUrl} ring />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{author?.username ?? "unknown"}</div>
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
          <div style={{ display: "flex", gap: 14 }}>
            <Icon name="heart" size={22} filled={liked} color={liked ? theme.colors.accent : theme.colors.textPrimary} />
            <Icon name="comment" size={22} />
            <Icon name="send" size={22} />
          </div>
          <Icon name="bookmark" size={18} color={theme.colors.textPrimary} />
        </div>

        <div style={{ marginTop: 10, fontSize: 13, fontWeight: 700 }}>
          {post.likeCount.toLocaleString()} likes
        </div>
        <div style={{ marginTop: 6, fontSize: 14, lineHeight: 1.45 }}>
          <span style={{ fontWeight: 700 }}>{author?.username ?? "unknown"}</span>{" "}
          {post.caption}
        </div>
        {commentPreview.map((text, index) => (
          <div key={`${post.id}-comment-${index}`} style={{ marginTop: 4, fontSize: 13, color: theme.colors.textSecondary }}>
            {text}
          </div>
        ))}
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
  const theme = useInstagramTheme();
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
