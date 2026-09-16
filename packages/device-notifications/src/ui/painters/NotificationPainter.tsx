import React from "react";
import { MeasuredHistory } from "./MeasuredHistory.js";
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
  const { projection } = requireContext();
  const native = projection.notificationUX === "native" && projection.platform === "ios";
  const isCommunication = item.category === "message" && (Boolean(item.leadingImage) || native);
  const primaryImage = item.leadingImage ?? (isCommunication ? Array.from(item.title)[0] || "?" : item.icon);
  const isImage = /^(?:https?:|data:|\/)/u.test(primaryImage);
  const clipId = `notification-avatar-${item.id.replace(/[^a-zA-Z0-9_-]/gu, "-")}`;
  return (
    <div aria-hidden style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: isCommunication ? "50%" : size * 0.24,
          background: isCommunication && isImage ? "transparent" : item.accentColor,
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
  const native = projection.notificationUX === "native" && projection.platform === "ios";
  const expanded = projection.expanded?.item.id === item.id;
  const px = (value: number) => value * pointScale;
  const progress = theme.motion.reduced ? 1 : item.animation.progress;
  const banner = surface === "banner";
  const translate = (1 - progress) * (banner
    ? -(projection.cinematicSubjects.banner?.height ?? px(theme.geometry.bannerMinHeight)) - px(theme.geometry.bannerTop)
    : px(18));
  const communication = item.category === "message" && (Boolean(item.leadingImage) || native);
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
        height: banner ? projection.cinematicSubjects.banner?.height : undefined,
        padding: px(theme.geometry.cardPadding),
        borderRadius: px(theme.geometry.cardRadius),
        color: theme.colors.text,
        ...materialToPaintStyle(theme.materials.card, pointScale),
        ...(native && expanded && projection.expanded?.inputSessionId ? {
          borderBottomLeftRadius: 0, borderBottomRightRadius: 0, boxShadow: "none",
        } : {}),
        opacity: progress,
        transform: `translate3d(0, ${translate}px, 0) scale(${banner ? 1 : 0.985 + progress * 0.015})`,
        fontFamily: theme.typography.fontFamily,
        overflow: "hidden",
        contain: "layout style paint",
        willChange: item.animation.phase === "visible" ? undefined : "transform, opacity",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: communication && !native ? "flex-start" : "center",
          direction: projection.direction,
          gap: px(10),
          marginBottom: native || banner ? 0 : px(compact ? 7 : 10),
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
                color: native && communication ? theme.colors.text : theme.colors.secondaryText,
                fontSize: px(native && communication ? theme.typography.titleSize : theme.typography.appSize),
                lineHeight: 1.2,
                fontWeight: native ? (communication ? 600 : 400) : 650,
                textTransform: !native && spec.uppercaseAppName ? "uppercase" : undefined,
                letterSpacing: !native && spec.uppercaseAppName ? "0.015em" : undefined,
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
            >
              {native && communication ? item.title : item.appName}
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
                {new Intl.NumberFormat(projection.locale).format(groupCount)}
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
          <div dir={item.direction} style={{ marginTop: px(native || banner || communication ? 3 : 7) }}>
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
            {!(native && communication) ? <div
              style={{
                fontSize: px(theme.typography.titleSize),
                fontWeight: native ? 600 : spec.titleWeight,
                lineHeight: 1.24,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: native && expanded ? "normal" : "nowrap",
              }}
            >
              {item.title}
            </div> : null}
            {(!compact || (native && communication)) && item.subtitle && item.subtitle !== item.title ? (
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
                WebkitLineClamp: native && expanded ? 8 : 2,
                overflowWrap: "anywhere",
                overflow: "hidden",
              }}
            >
              {item.body}
            </div>
          </div>
        </div>
        {(banner || (native && !expanded)) && item.media?.kind === "image" ? (
          <DeterministicImage src={item.media.src} alt={item.media.alt ?? ""}
            style={{ width: px(44), height: px(44), flexShrink: 0, alignSelf: "center", objectFit: "cover", borderRadius: px(8) }} />
        ) : null}
      </header>
      {!compact && (!native || expanded) && <NotificationMedia item={item} pointScale={pointScale} />}
      {!compact && (!native || expanded) && (item.reply || item.actions.length > 0) ? (
        <footer
          style={{
            display: "flex",
            direction: projection.direction,
            gap: px(7),
            marginTop: px(11),
            flexWrap: "wrap",
          }}
        >
          {item.reply && !(projection.expanded?.item.id === item.id && projection.expanded.inputSessionId) ? (
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

function SwipeCard({ item, pointScale, compact, groupCount }: { item: NotificationItemProjection; pointScale: number; compact?: boolean; groupCount?: number }) {
  const { projection } = requireContext();
  const native = projection.notificationUX === "native" && projection.platform === "ios";
  const progress = item.swipeProgress ?? 0;
  const distance = 144 * pointScale;
  return <div style={{ position: "relative", overflow: "hidden", borderRadius: projection.theme.geometry.cardRadius * pointScale }}>
    {progress > 0 ? <div data-notification-swipe-actions style={{ position: "absolute", insetBlock: 0, right: 0,
      width: distance, display: "flex", gap: native ? 6 * pointScale : 0, paddingInlineStart: native ? 6 * pointScale : 0, boxSizing: "border-box", opacity: progress, color: "white", fontSize: projection.theme.typography.bodySize * pointScale }}>
      {[projection.strings.options, projection.strings.clear].map((label, index) => <div key={label} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        borderRadius: native ? projection.theme.geometry.cardRadius * pointScale : undefined,
        background: index ? projection.theme.colors.actionDestructive : projection.theme.colors.secondaryText }}>{label}</div>)}
    </div> : null}
    <div style={{ transform: `translate3d(${-distance * progress}px,0,0)` }}>
      <NotificationCard item={item} pointScale={pointScale} compact={compact} groupCount={groupCount} />
    </div>
  </div>;
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
  const expansion = group.expansionProgress ?? 0;
  const native = projection.notificationUX === "native" && projection.platform === "ios";
  const depth = spec.stackedGroups ? Math.min(2, Math.max(0, group.count - 1)) : 0;
  const progress = group.progress ?? 1;
  return (
    <div style={{ display: "grid", gridTemplateRows: `${progress}fr`, opacity: progress,
      marginBottom: projection.theme.geometry.stackGap * pointScale * progress }}>
    <div style={{ minHeight: 0, overflow: "hidden" }}>
    {native && group.count > 1 && expansion > 0 ? <div data-notification-group-heading style={{ display: "grid", gridTemplateRows: `${expansion}fr`, opacity: expansion }}>
      <div style={{ minHeight: 0, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 * pointScale, padding: `${10 * pointScale}px ${4 * pointScale}px`, color: projection.theme.colors.text, fontFamily: projection.theme.typography.fontFamily }}>
          <span style={{ flex: 1, fontSize: projection.theme.typography.titleSize * pointScale, fontWeight: 600 }}>{group.items[0]?.appName}</span>
          <span style={{ color: projection.theme.colors.secondaryText, fontSize: projection.theme.typography.timestampSize * pointScale }}>{new Intl.NumberFormat(projection.locale).format(group.count)}</span>
          <svg aria-hidden width={16 * pointScale} height={16 * pointScale} viewBox="0 0 24 24" fill="none"><path d="m6 15 6-6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      </div>
    </div> : null}
    <section
      data-notification-group={group.key}
      style={{ position: "relative", width: "100%", paddingBottom: depth * 7 * pointScale * (1 - expansion) }}
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
            opacity: (0.88 - layer * 0.08) * (1 - expansion),
            zIndex: layer,
          }}
        />
      ))}
      {group.items[0] ? (
        <div style={{ position: "relative", zIndex: depth + 1 }}>
          <SwipeCard
            item={group.items[0]}
            pointScale={pointScale}
            compact={compact}
            groupCount={expansion > 0 ? undefined : group.count}
          />
        </div>
      ) : null}
      {expansion > 0 ? group.items.slice(1).map((item) => <div key={item.id} style={{ display: "grid", gridTemplateRows: `${expansion}fr`, opacity: expansion }}>
        <div style={{ minHeight: 0, overflow: "hidden", position: "relative", zIndex: depth + 1 }}>
          <div style={{ paddingTop: projection.theme.geometry.stackGap * pointScale * expansion }}>
            <SwipeCard item={item} pointScale={pointScale} compact={compact} />
          </div>
        </div>
      </div>) : null}
    </section>
    </div>
    </div>
  );
}

