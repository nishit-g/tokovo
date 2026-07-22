import React from "react";
import { DeterministicImage } from "@tokovo/react";
import { materialToPaintStyle } from "@tokovo/visual-system";
import { OffthreadVideo, Sequence } from "remotion";
import type {
  NotificationDeviceProjection,
  NotificationGroupProjection,
  NotificationItemProjection,
} from "../../contract/index.js";

export interface NotificationPainterSpec {
  id: string;
  uppercaseAppName: boolean;
  titleWeight: number;
  communicationIconScale: number;
  stackedGroups: boolean;
  centerHeader(projection: NotificationDeviceProjection, pointScale: number): React.ReactNode;
}

export interface NotificationPainterProps {
  projection: NotificationDeviceProjection;
  pointScale: number;
  spec: NotificationPainterSpec;
}

const ProjectionContext = React.createContext<{
  projection: NotificationDeviceProjection;
  spec: NotificationPainterSpec;
} | null>(null);

function requireContext() {
  const value = React.useContext(ProjectionContext);
  if (!value) throw new Error("NOTIFICATION_PAINTER_CONTEXT_MISSING");
  return value;
}

function NotificationIcon({ item, size }: { item: NotificationItemProjection; size: number }) {
  const primaryImage = item.leadingImage ?? item.icon;
  const isCommunication = item.category === "message" && Boolean(item.leadingImage);
  const isImage = /^(?:https?:|data:|\/)/u.test(primaryImage);
  const clipId = `notification-avatar-${item.id.replace(/[^a-zA-Z0-9_-]/gu, "-")}`;
  return (
    <div aria-hidden style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: isCommunication ? "50%" : size * 0.24,
          background: isCommunication ? "transparent" : item.accentColor,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          fontSize: size * 0.54,
          fontWeight: 750,
        }}
      >
        {isImage ? (
          isCommunication ? (
            <svg width={size} height={size} viewBox="0 0 100 100" style={{ display: "block" }}>
              <defs>
                <clipPath id={clipId}>
                  <circle cx="50" cy="50" r="49" />
                </clipPath>
              </defs>
              <foreignObject x="0" y="0" width="100" height="100" clipPath={`url(#${clipId})`}>
                <DeterministicImage
                  src={primaryImage}
                  alt={item.leadingImageAlt ?? ""}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </foreignObject>
            </svg>
          ) : (
            <DeterministicImage
              src={primaryImage}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          )
        ) : (
          primaryImage
        )}
      </div>
      {isCommunication ? (
        <div
          style={{
            position: "absolute",
            insetInlineEnd: -size * 0.08,
            bottom: -size * 0.08,
            width: size * 0.46,
            height: size * 0.46,
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

function NotificationMedia({
  item,
  pointScale,
}: {
  item: NotificationItemProjection;
  pointScale: number;
}) {
  const { projection } = requireContext();
  if (!item.media) return null;
  return (
    <div
      style={{
        marginTop: 10 * pointScale,
        width: "100%",
        aspectRatio: item.media.aspectRatio ?? 16 / 9,
        borderRadius: Math.max(10, projection.theme.geometry.cardRadius - 6) * pointScale,
        overflow: "hidden",
        background: projection.theme.colors.cardSecondary,
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
  const { projection, spec } = requireContext();
  const { theme } = projection;
  const px = (value: number) => value * pointScale;
  const translate = (1 - item.animation.progress) * px(18);
  const communication = item.category === "message" && Boolean(item.leadingImage);
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
      data-notification-category={item.category}
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
        transform: `translate3d(0, ${translate}px, 0) scale(${0.985 + item.animation.progress * 0.015})`,
        fontFamily: theme.typography.fontFamily,
        overflow: "hidden",
        contain: "layout style paint",
        willChange: item.animation.phase === "visible" ? undefined : "transform, opacity",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: communication ? "flex-start" : "center",
          direction: "ltr",
          gap: px(10),
          marginBottom: px(compact ? 7 : 10),
        }}
      >
        <NotificationIcon
          item={item}
          size={px(theme.geometry.iconSize * (communication ? spec.communicationIconScale : 1))}
        />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: px(6), minWidth: 0 }}>
            <div
              style={{
                minWidth: 0,
                flex: 1,
                color: theme.colors.secondaryText,
                fontSize: px(theme.typography.appSize),
                fontWeight: 650,
                textTransform: spec.uppercaseAppName ? "uppercase" : undefined,
                letterSpacing: spec.uppercaseAppName ? "0.015em" : undefined,
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
            >
              {item.appName}
            </div>
            {groupCount && groupCount > 1 ? (
              <div
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
                whiteSpace: "nowrap",
              }}
            >
              {item.ageLabel}
            </time>
          </div>
          <div style={{ marginTop: px(communication ? 3 : 7) }}>
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
                fontWeight: spec.titleWeight,
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
                lineHeight: 1.34,
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: compact ? 1 : 2,
                overflow: "hidden",
              }}
            >
              {item.body}
            </div>
          </div>
        </div>
      </header>
      <NotificationMedia item={item} pointScale={pointScale} />
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

function NotificationGroup({
  group,
  pointScale,
  compact,
}: {
  group: NotificationGroupProjection;
  pointScale: number;
  compact?: boolean;
}) {
  const { projection, spec } = requireContext();
  const depth = spec.stackedGroups ? Math.min(2, Math.max(0, group.count - 1)) : 0;
  return (
    <section
      data-notification-group={group.key}
      style={{ position: "relative", width: "100%", paddingBottom: depth * 7 * pointScale }}
    >
      {Array.from({ length: depth }, (_, index) => depth - index).map((layer) => (
        <div
          key={layer}
          aria-hidden
          style={{
            position: "absolute",
            top: layer * 7 * pointScale,
            insetInline: layer * 3 * pointScale,
            bottom: 0,
            borderRadius: projection.theme.geometry.cardRadius * pointScale,
            ...materialToPaintStyle(projection.theme.materials.secondary, pointScale),
            opacity: 0.88 - layer * 0.08,
            zIndex: layer,
          }}
        />
      ))}
      {group.items[0] ? (
        <div style={{ position: "relative", zIndex: depth + 1 }}>
          <NotificationCard
            item={group.items[0]}
            pointScale={pointScale}
            compact={compact}
            groupCount={group.count}
          />
        </div>
      ) : null}
    </section>
  );
}

export function NotificationPainter({ projection, pointScale, spec }: NotificationPainterProps) {
  const { theme, cinematicSubjects } = projection;
  const px = (value: number) => value * pointScale;
  return (
    <ProjectionContext.Provider value={{ projection, spec }}>
      <div
        data-notification-surface={projection.deviceId}
        data-notification-painter={spec.id}
        data-platform={projection.platform}
        data-appearance={projection.appearance}
        style={{ position: "absolute", inset: 0, zIndex: 900, pointerEvents: "none" }}
      >
        {projection.center.open && cinematicSubjects.center ? (
          <div
            data-notification-center
            dir={projection.direction}
            style={{
              position: "absolute",
              inset: 0,
              boxSizing: "border-box",
              padding: `${px(theme.geometry.centerTop)}px ${px(theme.geometry.centerHorizontalMargin)}px ${px(24)}px`,
              ...materialToPaintStyle(theme.materials.center, pointScale),
              opacity: projection.center.progress,
              transform: `translate3d(0, ${(1 - projection.center.progress) * -px(22)}px, 0)`,
              overflow: "hidden",
            }}
          >
            {spec.centerHeader(projection, pointScale)}
            <div
              style={{ display: "flex", flexDirection: "column", gap: px(theme.geometry.stackGap) }}
            >
              {projection.center.groups.map((group) => (
                <NotificationGroup key={group.key} group={group} pointScale={pointScale} />
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
              gap: px(theme.geometry.stackGap),
            }}
          >
            {projection.lockScreenGroups.map((group) => (
              <NotificationGroup key={group.key} group={group} pointScale={pointScale} compact />
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
}
