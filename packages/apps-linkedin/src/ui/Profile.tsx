import React from "react";
import type { WorldState } from "@tokovo/core";
import { Button, Header, LIAvatar, LIIcon } from "./components.js";
import { useLinkedInTheme } from "./ThemeContext.js";
import { formatCompactCount, getCurrentUser, getProfileUser, getUnreadMessageCount, getUserPosts } from "../runtime/selectors.js";

export const Profile: React.FC<{ world: WorldState }> = ({ world }) => {
  const theme = useLinkedInTheme();
  const currentUser = getCurrentUser(world);
  const user = getProfileUser(world) ?? currentUser;
  const unreadMessages = getUnreadMessageCount(world);
  const posts = getUserPosts(world, user?.id ?? null).slice(0, 3);
  const profileViews = user?.profileViews ?? Math.max(96, posts.length * 84 + Math.floor((user?.followers ?? 0) / 3));
  const impressionCount = user?.impressionCount ?? Math.max(180, posts.length * 142 + Math.floor((user?.connections ?? 0) / 4));
  const featuredTitle = posts[0]?.text?.slice(0, 88) ?? "Shipping deterministic, story-first product surfaces for Tokovo.";
  const aboutText = user?.about ?? `${user?.headline ?? "Builder and operator"} focused on product systems, creator tooling, and interfaces that hold up under real production use.`;

  return (
    <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <Header avatarSrc={currentUser?.avatarUrl} title="Profile" showSearch={false} messageCount={unreadMessages} />

      <div style={{ flex: 1, overflow: "auto", padding: theme.spacing.screenPadding }}>
        <section
          style={{
            background: theme.colors.surface,
            borderRadius: theme.radius.card,
            boxShadow: theme.shadows.card,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: theme.spacing.bannerHeight,
              background: `linear-gradient(135deg, ${theme.colors.accent} 0%, ${theme.colors.accentHover} 100%)`,
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                right: theme.spacing.md,
                bottom: theme.spacing.md,
                width: 32,
                height: 32,
                borderRadius: theme.radius.pill,
                background: "rgba(255,255,255,0.92)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LIIcon name="photo" size={16} color={theme.colors.textSecondary} />
            </div>
          </div>

          <div style={{ padding: theme.spacing.cardPadding }}>
            <div style={{ marginTop: theme.spacing.profileAvatarOffset }}>
              <div
                style={{
                  width: theme.spacing.avatarXl + 8,
                  height: theme.spacing.avatarXl + 8,
                  borderRadius: theme.radius.avatar,
                  background: theme.colors.surface,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: theme.shadows.card,
                }}
              >
                <LIAvatar size="xl" src={user?.avatarUrl} name={user?.name} />
              </div>
            </div>

            <div style={{ marginTop: theme.spacing.md }}>
              <div
                style={{
                  fontSize: theme.typography.display.fontSize,
                  fontWeight: theme.typography.display.fontWeight,
                  color: theme.colors.textPrimary,
                }}
              >
                {user?.name ?? "LinkedIn Member"}
              </div>
              <div
                style={{
                  fontSize: theme.typography.body.fontSize,
                  color: theme.colors.textPrimary,
                  marginTop: 4,
                }}
              >
                {user?.headline ?? "Add a headline that explains the value you create."}
              </div>
              <div
                style={{
                  fontSize: theme.typography.caption.fontSize,
                  color: theme.colors.textSecondary,
                  marginTop: theme.spacing.sm,
                }}
              >
                {[user?.company, user?.location].filter(Boolean).join(" · ") || "Add your location"}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: theme.spacing.md,
                  flexWrap: "wrap",
                  marginTop: theme.spacing.sm,
                  fontSize: theme.typography.captionSemibold.fontSize,
                }}
              >
                <span style={{ color: theme.colors.accent }}>
                  {formatCompactCount(user?.followers ?? 0)} followers
                </span>
                <span style={{ color: theme.colors.accent }}>
                  {formatCompactCount(user?.connections ?? 0)} connections
                </span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: theme.spacing.sm,
                marginTop: theme.spacing.lg,
                flexWrap: "wrap",
              }}
            >
              <Button variant="primary" size="md">Open to</Button>
              <Button variant="secondary" size="md">Add section</Button>
              <Button variant="ghost" size="md">More</Button>
            </div>
          </div>
        </section>

        <section
          style={{
            background: theme.colors.surface,
            borderRadius: theme.radius.card,
            boxShadow: theme.shadows.card,
            padding: theme.spacing.cardPadding,
            marginTop: theme.spacing.sm,
          }}
        >
          <div
            style={{
              fontSize: theme.typography.title.fontSize,
              fontWeight: theme.typography.title.fontWeight,
              color: theme.colors.textPrimary,
            }}
          >
            About
          </div>
          <div
            style={{
              marginTop: theme.spacing.sm,
              fontSize: theme.typography.body.fontSize,
              lineHeight: theme.typography.body.lineHeight,
              color: theme.colors.textPrimary,
              whiteSpace: "pre-wrap",
            }}
          >
            {aboutText}
          </div>
        </section>

        <section
          style={{
            background: theme.colors.surface,
            borderRadius: theme.radius.card,
            boxShadow: theme.shadows.card,
            padding: theme.spacing.cardPadding,
            marginTop: theme.spacing.sm,
          }}
        >
          <div
            style={{
              fontSize: theme.typography.title.fontSize,
              fontWeight: theme.typography.title.fontWeight,
              color: theme.colors.textPrimary,
            }}
          >
            Analytics
          </div>
          <div
            style={{
              fontSize: theme.typography.caption.fontSize,
              color: theme.colors.textSecondary,
              marginTop: 4,
              marginBottom: theme.spacing.md,
            }}
          >
            Private to you
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: theme.spacing.sm,
            }}
          >
            <MetricCard label="Profile viewers" value={formatCompactCount(profileViews)} />
            <MetricCard label="Post impressions" value={formatCompactCount(impressionCount)} />
          </div>
        </section>

        <section
          style={{
            background: theme.colors.surface,
            borderRadius: theme.radius.card,
            boxShadow: theme.shadows.card,
            padding: theme.spacing.cardPadding,
            marginTop: theme.spacing.sm,
          }}
        >
          <div
            style={{
              fontSize: theme.typography.title.fontSize,
              fontWeight: theme.typography.title.fontWeight,
              color: theme.colors.textPrimary,
            }}
          >
            Featured
          </div>
          <div
            style={{
              marginTop: theme.spacing.md,
              padding: theme.spacing.md,
              borderRadius: theme.radius.md,
              background: theme.colors.background,
              border: `1px solid ${theme.colors.border}`,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: theme.spacing.xs,
                padding: "3px 8px",
                borderRadius: theme.radius.pill,
                background: theme.colors.accentLight,
                color: theme.colors.accent,
                fontSize: theme.typography.micro.fontSize,
                fontWeight: 700,
              }}
            >
              <LIIcon name="repost" size={12} color={theme.colors.accent} />
              FEATURED POST
            </div>
            <div
              style={{
                marginTop: theme.spacing.sm,
                fontSize: theme.typography.body.fontSize,
                color: theme.colors.textPrimary,
                lineHeight: theme.typography.body.lineHeight,
              }}
            >
              {featuredTitle}
            </div>
          </div>
        </section>

        <section
          style={{
            background: theme.colors.surface,
            borderRadius: theme.radius.card,
            boxShadow: theme.shadows.card,
            padding: theme.spacing.cardPadding,
            marginTop: theme.spacing.sm,
          }}
        >
          <div
            style={{
              fontSize: theme.typography.title.fontSize,
              fontWeight: theme.typography.title.fontWeight,
              color: theme.colors.textPrimary,
            }}
          >
            Experience
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.md, marginTop: theme.spacing.md }}>
            <ProfileListItem
              title={user?.company ?? "Tokovo"}
              subtitle={user?.headline ?? "Product and creative systems"}
              meta="Full-time · Present"
            />
            <ProfileListItem
              title="Independent builder"
              subtitle="Video tooling, DSL systems, interaction design"
              meta="Before that"
            />
          </div>
        </section>

        <section
          style={{
            background: theme.colors.surface,
            borderRadius: theme.radius.card,
            boxShadow: theme.shadows.card,
            padding: theme.spacing.cardPadding,
            marginTop: theme.spacing.sm,
            marginBottom: theme.spacing.md,
          }}
        >
          <div
            style={{
              fontSize: theme.typography.title.fontSize,
              fontWeight: theme.typography.title.fontWeight,
              color: theme.colors.textPrimary,
            }}
          >
            Activity
          </div>
          <div
            style={{
              fontSize: theme.typography.caption.fontSize,
              color: theme.colors.textSecondary,
              marginTop: 4,
              marginBottom: theme.spacing.md,
            }}
          >
            Creator updates and recent posts
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm }}>
            {posts.length > 0 ? posts.map((post) => (
              <div
                key={post.id}
                style={{
                  padding: theme.spacing.md,
                  borderRadius: theme.radius.md,
                  background: theme.colors.background,
                }}
              >
                <div
                  style={{
                    fontSize: theme.typography.body.fontSize,
                    color: theme.colors.textPrimary,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {post.text}
                </div>
                <div
                  style={{
                    marginTop: theme.spacing.sm,
                    fontSize: theme.typography.caption.fontSize,
                    color: theme.colors.textSecondary,
                  }}
                >
                  {formatCompactCount(post.viewCount)} views · {post.commentIds.length} comments
                </div>
              </div>
            )) : (
              <div
                style={{
                  fontSize: theme.typography.body.fontSize,
                  color: theme.colors.textSecondary,
                }}
              >
                No recent activity yet.
              </div>
            )}
          </div>
        </section>

        <section
          style={{
            background: theme.colors.surface,
            borderRadius: theme.radius.card,
            boxShadow: theme.shadows.card,
            padding: theme.spacing.cardPadding,
            marginTop: theme.spacing.sm,
            marginBottom: theme.spacing.md,
          }}
        >
          <div
            style={{
              fontSize: theme.typography.title.fontSize,
              fontWeight: theme.typography.title.fontWeight,
              color: theme.colors.textPrimary,
            }}
          >
            Resources
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: theme.spacing.sm, marginTop: theme.spacing.md }}>
            <ProfileListItem title="Creator mode" subtitle="On" meta="Highlights followers and content performance" />
            <ProfileListItem title="Open to work with teams" subtitle="Available for design systems, product, and storytelling work" />
          </div>
        </section>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const theme = useLinkedInTheme();

  return (
    <div
      style={{
        padding: theme.spacing.md,
        borderRadius: theme.radius.md,
        background: theme.colors.background,
      }}
    >
      <div
        style={{
          fontSize: theme.typography.title.fontSize,
          fontWeight: theme.typography.title.fontWeight,
          color: theme.colors.textPrimary,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: theme.typography.caption.fontSize,
          color: theme.colors.textSecondary,
          marginTop: 4,
        }}
      >
        {label}
      </div>
    </div>
  );
};

const ProfileListItem: React.FC<{ title: string; subtitle: string; meta?: string }> = ({ title, subtitle, meta }) => {
  const theme = useLinkedInTheme();

  return (
    <div style={{ display: "flex", gap: theme.spacing.md }}>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: theme.radius.md,
          background: theme.colors.background,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <LIIcon name="briefcase" size={18} color={theme.colors.textSecondary} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: theme.typography.headline.fontSize,
            fontWeight: theme.typography.headline.fontWeight,
            color: theme.colors.textPrimary,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: theme.typography.bodySmall.fontSize,
            color: theme.colors.textSecondary,
            marginTop: 2,
          }}
        >
          {subtitle}
        </div>
        {meta ? (
          <div
            style={{
              fontSize: theme.typography.caption.fontSize,
              color: theme.colors.textTertiary,
              marginTop: 4,
            }}
          >
            {meta}
          </div>
        ) : null}
      </div>
    </div>
  );
};