export function NotificationPainter({ projection, pointScale, spec }: NotificationPainterProps) {
  const { theme, cinematicSubjects } = projection;
  const native = projection.notificationUX === "native" && projection.platform === "ios";
  const px = (value: number) => value * pointScale;
  const nativeLockHistory = projection.notificationUX === "native" && projection.platform === "ios" && projection.deviceContext.isLocked;
  const historyHeight = Math.max(0, (cinematicSubjects.center?.height ?? 0) - px(theme.geometry.lockScreenTop + theme.geometry.lockScreenBottom));
  // Split settled expanded stacks into independently windowable cards. Preserve
  // the original nested grid while expansion is in flight.
  const historyRows = nativeLockHistory ? projection.center.groups.flatMap((group) =>
    group.expansionProgress === 1 && group.items.length > 1
      ? group.items.map((item, index) => ({ ...group, key: JSON.stringify([group.key, index]),
          items: [item], count: index === 0 ? group.count : 1, expansionProgress: index === 0 ? 1 : 0 }))
      : [group]) : [];
  return (
    <ProjectionContext.Provider value={{ projection, spec }}>
      <div
        data-notification-surface={projection.deviceId}
        data-notification-painter={spec.id}
        data-notification-ux={projection.notificationUX}
        data-platform={projection.platform}
        data-appearance={projection.appearance}
        style={{ position: "absolute", inset: 0, zIndex: 900, pointerEvents: "none" }}
      >
        {projection.expanded ? (
          <div data-notification-expanded style={{ position: "absolute", inset: 0, zIndex: 2,
            background: theme.colors.centerScrim, opacity: projection.expanded.progress,
            display: "flex", alignItems: native && projection.expanded.inputSessionId ? "flex-end" : "center", padding: px(theme.geometry.centerHorizontalMargin),
            paddingBottom: (projection.expanded.keyboardInset ?? 0) + px(theme.geometry.centerHorizontalMargin), boxSizing: "border-box" }}>
            <div style={{ width: "100%", maxHeight: "85%", overflow: "hidden", borderRadius: px(theme.geometry.cardRadius),
              transform: native ? `translateY(${px(16) * (1 - projection.expanded.progress)}px) scale(${0.97 + 0.03 * projection.expanded.progress})` : undefined }}>
              <NotificationCard item={projection.expanded.item} pointScale={pointScale} />
              {projection.expanded.inputSessionId && native ? <div data-notification-reply-composer dir={projection.expanded.item.direction}
                style={{ padding: px(10), background: theme.colors.card, borderTop: `${px(0.5)}px solid ${theme.colors.border}`, display: "flex", alignItems: "flex-end", gap: px(8) }}>
                <div data-notification-reply-draft style={{ flex: 1, minWidth: 0, minHeight: px(22), maxHeight: px(112), overflow: "hidden",
                  padding: `${px(8)}px ${px(12)}px`, borderRadius: px(20), border: `${px(1)}px solid ${theme.colors.border}`,
                  background: theme.colors.cardSecondary, color: projection.expanded.draft ? theme.colors.text : theme.colors.secondaryText,
                  fontFamily: theme.typography.fontFamily, fontSize: px(theme.typography.bodySize), lineHeight: 1.35, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                  {projection.expanded.draft || projection.expanded.item.reply?.placeholder || projection.strings.reply}
                  <span aria-hidden style={{ display: "inline-block", height: "1.1em", width: px(2), marginInlineStart: px(2), background: theme.colors.action, verticalAlign: "text-bottom" }} />
                </div>
                <div aria-hidden style={{ width: px(32), height: px(32), marginBottom: px(4), borderRadius: "50%", background: theme.colors.action, color: "white", display: "grid", placeItems: "center", flexShrink: 0, opacity: projection.expanded.draft ? 1 : 0.4 }}>
                  <svg width={px(20)} height={px(20)} viewBox="0 0 24 24" fill="none"><path d="M12 19V5m-6 6 6-6 6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
              </div> : projection.expanded.inputSessionId ? <div data-notification-reply-draft dir={projection.expanded.item.direction}
                style={{ padding: px(theme.geometry.cardPadding), background: theme.colors.card, color: theme.colors.text,
                  fontSize: px(theme.typography.bodySize), whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                {projection.expanded.draft || projection.expanded.item.reply?.placeholder || projection.strings.reply}
              </div> : null}
            </div>
          </div>
        ) : null}
        {(!projection.expanded || native) && projection.center.open && cinematicSubjects.center ? (
          <div
            data-notification-center
            dir={projection.direction}
            style={{
              position: "absolute",
              inset: 0,
              boxSizing: "border-box",
              padding: `${px(theme.geometry.centerTop)}px ${px(theme.geometry.centerHorizontalMargin)}px ${px(24)}px`,
              ...materialToPaintStyle(theme.materials.center, pointScale),
              ...(nativeLockHistory ? { background: "transparent", backdropFilter: "none", padding: 0 } : {}),
              opacity: projection.center.progress,
              transform: `translate3d(0, ${(1 - projection.center.progress) * px(nativeLockHistory ? 44 : -22)}px, 0)`,
              overflow: "hidden",
            }}
          >
            {nativeLockHistory ? null : spec.centerHeader(projection, pointScale)}
            <div
              style={{ display: "flex", flexDirection: "column", ...(nativeLockHistory ? {
                position: "absolute", bottom: px(theme.geometry.lockScreenBottom), left: px(theme.geometry.centerHorizontalMargin),
                right: px(theme.geometry.centerHorizontalMargin), maxHeight: historyHeight, overflow: "hidden",
              } as React.CSSProperties : {}) }}
            >
              {nativeLockHistory ? <MeasuredHistory
                height={historyHeight} position={projection.center.scrollPosition}
                contextKey={JSON.stringify([theme, pointScale, cinematicSubjects.center?.width, projection.expanded?.item.id])}
                keys={historyRows.map((group) => JSON.stringify({ ...group, items: group.items.map(({ ageLabel: _age, animation: _animation, swipeProgress: _swipe, ...item }) => item) }))}
                header={<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: px(12), color: theme.colors.text, fontFamily: theme.typography.fontFamily }}>
                  <span style={{ fontSize: px(22), fontWeight: 600 }}>{projection.strings.centerTitle}</span>
                  <span aria-hidden style={{ width: px(28), height: px(28), display: "grid", placeItems: "center", borderRadius: "50%", ...materialToPaintStyle(theme.materials.secondary, pointScale) }}>×</span>
                </div>}
                renderRow={(index) => <NotificationGroup group={historyRows[index]} pointScale={pointScale} />}
              /> : <div data-notification-history-content style={{ flexShrink: 0, transform: nativeLockHistory
                ? `translateY(min(0px, calc(${historyHeight * projection.center.scrollPosition}px - ${projection.center.scrollPosition * 100}%)))`
                : undefined }}>
              {nativeLockHistory ? <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: px(12), color: theme.colors.text, fontFamily: theme.typography.fontFamily }}>
                <span style={{ fontSize: px(22), fontWeight: 600 }}>{projection.strings.centerTitle}</span>
                <span aria-hidden style={{ width: px(28), height: px(28), display: "grid", placeItems: "center", borderRadius: "50%", ...materialToPaintStyle(theme.materials.secondary, pointScale) }}>×</span>
              </div> : null}
              {projection.center.groups.map((group) => (
                <NotificationGroup key={group.key} group={group} pointScale={pointScale} />
              ))}
              </div>}
            </div>
          </div>
        ) : null}

        {(!projection.expanded || native) && !projection.center.open &&
        cinematicSubjects.lockScreen ? (
          <div
            data-notification-lock-screen
            style={{
              position: "absolute",
              left: cinematicSubjects.lockScreen.x,
              top: projection.platform === "ios" && projection.notificationUX === "native" ? undefined : cinematicSubjects.lockScreen.y,
              bottom: projection.platform === "ios" && projection.notificationUX === "native" ? px(theme.geometry.lockScreenBottom) : undefined,
              maxHeight: projection.notificationUX === "native" ? cinematicSubjects.lockScreen.height - px(theme.geometry.lockScreenBottom) : undefined,
              overflow: projection.notificationUX === "native" ? "hidden" : undefined,
              width: cinematicSubjects.lockScreen.width,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {projection.displayAs === "count" ? <div data-notification-count style={{ textAlign: "center", padding: native ? `${px(8)}px ${px(16)}px` : px(12), alignSelf: native ? "center" : undefined,
              borderRadius: px(30), ...materialToPaintStyle(theme.materials.card, pointScale), color: theme.colors.text,
              fontFamily: theme.typography.fontFamily, fontSize: px(theme.typography.bodySize) }}>{projection.countLabel}</div> : projection.lockScreenGroups.map((group) => (
              <NotificationGroup key={group.key} group={group} pointScale={pointScale} compact />
            ))}
          </div>
        ) : null}

        {(!projection.expanded || native) && !projection.center.open &&
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
