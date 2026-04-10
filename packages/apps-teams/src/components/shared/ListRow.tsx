import React from "react";
import {
  badgeStyle,
  rowCardStyle,
  rowFooterStyle,
  rowAuxTextStyle,
  rowMainStyle,
  rowSubtitleStyle,
  rowTitleStyle,
  subtitleStyle,
} from "../../styles.js";
import { CheckIcon, DoubleCheckIcon, MuteIcon, ReplyIcon } from "./Icons.js";

export const ListRow: React.FC<{
  avatar: React.ReactNode;
  title: string;
  subtitle: string;
  meta?: string;
  timestampLabel?: string;
  kind?: "dm" | "channel" | "thread";
  footerLabel?: string;
  replyCount?: number;
  unreadCount?: number;
  mentionCount?: number;
  muted?: boolean;
  active?: boolean;
  emphasized?: boolean;
  deliveryState?: "sending" | "sent" | "delivered" | "read";
  index?: number;
}> = ({
  avatar,
  title,
  subtitle,
  meta,
  timestampLabel,
  kind,
  footerLabel,
  replyCount = 0,
  unreadCount = 0,
  mentionCount = 0,
  muted = false,
  active = false,
  emphasized = false,
  deliveryState,
  index = 0,
}) => {
  const deliveryIcon =
    deliveryState === "read" ? (
      <DoubleCheckIcon size={13} color="var(--teams-brand)" />
    ) : deliveryState === "delivered" ? (
      <DoubleCheckIcon size={13} color="var(--teams-text-muted)" />
    ) : deliveryState === "sent" ? (
      <CheckIcon size={13} color="var(--teams-text-muted)" />
    ) : null;

  return (
  <div style={{ ...rowCardStyle(active, emphasized), animationDelay: `${index * 30}ms` }}>
    {avatar}
    <div style={rowMainStyle}>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ ...rowTitleStyle, flex: 1, minWidth: 0 }}>{title}</div>
        {timestampLabel ? <div style={subtitleStyle}>{timestampLabel}</div> : null}
        {!timestampLabel && meta ? <div style={subtitleStyle}>{meta}</div> : null}
      </div>
      <div style={rowSubtitleStyle}>{subtitle}</div>
      {(kind || footerLabel || meta) ? (
        <div style={rowFooterStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            {footerLabel ? <span style={rowAuxTextStyle}>{footerLabel}</span> : null}
            {replyCount > 0 ? (
              <span style={{ ...rowAuxTextStyle, display: "inline-flex", alignItems: "center", gap: 4 }}>
                <ReplyIcon size={12} color="var(--teams-text-muted)" />
                {replyCount}
              </span>
            ) : null}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {timestampLabel && meta ? <span style={rowAuxTextStyle}>{meta}</span> : null}
            {deliveryIcon}
          </div>
        </div>
      ) : null}
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
      {mentionCount > 0 ? <span style={badgeStyle("mention")}>@{mentionCount}</span> : null}
      {unreadCount > 0 ? <span style={badgeStyle("unread")}>{unreadCount}</span> : null}
      {muted ? <span style={badgeStyle("muted")}><MuteIcon size={12} color="var(--teams-text-secondary)" /></span> : null}
    </div>
  </div>
  );
};
