import React from "react";
import type { TeamsState } from "../../types/index.js";
import { selectActiveChannel, selectChannelFeedRows } from "../../selectors/index.js";
import {
  contentScrollStyle,
  listSectionStyle,
  searchPillStyle,
  sectionLabelStyle,
  statCardStyle,
  statLabelStyle,
  statsRowStyle,
  statValueStyle,
  subtitleStyle,
  topSurfaceStyle,
} from "../../styles.js";
import { BackIcon, SearchIcon } from "../shared/Icons.js";
import { HeaderBar } from "../shared/HeaderBar.js";
import { ThreadSummaryCard } from "../shared/ThreadSummaryCard.js";

export const ChannelFeedScreen: React.FC<{ state: TeamsState }> = ({ state }) => {
  const channel = selectActiveChannel(state);
  const rows = selectChannelFeedRows(state);
  const activeTypingCount = rows.filter((row) => row.typingUserIds.length > 0).length;
  const unreadCount = rows.reduce((sum, row) => sum + row.unreadCount, 0);

  return (
    <>
      <div style={topSurfaceStyle}>
        <HeaderBar
          title={channel ? `# ${channel.name}` : "Channel"}
          subtitle={channel?.description ?? `${rows.length} active threads`}
          leading={<BackIcon size={20} color="var(--teams-text-secondary)" />}
        />
        <div style={searchPillStyle}>
          <SearchIcon size={16} color="var(--teams-text-secondary)" />
          <span>Search threads, files, and announcements</span>
        </div>
        <div style={statsRowStyle}>
          <div style={statCardStyle}>
            <div style={statValueStyle}>{rows.length}</div>
            <div style={statLabelStyle}>Threads</div>
          </div>
          <div style={statCardStyle}>
            <div style={statValueStyle}>{unreadCount}</div>
            <div style={statLabelStyle}>Unread</div>
          </div>
          <div style={statCardStyle}>
            <div style={statValueStyle}>{activeTypingCount}</div>
            <div style={statLabelStyle}>Typing</div>
          </div>
        </div>
      </div>
      <div className="tokovo-teams-scrollbar" style={contentScrollStyle}>
        <div style={sectionLabelStyle}>Active threads</div>
        <div style={{ padding: "0 16px 10px", ...subtitleStyle }}>
          Prioritized thread view for channel replies, mentions, and live typing.
        </div>
        <div style={listSectionStyle}>
          {rows.map((row) => (
            <ThreadSummaryCard
              key={row.id}
              title={row.title}
              subtitle={row.subtitle}
              footerLabel={row.footerLabel}
              timestampLabel={row.timestampLabel}
              replyCount={row.replyCount}
              unreadCount={row.unreadCount}
              mentionCount={row.mentionCount}
              typingLabel={
                row.typingUserIds.length > 0
                  ? `${row.typingUserIds.length} collaborator${row.typingUserIds.length === 1 ? "" : "s"} typing`
                  : undefined
              }
            />
          ))}
        </div>
      </div>
    </>
  );
};
