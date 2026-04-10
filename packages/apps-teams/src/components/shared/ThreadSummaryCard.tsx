import React from "react";
import { ListRow } from "./ListRow.js";
import { Avatar } from "./Avatar.js";

export const ThreadSummaryCard: React.FC<{
  title: string;
  subtitle: string;
  footerLabel?: string;
  timestampLabel?: string;
  replyCount: number;
  unreadCount: number;
  mentionCount: number;
  typingLabel?: string;
}> = ({
  title,
  subtitle,
  footerLabel,
  timestampLabel,
  replyCount,
  unreadCount,
  mentionCount,
  typingLabel,
}) => (
  <ListRow
    avatar={<Avatar name={title} size={42} tone="neutral" />}
    title={title}
    subtitle={typingLabel ?? subtitle}
    meta={`${replyCount} repl${replyCount === 1 ? "y" : "ies"}`}
    timestampLabel={timestampLabel}
    kind="thread"
    footerLabel={footerLabel}
    unreadCount={unreadCount}
    mentionCount={mentionCount}
    emphasized={unreadCount > 0 || mentionCount > 0}
  />
);
