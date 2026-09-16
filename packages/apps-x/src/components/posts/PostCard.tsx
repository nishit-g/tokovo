import { Freeze, OffthreadVideo, staticFile } from "remotion";
import React from "react";
import { DeterministicImage, ShapedText, useTime, useFps } from "@tokovo/react";
import { useXExperience } from "../../experience/context.js";
import { formatXCount, formatXLongTimestamp, formatXTimestamp } from "../../localization/index.js";
import { measureXPost } from "../../layout/measure.js";
import type { XState, XTweet } from "../../runtime/state.js";
import { requireTweet, requireUser } from "../../runtime/selectors.js";
import { Avatar, VerifiedBadge } from "../primitives/Avatar.js";
import { XIcon, type XIconName } from "../primitives/Icon.js";

const Action: React.FC<{
  icon: XIconName;
  label: string;
  count?: number;
  color: string;
  active?: boolean;
  fill?: string;
  pulse?: number;
}> = ({ icon, label, count, color, active = false, fill = "none", pulse = 1 }) => {
  const experience = useXExperience();
  return (
    <div
      role="button"
      aria-label={count ? `${label}: ${count}` : label}
      style={{
        minWidth: experience.metrics.touchTarget,
        flex: count ? "1 1 0" : `0 0 ${experience.metrics.touchTarget}px`,
        height: 32,
        display: "flex",
        alignItems: "center",
        gap: 3,
        color: active ? color : experience.colors.textSecondary,
      }}
    >
      <span
        style={{
          width: 20,
          minWidth: 20,
          height: 28,
          display: "grid",
          placeItems: "center",
          borderRadius: "50%",
          background: active || pulse > 1 ? `${color}18` : "transparent",
          transform: `scale(${pulse})`,
          transformOrigin: "center",
          willChange: "transform",
        }}
      >
        <XIcon
          name={icon}
          size={17}
          color={active ? color : experience.colors.textSecondary}
          fill={active ? fill : "none"}
          strokeWidth={1.75}
        />
      </span>
      {count && count > 0 ? (
        <span
          style={{
            fontSize: 11 * experience.type.scale,
            minWidth: 0,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            fontVariantNumeric: "tabular-nums",
            transform: "translateY(.5px)",
          }}
        >
          {formatXCount(count, experience.locale)}
        </span>
      ) : null}
    </div>
  );
};

