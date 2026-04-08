import React from "react";
import { WorldState } from "@tokovo/core";
import { spacing } from "../theme.js";
import { useTheme } from "../../theme/ThemeContext.js";
import { resolveAvatarWithFallback } from "../../utils/avatar.js";

export interface GroupInfoScreenProps {
  world: WorldState;
  conversationId: string;
  safeAreaInsets?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  width: number;
  height: number;
}

export interface GroupMember {
  id: string;
  name: string;
  avatar?: string;
  role?: "admin" | "member";
  phone?: string;
}

interface GroupData {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  createdAt?: string;
  createdBy?: string;
  members: GroupMember[];
}

const MemberItem: React.FC<{
  member: GroupMember;
  isLast: boolean;
}> = ({ member, isLast }) => {
  const theme = useTheme();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        paddingLeft: spacing.avatarMarginLeft,
        paddingRight: spacing.contentMarginRight,
        backgroundColor: theme.colors.background,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: `${theme.colors.divider}66`,
          backgroundImage: member.avatar
            ? `url(${resolveAvatarWithFallback(member.avatar, member.name)})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          marginRight: spacing.contentMarginLeft,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {!member.avatar && (
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill={theme.colors.timestamp}
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        )}
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 12,
          paddingBottom: 12,
          borderBottom: isLast
            ? "none"
            : `0.5px solid ${theme.colors.divider}`,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 17,
              fontWeight: "400",
              color: theme.colors.receivedBubbleText,
              marginBottom: 2,
              fontFamily: theme.typography.fontFamily,
            }}
          >
            {member.name}
          </div>
          {member.phone && (
            <div
              style={{
                fontSize: 14,
                color: theme.colors.timestamp,
                fontFamily: theme.typography.fontFamily,
              }}
            >
              {member.phone}
            </div>
          )}
        </div>

        {member.role === "admin" && (
          <span
            style={{
              fontSize: 12,
              color: theme.colors.timestamp,
              backgroundColor: `${theme.colors.accent}14`,
              padding: "4px 8px",
              borderRadius: 4,
              border: `1px solid ${theme.colors.divider}`,
              fontFamily: theme.typography.fontFamily,
            }}
          >
            Group Admin
          </span>
        )}
      </div>
    </div>
  );
};

const InfoSection: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => {
  const theme = useTheme();

  return (
    <div style={{ marginBottom: 24 }}>
      {title ? (
        <div
          style={{
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: "600",
            color: theme.colors.timestamp,
            textTransform: "uppercase",
            letterSpacing: 0.5,
            fontFamily: theme.typography.fontFamily,
          }}
        >
          {title}
        </div>
      ) : null}
      <div
        style={{
          backgroundColor: theme.colors.background,
          borderTop: `0.5px solid ${theme.colors.divider}`,
          borderBottom: `0.5px solid ${theme.colors.divider}`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

const ActionRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  color?: string;
  isLast?: boolean;
}> = ({ icon, label, color, isLast }) => {
  const theme = useTheme();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "12px 16px",
        gap: 12,
        borderBottom: isLast ? "none" : `0.5px solid ${theme.colors.divider}`,
      }}
    >
      {icon}
      <span
        style={{
          fontSize: 17,
          color: color ?? theme.colors.receivedBubbleText,
          fontFamily: theme.typography.fontFamily,
        }}
      >
        {label}
      </span>
    </div>
  );
};

export const GroupInfoScreen: React.FC<GroupInfoScreenProps> = ({
  world,
  conversationId,
  safeAreaInsets,
  width: _width,
  height: _height,
}) => {
  const theme = useTheme();
  const safeAreaTop = safeAreaInsets?.top ?? 47;

  const appState = world.appState?.["app_whatsapp"] as
    | {
        conversations?: Record<
          string,
          {
            name?: string;
            description?: string;
            avatar?: string;
            createdAt?: string;
            createdBy?: string;
            members?: GroupMember[];
          }
        >;
      }
    | undefined;
  const conversations = appState?.conversations || {};
  const conversation = conversations[conversationId] || {};

  const groupData: GroupData = {
    id: conversationId,
    name: conversation.name || "Group",
    description: conversation.description,
    avatar: conversation.avatar,
    createdAt: conversation.createdAt,
    createdBy: conversation.createdBy,
    members: conversation.members || [],
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: theme.colors.headerBackground,
        position: "relative",
        fontFamily: theme.typography.fontFamily,
      }}
    >
      <div
        style={{
          paddingTop: safeAreaTop,
          backgroundColor: `${theme.colors.headerBackground}F0`,
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: `0.5px solid ${theme.colors.divider}`,
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 16px 12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={theme.colors.accent}
            >
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
            <span
              style={{
                fontSize: 17,
                color: theme.colors.accent,
                fontFamily: theme.typography.fontFamily,
              }}
            >
              Back
            </span>
          </div>
          <span
            style={{
              fontSize: 17,
              fontWeight: "600",
              color: theme.colors.receivedBubbleText,
              fontFamily: theme.typography.fontFamily,
            }}
          >
            Group Info
          </span>
          <span
            style={{
              fontSize: 17,
              color: theme.colors.accent,
              fontFamily: theme.typography.fontFamily,
            }}
          >
            Edit
          </span>
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>
        <div
          style={{
            backgroundColor: theme.colors.background,
            padding: "20px 16px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderBottom: `0.5px solid ${theme.colors.divider}`,
          }}
        >
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: `${theme.colors.divider}66`,
              backgroundImage: groupData.avatar
                ? `url(${resolveAvatarWithFallback(groupData.avatar, groupData.name)})`
                : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            {!groupData.avatar && (
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill={theme.colors.timestamp}
              >
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
            )}
          </div>

          <div
            style={{
              fontSize: 22,
              fontWeight: "600",
              color: theme.colors.receivedBubbleText,
              marginBottom: 4,
              fontFamily: theme.typography.fontFamily,
            }}
          >
            {groupData.name}
          </div>

          <div
            style={{
              fontSize: 14,
              color: theme.colors.timestamp,
              fontFamily: theme.typography.fontFamily,
            }}
          >
            Group · {groupData.members.length} participants
          </div>
        </div>

        {groupData.description && (
          <InfoSection title="Description">
            <div
              style={{
                padding: "12px 16px",
                fontSize: 15,
                color: theme.colors.receivedBubbleText,
                fontFamily: theme.typography.fontFamily,
              }}
            >
              {groupData.description}
            </div>
          </InfoSection>
        )}

        <InfoSection title="Media, Links, and Docs">
          <ActionRow
            icon={
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill={theme.colors.accent}
              >
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
              </svg>
            }
            label="Media, Links, and Docs"
            isLast
          />
        </InfoSection>

        <InfoSection title={`${groupData.members.length} Participants`}>
          <ActionRow
            icon={
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: theme.colors.accent,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
                  <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
            }
            label="Add Participants"
            color={theme.colors.accent}
          />
          {groupData.members.map((member, i) => (
            <MemberItem
              key={member.id}
              member={member}
              isLast={i === groupData.members.length - 1}
            />
          ))}
        </InfoSection>

        <InfoSection title="">
          <ActionRow
            icon={
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="#FF3B30"
              >
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            }
            label="Exit Group"
            color="#FF3B30"
          />
          <ActionRow
            icon={
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="#FF3B30"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
            }
            label="Report Group"
            color="#FF3B30"
            isLast
          />
        </InfoSection>

        <div style={{ height: 40 }} />
      </div>
    </div>
  );
};

export default GroupInfoScreen;
