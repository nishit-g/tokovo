import React from "react";
import type { TeamsState } from "../../types/index.js";
import { selectChatListRows, selectUnreadSummary } from "../../selectors/index.js";
import { Avatar, AvatarStack } from "../shared/Avatar.js";
import { BellIcon, EditIcon, MenuIcon, SearchIcon } from "../shared/Icons.js";
import { FilterTabs } from "../shared/FilterTabs.js";
import { HeaderBar } from "../shared/HeaderBar.js";
import { ListRow } from "../shared/ListRow.js";
import {
  contentScrollStyle,
  listSectionStyle,
  searchPillStyle,
  sectionLabelStyle,
  subtitleStyle,
  topSurfaceStyle,
} from "../../styles.js";

export const ChatListScreen: React.FC<{ state: TeamsState }> = ({ state }) => {
  const rows = selectChatListRows(state);
  const unreadSummary = selectUnreadSummary(state);
  const favoriteRows = rows.filter((row) => row.pinned);
  const favoriteIds = new Set(favoriteRows.map((row) => `${row.kind}:${row.id}`));
  const streamRows = rows.filter((row) => !favoriteIds.has(`${row.kind}:${row.id}`));
  const mutedCount = rows.filter((row) => row.muted).length;
  const meetingCount = rows.filter((row) => row.isMeeting).length;

  return (
    <>
      <div style={topSurfaceStyle}>
        <HeaderBar
          title="Chat"
          subtitle="Chats, channels, meetings, and Copilot"
          leading={<MenuIcon size={20} color="var(--teams-text-secondary)" />}
          trailing={
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <SearchIcon size={20} color="var(--teams-text-secondary)" />
              <EditIcon size={20} color="var(--teams-text-secondary)" />
              <BellIcon size={20} color="var(--teams-text-secondary)" />
              <Avatar name="You" size={30} presence="available" />
            </div>
          }
        />
        <div style={searchPillStyle}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 999,
              background: "var(--teams-brand-soft)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <SearchIcon size={16} color="var(--teams-brand)" />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--teams-text-primary)" }}>
              Copilot
            </div>
            <div style={{ ...subtitleStyle, marginTop: 1 }}>
              Ask, search, or catch up across chats and channels
            </div>
          </div>
        </div>
        <FilterTabs
          active={state.ui.activeListFilter}
          items={[
            { id: "unread", label: "Unread", badge: unreadSummary.total },
            { id: "chat", label: "Chat" },
            { id: "channels", label: "Channels" },
            { id: "meetings", label: "Meetings", badge: meetingCount },
            { id: "muted", label: "Muted", badge: mutedCount },
          ]}
        />
      </div>
      <div className="tokovo-teams-scrollbar" style={contentScrollStyle}>
        <div style={{ ...sectionLabelStyle, paddingBottom: 6 }}>Discover</div>
        <div style={{ padding: "0 16px 14px", ...subtitleStyle }}>
          Pinned conversations stay on top. The rest of the stream is interleaved by recency.
        </div>
        {favoriteRows.length > 0 ? (
          <>
            <div style={sectionLabelStyle}>Favorites</div>
            <div style={listSectionStyle}>
              {favoriteRows.map((row, index) => (
                <ListRow
                  key={`priority:${row.kind}:${row.id}`}
                  avatar={
                    row.kind === "dm" && row.avatarNames.length > 1 ? (
                      <AvatarStack names={row.avatarNames} size={42} />
                    ) : (
                      <Avatar
                        name={row.title.replace(/^# /, "")}
                        size={42}
                        presence={row.presence}
                        tone="neutral"
                      />
                    )
                  }
                  title={row.title}
                  subtitle={row.subtitle}
                  timestampLabel={row.timestampLabel}
                  kind={row.kind}
                  footerLabel={row.footerLabel}
                  replyCount={row.replyCount}
                  unreadCount={row.unreadCount}
                  mentionCount={row.mentionCount}
                  muted={row.muted}
                  emphasized
                  deliveryState={row.deliveryState}
                  index={index}
                />
              ))}
            </div>
          </>
        ) : null}
        <div style={sectionLabelStyle}>Recent</div>
        <div style={listSectionStyle}>
          {streamRows.map((row, index) => (
            <ListRow
              key={`${row.kind}:${row.id}`}
              avatar={
                row.kind === "dm" && row.avatarNames.length > 1 ? (
                  <AvatarStack names={row.avatarNames} size={42} />
                ) : (
                  <Avatar
                    name={row.title}
                    size={42}
                    presence={row.presence}
                    tone="neutral"
                  />
                )
              }
              title={row.title}
              subtitle={row.subtitle}
              timestampLabel={row.timestampLabel}
              kind={row.kind}
              footerLabel={row.footerLabel}
              replyCount={row.replyCount}
              unreadCount={row.unreadCount}
              mentionCount={row.mentionCount}
              muted={row.muted}
              emphasized={row.unreadCount > 0 || row.mentionCount > 0 || row.pinned}
              deliveryState={row.deliveryState}
              index={index}
            />
          ))}
        </div>
      </div>
    </>
  );
};
