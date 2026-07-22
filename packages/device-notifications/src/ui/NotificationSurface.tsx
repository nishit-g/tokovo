import React from "react";
import { DeterministicImage } from "@tokovo/react";
import { materialToPaintStyle } from "@tokovo/visual-system";
import { OffthreadVideo, Sequence } from "remotion";
import type {
  NotificationDeviceProjection,
  NotificationGroupProjection,
  NotificationItemProjection,
} from "../contract/index.js";

export interface NotificationSurfaceProps {
  projection: NotificationDeviceProjection;
  pointScale?: number;
}

function Icon({ item, size }: { item: NotificationItemProjection; size: number }) {
  const primaryImage = item.leadingImage ?? item.icon;
  const isAvatar = Boolean(item.leadingImage);
  const isImage = /^(?:https?:|data:|\/)/u.test(primaryImage);
  const avatarClipId = `notification-avatar-${item.id.replace(/[^a-zA-Z0-9_-]/gu, "-")}`;
  return (
    <div
      aria-hidden
      style={{
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: isAvatar ? 0 : size * 0.24,
          background: isAvatar ? "transparent" : item.accentColor,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          fontSize: size * 0.54,
          fontWeight: 750,
        }}
      >
        {isAvatar && isImage ? (
          <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block" }}>
            <defs>
              <clipPath id={avatarClipId}>
                <circle cx="50" cy="50" r="49" />
              </clipPath>
            </defs>
            <foreignObject x="0" y="0" width="100" height="100" clipPath={`url(#${avatarClipId})`}>
              <DeterministicImage
                src={primaryImage}
                alt={item.leadingImageAlt ?? ""}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </foreignObject>
          </svg>
        ) : isImage ? (
          <DeterministicImage
            src={primaryImage}
            alt={item.leadingImageAlt ?? ""}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          primaryImage
        )}
      </div>
      {isAvatar ? (
        <div
          style={{
            position: "absolute",
            insetInlineEnd: -size * 0.1,
            bottom: -size * 0.1,
            width: size * 0.48,
            height: size * 0.48,
            borderRadius: size * 0.12,
            overflow: "hidden",
            background: item.accentColor,
            border: `${Math.max(1, size * 0.045)}px solid rgba(255,255,255,.92)`,
          }}
        >
          <DeterministicImage
            src={item.icon}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      ) : null}
    </div>
  );
}