export const PostMedia: React.FC<{ tweet: XTweet; height: number; compact?: boolean }> = ({
  tweet,
  height,
  compact = false,
}) => {
  const experience = useXExperience();
  const frame = useTime();
  const fps = useFps();
  const media = tweet.media;
  if (!media || height <= 0) return null;
  const sources = media.urls.slice(0, 4);
  const columns = sources.length === 1 ? 1 : 2;
  const playback = media.playback;
  const start = (playback?.progress ?? 0) * (media.durationSeconds ?? 0) * fps;
  const elapsed = playback?.state === "playing" ? Math.max(0, frame - (playback.atFrame ?? 0)) : 0;
  const videoFrame = Math.max(
    0,
    Math.floor(
      Math.min(start + elapsed, media.durationSeconds ? media.durationSeconds * fps - 1 : Infinity),
    ),
  );
  return (
    <div
      data-x-anchor={`x.post.${tweet.id}.media`}
      role="img"
      aria-label={media.alt ?? (media.type === "video" ? "Video" : "Post media")}
      style={{
        height,
        width: "100%",
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gridTemplateRows: sources.length > 2 ? "repeat(2, minmax(0, 1fr))" : "1fr",
        gap: 2,
        overflow: "hidden",
        borderRadius: compact ? 0 : experience.metrics.radius,
        border: `1px solid ${experience.colors.border}`,
        position: "relative",
        background: experience.colors.surfaceRaised,
        boxSizing: "border-box",
      }}
    >
      {sources.map((source, index) =>
        media.type === "video" && (!media.posterUrl || playback?.state !== "idle") ? (
          <Freeze key={`${source}:${index}`} frame={videoFrame}>
            <OffthreadVideo
              src={source.startsWith("/") ? staticFile(source.slice(1)) : source}
              muted
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </Freeze>
        ) : (
          <DeterministicImage
            key={`${source}:${index}`}
            src={media.type === "video" && index === 0 ? (media.posterUrl ?? source) : source}
            alt=""
            aria-hidden
            style={{
              gridRow: sources.length === 3 && index === 0 ? "span 2" : undefined,
              width: "100%",
              height: "100%",
              display: "block",
              objectFit: "cover",
              minWidth: 0,
              minHeight: 0,
            }}
          />
        ),
      )}
      {media.type === "video" && playback?.state !== "playing" ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            background: "linear-gradient(180deg, transparent 56%, rgba(0,0,0,.22))",
          }}
        >
          <span
            style={{
              width: compact ? 28 : 48,
              height: compact ? 28 : 48,
              borderRadius: "50%",
              background: "rgba(15,20,25,.78)",
              display: "grid",
              placeItems: "center",
              color: "white",
              boxShadow: "0 6px 22px rgba(0,0,0,.28)",
            }}
          >
            <XIcon
              name={media.playback?.state === "playing" ? "video" : "play"}
              size={22}
              color="#fff"
              fill={media.playback?.state === "playing" ? "none" : "#fff"}
            />
          </span>
        </div>
      ) : null}
      {media.type === "video" && media.playback && media.playback.state !== "idle" ? (
        <div
          style={{
            position: "absolute",
            insetInline: 10,
            bottom: 7,
            height: 3,
            overflow: "hidden",
            borderRadius: 3,
            background: "rgba(255,255,255,.35)",
          }}
        >
          <div
            style={{
              width: `${Math.max(0, Math.min(1, media.durationSeconds ? videoFrame / (media.durationSeconds * fps) : media.playback.progress)) * 100}%`,
              height: "100%",
              borderRadius: 3,
              background: "#fff",
            }}
          />
        </div>
      ) : null}
      {media.sensitive ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            padding: 20,
            textAlign: "center",
            background: experience.colors.mediaScrim,
            color: "#fff",
            backdropFilter: "blur(18px)",
          }}
        >
          <strong style={{ fontSize: 15 }}>{experience.t("sensitiveMedia")}</strong>
          <span style={{ fontSize: 12, lineHeight: 1.35, opacity: 0.86 }}>
            {experience.t("sensitiveBody")}
          </span>
          <span
            style={{
              marginTop: 3,
              padding: "6px 15px",
              borderRadius: 18,
              border: "1px solid rgba(255,255,255,.72)",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {experience.t("show")}
          </span>
        </div>
      ) : null}
    </div>
  );
};