function NotificationCard({
  item,
  pointScale,
  compact = false,
  surface = "card",
  groupCount,
}: {
  item: NotificationItemProjection;
  pointScale: number;
  compact?: boolean;
  surface?: "banner" | "card";
  groupCount?: number;
}) {
  const projection = React.useContext(ProjectionContext);
  const { theme, platform } = projection;
  const px = (value: number) => value * pointScale;
  const translate = (1 - item.animation.progress) * px(18);
  const urgencyLabel =
    item.interruption === "critical"
      ? projection.strings.critical
      : item.interruption === "timeSensitive"
        ? projection.strings.timeSensitive
        : undefined;
  return (
    <article
      dir={item.direction}
      data-notification-id={item.id}
      data-notification-surface-kind={surface}
      data-interruption={item.interruption}
      aria-label={`${item.appName}: ${item.title}. ${item.body}`}
      style={{
        position: "relative",
        width: "100%",
        boxSizing: "border-box",
        padding: px(theme.geometry.cardPadding),
        borderRadius: px(theme.geometry.cardRadius),
        color: theme.colors.text,
        ...materialToPaintStyle(theme.materials.card, pointScale),
        opacity: item.animation.progress,
        transform: `translate3d(0, ${translate}px, 0) scale(${0.98 + item.animation.progress * 0.02})`,
        fontFamily: theme.typography.fontFamily,
        overflow: "hidden",
        contain: "layout style",
        willChange: item.animation.phase === "visible" ? undefined : "transform, opacity",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "center",
          direction: "ltr",
          gap: px(9),
          marginBottom: px(compact ? 7 : 10),
        }}
      >
        <Icon item={item} size={px(item.leadingImage ? 34 : theme.geometry.iconSize)} />
        <div
          style={{
            minWidth: 0,
            flex: 1,
            color: theme.colors.secondaryText,
            fontSize: px(theme.typography.appSize),
            fontWeight: 650,
            textTransform: platform === "ios" ? "uppercase" : undefined,
            letterSpacing: platform === "ios" ? "0.015em" : undefined,
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          }}
        >
          {item.appName}
        </div>
        {groupCount && groupCount > 1 ? (
          <div
            aria-label={`${groupCount} notifications`}
            style={{
              minWidth: px(20),
              height: px(20),
              padding: `0 ${px(6)}px`,
              borderRadius: px(999),
              background: theme.colors.cardSecondary,
              color: theme.colors.secondaryText,
              fontSize: px(10),
              fontWeight: 750,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {groupCount}
          </div>
        ) : null}
        <time
          style={{
            color: theme.colors.secondaryText,
            fontSize: px(theme.typography.timestampSize),
          }}
        >
          {item.ageLabel}
        </time>
      </header>
      <div style={{ minWidth: 0 }}>
        {urgencyLabel ? (
          <div
            style={{
              marginBottom: px(3),
              color:
                item.interruption === "critical"
                  ? theme.colors.actionDestructive
                  : theme.colors.action,
              fontSize: px(theme.typography.timestampSize),
              fontWeight: 700,
              lineHeight: 1.15,
            }}
          >
            {urgencyLabel}
          </div>
        ) : null}
        <div
          style={{
            fontSize: px(theme.typography.titleSize),
            fontWeight: 700,
            lineHeight: 1.24,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {item.title}
        </div>
        {item.subtitle && item.subtitle !== item.title ? (
          <div
            style={{
              marginTop: px(2),
              color: theme.colors.secondaryText,
              fontSize: px(theme.typography.timestampSize),
              fontWeight: 600,
            }}
          >
            {item.subtitle}
          </div>
        ) : null}
        <div
          style={{
            marginTop: px(3),
            fontSize: px(theme.typography.bodySize),
            lineHeight: 1.32,
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: compact ? 1 : 2,
            overflow: "hidden",
          }}
        >
          {item.body}
        </div>
      </div>
      {item.media ? (
        <div
          style={{
            marginTop: px(10),
            width: "100%",
            aspectRatio: item.media.aspectRatio ?? 16 / 9,
            borderRadius: px(Math.max(10, theme.geometry.cardRadius - 6)),
            overflow: "hidden",
            background: theme.colors.cardSecondary,
          }}
        >
          {item.media.kind === "video" ? (
            <Sequence from={item.deliveredAtFrame} layout="none">
              <OffthreadVideo
                src={item.media.src}
                aria-label={item.media.alt}
                muted
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Sequence>
          ) : (
            <DeterministicImage
              src={item.media.src}
              alt={item.media.alt ?? ""}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          )}
        </div>
      ) : null}
      {!compact && (item.reply || item.actions.length > 0) ? (
        <footer
          style={{
            display: "flex",
            direction: projection.direction,
            gap: px(7),
            marginTop: px(11),
            flexWrap: "wrap",
          }}
        >
          {item.reply ? (
            <div
              style={{
                flex: "1 1 45%",
                minWidth: px(110),
                borderRadius: px(999),
                padding: `${px(7)}px ${px(12)}px`,
                background: theme.colors.cardSecondary,
                color: theme.colors.secondaryText,
                fontSize: px(theme.typography.timestampSize),
              }}
            >
              {item.reply.placeholder ?? projection.strings.reply}
            </div>
          ) : null}
          {item.actions.map((action) => (
            <div
              key={action.id}
              style={{
                borderRadius: px(999),
                padding: `${px(7)}px ${px(12)}px`,
                background: theme.colors.cardSecondary,
                color:
                  action.role === "destructive"
                    ? theme.colors.actionDestructive
                    : theme.colors.action,
                fontSize: px(theme.typography.timestampSize),
                fontWeight: 700,
              }}
            >
              {action.label}
            </div>
          ))}
        </footer>
      ) : null}
    </article>
  );
}

const ProjectionContext = React.createContext<NotificationDeviceProjection>(
  null as unknown as NotificationDeviceProjection,
);

function Group({
  group,
  pointScale,
  compact,
}: {
  group: NotificationGroupProjection;
  pointScale: number;
  compact?: boolean;
}) {
  const projection = React.useContext(ProjectionContext);
  const px = (value: number) => value * pointScale;
  const stackDepth = Math.min(2, Math.max(0, group.count - 1));
  return (
    <section
      data-notification-group={group.key}
      style={{
        position: "relative",
        width: "100%",
        paddingBottom: px(stackDepth * 7),
      }}
    >
      {Array.from({ length: stackDepth }, (_, index) => stackDepth - index).map((depth) => (
        <div
          key={`stack:${depth}`}
          aria-hidden
          style={{
            position: "absolute",
            top: px(depth * 7),
            insetInline: px(depth * 3),
            bottom: 0,
            borderRadius: px(projection.theme.geometry.cardRadius),
            ...materialToPaintStyle(projection.theme.materials.secondary, pointScale),
            opacity: 0.88 - depth * 0.08,
            zIndex: depth,
          }}
        />
      ))}
      {group.items.slice(0, 1).map((item) => (
        <div
          key={item.id}
          style={{
            position: "relative",
            zIndex: stackDepth + 1,
          }}
        >
          <NotificationCard
            item={item}
            pointScale={pointScale}
            compact={compact}
            groupCount={group.count}
          />
        </div>
      ))}
    </section>
  );
}

/** The single painter for banners, lock-screen cards and notification center. */
export const NotificationSurface: React.FC<NotificationSurfaceProps> = ({
  projection,
  pointScale = 1,
}) => {
  const { theme, cinematicSubjects } = projection;
  const px = (value: number) => value * pointScale;
  const groupGap = px(theme.geometry.stackGap);
  return (
    <ProjectionContext.Provider value={projection}>
      <div
        data-notification-surface={projection.deviceId}
        data-platform={projection.platform}
        data-appearance={projection.appearance}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 900,
          pointerEvents: "none",
        }}
      >
        {projection.center.open && cinematicSubjects.center ? (
          <div
            data-notification-center
            dir={projection.direction}
            style={{
              position: "absolute",
              inset: 0,
              boxSizing: "border-box",
              padding: `${px(theme.geometry.centerTop)}px ${px(
                theme.geometry.centerHorizontalMargin,
              )}px ${px(24)}px`,
              ...materialToPaintStyle(theme.materials.center, pointScale),
              opacity: projection.center.progress,
              transform: `translateY(${(1 - projection.center.progress) * -px(22)}px)`,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                color: theme.colors.text,
                fontFamily: theme.typography.fontFamily,
                fontSize: px(24),
                fontWeight: 750,
                marginBottom: px(18),
              }}
            >
              {projection.strings.centerTitle}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: groupGap,
              }}
            >
              {projection.center.groups.map((group) => (
                <Group key={group.key} group={group} pointScale={pointScale} />
              ))}
            </div>
          </div>
        ) : null}

        {!projection.center.open &&
        projection.deviceContext.isLocked &&
        cinematicSubjects.lockScreen ? (
          <div
            data-notification-lock-screen
            style={{
              position: "absolute",
              left: cinematicSubjects.lockScreen.x,
              top: cinematicSubjects.lockScreen.y,
              width: cinematicSubjects.lockScreen.width,
              display: "flex",
              flexDirection: "column",
              gap: groupGap,
            }}
          >
            {projection.lockScreenGroups.map((group) => (
              <Group key={group.key} group={group} pointScale={pointScale} compact />
            ))}
          </div>
        ) : null}

        {!projection.center.open &&
        !projection.deviceContext.isLocked &&
        projection.banner &&
        cinematicSubjects.banner ? (
          <div
            data-notification-banner
            style={{
              position: "absolute",
              left: cinematicSubjects.banner.x,
              top: cinematicSubjects.banner.y,
              width: cinematicSubjects.banner.width,
              minHeight: cinematicSubjects.banner.height,
            }}
          >
            <NotificationCard
              item={projection.banner}
              pointScale={pointScale}
              compact
              surface="banner"
            />
          </div>
        ) : null}
      </div>
    </ProjectionContext.Provider>
  );
};