const LinkPreview: React.FC<{ tweet: XTweet; height: number }> = ({ tweet, height }) => {
  const experience = useXExperience();
  const link = tweet.linkPreview;
  if (!link || height <= 0) return null;
  return (
    <div
      data-x-anchor={`x.post.${tweet.id}.link`}
      style={{
        boxSizing: "border-box",
        height,
        overflow: "hidden",
        borderRadius: experience.metrics.radius,
        border: `1px solid ${experience.colors.border}`,
        background: experience.colors.surface,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {link.imageUrl ? (
        <DeterministicImage
          src={link.imageUrl}
          alt=""
          aria-hidden
          style={{
            width: "100%",
            height: 98,
            objectFit: "cover",
            display: "block",
          }}
        />
      ) : null}
      <div style={{ padding: "9px 12px 10px", minHeight: 0 }}>
        <div
          style={{
            color: experience.colors.textSecondary,
            fontSize: 12,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {link.domain}
        </div>
        <div
          style={{
            marginTop: 2,
            fontSize: 14,
            lineHeight: 1.25,
            fontWeight: 550,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {link.title}
        </div>
        {link.description ? (
          <div
            style={{
              marginTop: 2,
              color: experience.colors.textSecondary,
              fontSize: 12,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {link.description}
          </div>
        ) : null}
      </div>
    </div>
  );
};

const Poll: React.FC<{ tweet: XTweet; height: number; nowMs: number }> = ({
  tweet,
  height,
  nowMs,
}) => {
  const experience = useXExperience();
  const poll = tweet.poll;
  if (!poll || height <= 0) return null;
  const total = Math.max(1, poll.totalVotes);
  const ended = poll.endsAt !== undefined && nowMs >= poll.endsAt;
  const results = ended || Boolean(poll.selectedOptionId);
  const minutes = Math.max(1, Math.ceil(((poll.endsAt ?? nowMs) - nowMs) / 60000));
  const remaining = new Intl.RelativeTimeFormat(experience.locale, { numeric: "always" }).format(
    minutes >= 60 ? Math.ceil(minutes / 60) : minutes,
    minutes >= 60 ? "hour" : "minute",
  );
  return (
    <div
      data-x-anchor={`x.post.${tweet.id}.poll`}
      style={{
        height,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 7,
      }}
    >
      {poll.options.map((option) => {
        const percentage = Math.round((option.votes / total) * 100);
        const selected = poll.selectedOptionId === option.id;
        return (
          <div
            key={option.id}
            style={{
              height: experience.text.bodyLine + 11,
              flexShrink: 0,
              position: "relative",
              overflow: "hidden",
              borderRadius: 4,
              background: results ? experience.colors.surfaceRaised : "transparent",
              border: `1px solid ${results ? "transparent" : experience.colors.accent}`,
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                width: results ? `${results ? `${percentage}%` : ""}` : "0%",
                background: selected ? experience.colors.accent : experience.colors.borderStrong,
                opacity: selected ? 0.34 : 0.5,
              }}
            />
            <div
              style={{
                position: "relative",
                height: "100%",
                paddingInline: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                fontSize: experience.text.body,
                fontWeight: selected ? 700 : 550,
              }}
            >
              <span
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {selected ? "✓ " : ""}
                {option.label}
              </span>
              <span style={{ fontVariantNumeric: "tabular-nums" }}>{percentage}%</span>
            </div>
          </div>
        );
      })}
      <div
        style={{
          color: experience.colors.textSecondary,
          fontSize: experience.text.small,
          lineHeight: `${experience.text.smallLine}px`,
        }}
      >
        {formatXCount(poll.totalVotes, experience.locale)} {experience.t("pollVotes")} ·{" "}
        {ended
          ? experience.t("pollEnded")
          : poll.endsAt
            ? `${experience.t("pollEnds")} ${remaining}`
            : experience.t("pollOpen")}
      </div>
    </div>
  );
};

const QuoteCard: React.FC<{ state: XState; tweet: XTweet; height: number }> = ({
  state,
  tweet,
  height,
}) => {
  const experience = useXExperience();
  if (!tweet.quoteTweetId || height <= 0) return null;
  const quote = requireTweet(state, tweet.quoteTweetId, `tweet "${tweet.id}" quoteTweetId`);
  const author = requireUser(state, quote.authorId, `tweet "${quote.id}" authorId`);
  return (
    <div
      data-x-anchor={`x.post.${tweet.id}.quote`}
      style={{
        height,
        padding: 12,
        boxSizing: "border-box",
        borderRadius: experience.metrics.radius,
        border: `1px solid ${experience.colors.borderStrong}`,
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
        <Avatar user={author} size={22} />
        <strong
          style={{
            fontSize: 13,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {author.name}
        </strong>
        <VerifiedBadge variant={author.verified} size={14} />
        <span
          style={{
            color: experience.colors.textSecondary,
            fontSize: 12,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          @{author.handle}
        </span>
      </div>
      <div
        style={{
          marginTop: 7,
          fontSize: 13,
          lineHeight: "18px",
          height: quote.media ? 18 : 54,
          overflow: "hidden",
          whiteSpace: "pre-wrap",
        }}
      >
        {quote.text}
      </div>
      {quote.media ? (
        <div style={{ marginTop: 6 }}>
          <PostMedia tweet={quote} height={52} />
        </div>
      ) : null}
    </div>
  );
};

export const PostCard: React.FC<{
  state: XState;
  tweet: XTweet;
  width: number;
  nowMs: number;
  detail?: boolean;
  showBorder?: boolean;
}> = ({ state, tweet, width, nowMs, detail = false, showBorder = true }) => {
  const experience = useXExperience();
  const frame = useTime();
  const reposter = tweet.repostOfId
    ? requireUser(state, tweet.authorId, `tweet "${tweet.id}" authorId`)
    : undefined;
  const displayed = tweet.repostOfId
    ? requireTweet(state, tweet.repostOfId, `tweet "${tweet.id}" repostOfId`)
    : tweet;
  const author = requireUser(state, displayed.authorId, `tweet "${displayed.id}" authorId`);
  const measurement = measureXPost(
    tweet.repostOfId ? { ...displayed, repostOfId: tweet.repostOfId } : displayed,
    width,
    detail,
    experience.text,
  );
  const liked = Boolean(state.currentUserId && displayed.likedBy.includes(state.currentUserId));
  const bookmarked = Boolean(
    state.currentUserId && displayed.bookmarkedBy.includes(state.currentUserId),
  );
  const shared = Boolean(state.currentUserId && displayed.sharedBy.includes(state.currentUserId));
  const contentWidth = measurement.contentWidth;
  const interactionAge =
    state.recentInteraction?.targetId === displayed.id
      ? frame - state.recentInteraction.atFrame
      : Number.POSITIVE_INFINITY;
  const interactionPulse =
    !experience.reducedMotion &&
    interactionAge >= 0 &&
    interactionAge <= experience.motion.feedbackFrames
      ? 1 + Math.sin((interactionAge / experience.motion.feedbackFrames) * Math.PI) * 0.17
      : 1;
  const interactionType =
    state.recentInteraction?.targetId === displayed.id ? state.recentInteraction.type : null;

  return (
    <article
      data-x-anchor={`x.post.${tweet.id}`}
      aria-label={`Post by ${author.name}`}
      style={{
        height: measurement.totalHeight,
        minHeight: measurement.totalHeight,
        padding: detail ? "12px 16px" : `${experience.metrics.postPaddingY}px 16px`,
        borderBottom: showBorder ? `1px solid ${experience.colors.border}` : "none",
        boxSizing: "border-box",
        background: experience.colors.background,
        overflow: "hidden",
      }}
    >
      {reposter ? (
        <div
          style={{
            height: measurement.repostLabelHeight,
            paddingInlineStart: detail ? 0 : 42,
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: experience.colors.textSecondary,
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          <XIcon name="repost" size={14} />
          <span>
            {reposter.name} {experience.t("reposted")}
          </span>
        </div>
      ) : null}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: detail ? "1fr" : `${experience.metrics.avatar}px minmax(0, 1fr)`,
          columnGap: 12,
          minWidth: 0,
        }}
      >
        {!detail ? <Avatar user={author} size={experience.metrics.avatar} /> : null}
        <div style={{ minWidth: 0 }}>
          <div
            data-x-anchor={`x.post.${tweet.id}.author`}
            style={{
              height: measurement.headerHeight,
              display: "flex",
              alignItems: detail ? "flex-start" : "center",
              gap: 4,
              minWidth: 0,
            }}
          >
            {detail ? <Avatar user={author} size={42} /> : null}
            <div
              style={{
                minWidth: 0,
                display: detail ? "flex" : "contents",
                flexDirection: "column",
                marginInlineStart: detail ? 9 : 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  minWidth: 0,
                }}
              >
                <strong
                  style={{
                    fontSize: 15 * experience.type.scale,
                    fontWeight: 700,
                    letterSpacing: "-.012em",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {author.name}
                </strong>
                <VerifiedBadge variant={author.verified} size={16} />
              </div>
              <span
                style={{
                  color: experience.colors.textSecondary,
                  fontSize: 14 * experience.type.scale,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                @{author.handle}
                {detail
                  ? ""
                  : ` · ${formatXTimestamp(displayed.createdAt, nowMs, experience.locale)}`}
              </span>
            </div>
            <span
              style={{
                marginInlineStart: "auto",
                color: experience.colors.textSecondary,
                width: 28,
                height: 28,
                display: "grid",
                placeItems: "center",
              }}
            >
              <XIcon name="more" size={18} />
            </span>
          </div>

          {displayed.replyToId && !detail ? (
            <div
              style={{
                color: experience.colors.textSecondary,
                fontSize: 13,
                lineHeight: `${experience.text.smallLine}px`,
                height: measurement.replyLabelHeight,
                boxSizing: "border-box",
              }}
            >
              {experience.t("repliedTo")}{" "}
              <span style={{ color: experience.colors.accent }}>
                @{requireUser(state, requireTweet(state, displayed.replyToId).authorId).handle}
              </span>
            </div>
          ) : null}

          {measurement.bodyHeight > 0 ? (
            <div
              data-x-anchor={`x.post.${tweet.id}.body`}
              style={{
                height: measurement.bodyHeight,
                marginTop: 5,
                fontSize: (detail ? 20 : 15) * experience.type.scale,
                lineHeight: `${detail ? experience.text.detailLine : experience.text.bodyLine}px`,
                letterSpacing: 0,
                whiteSpace: "pre-wrap",
                overflow: "hidden",
                unicodeBidi: "plaintext",
              }}
            >
              {measurement.textLines.map((line, index) => (
                <div
                  key={index}
                  style={{
                    height: detail ? experience.text.detailLine : experience.text.bodyLine,
                    whiteSpace: "pre",
                  }}
                >
                  <ShapedText text={line} />
                </div>
              ))}
              {measurement.truncated ? (
                <div style={{ color: experience.colors.accent }}>{experience.t("showMore")}</div>
              ) : null}
            </div>
          ) : null}

          {measurement.attachmentHeight > 0 ? (
            <div
              style={{
                marginTop: 10,
                width: Math.max(0, contentWidth),
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <PostMedia tweet={displayed} height={measurement.primaryAttachmentHeight} />
              <LinkPreview tweet={displayed} height={measurement.primaryAttachmentHeight} />
              <Poll tweet={displayed} height={measurement.primaryAttachmentHeight} nowMs={nowMs} />
              <QuoteCard state={state} tweet={displayed} height={measurement.quoteHeight} />
            </div>
          ) : null}

          {detail ? (
            <div
              style={{
                height: 38,
                display: "flex",
                alignItems: "center",
                color: experience.colors.textSecondary,
                fontSize: 14,
                borderBottom: `1px solid ${experience.colors.border}`,
              }}
            >
              {formatXLongTimestamp(displayed.createdAt, experience.locale)}
            </div>
          ) : null}

          <div
            data-x-anchor={`x.post.${tweet.id}.metrics`}
            style={{
              height: detail ? 38 : measurement.metricsHeight,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              maxWidth: detail ? "100%" : 310,
              borderBottom: detail ? `1px solid ${experience.colors.border}` : "none",
            }}
          >
            <Action
              icon="reply"
              label={experience.t("reply")}
              count={displayed.replyIds.length}
              color={experience.colors.reply}
            />
            <Action
              icon="repost"
              label={experience.t("repost")}
              count={displayed.repostCount}
              color={experience.colors.repost}
            />
            <Action
              icon="like"
              label={experience.t("like")}
              count={displayed.likeCount}
              color={experience.colors.like}
              active={liked}
              fill={experience.colors.like}
              pulse={
                interactionType === "like" || interactionType === "unlike" ? interactionPulse : 1
              }
            />
            {!detail ? (
              <Action
                icon="views"
                label={experience.t("views")}
                count={displayed.viewCount}
                color={experience.colors.reply}
              />
            ) : null}
            <Action
              icon="bookmark"
              label={experience.t("bookmark")}
              count={detail ? displayed.bookmarkCount : undefined}
              color={experience.colors.accent}
              active={bookmarked}
              fill={experience.colors.accent}
              pulse={
                interactionType === "bookmark" || interactionType === "unbookmark"
                  ? interactionPulse
                  : 1
              }
            />
            <Action
              icon="share"
              label={experience.t("share")}
              count={detail ? displayed.shareCount : undefined}
              color={experience.colors.accent}
              active={shared}
              pulse={interactionType === "share" ? interactionPulse : 1}
            />
          </div>

          {detail ? (
            <div
              style={{
                height: 38,
                display: "flex",
                alignItems: "center",
                gap: 18,
                fontSize: 13,
              }}
            >
              <span>
                <strong>{formatXCount(displayed.repostCount, experience.locale)}</strong>{" "}
                <span style={{ color: experience.colors.textSecondary }}>
                  {experience.t("repost")}
                </span>
              </span>
              <span>
                <strong>{formatXCount(displayed.likeCount, experience.locale)}</strong>{" "}
                <span style={{ color: experience.colors.textSecondary }}>
                  {experience.t("likes")}
                </span>
              </span>
              <span>
                <strong>{formatXCount(displayed.viewCount, experience.locale)}</strong>{" "}
                <span style={{ color: experience.colors.textSecondary }}>
                  {experience.t("views")}
                </span>
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
};
