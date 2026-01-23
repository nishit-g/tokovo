import React from "react";
import { WorldState } from "@tokovo/core";

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

const ANDROID_COLORS = {
  background: "#0B141A",
  surface: "#1F2C34",
  primary: "#00A884",
  textPrimary: "#E9EDEF",
  textSecondary: "#8696A0",
  separator: "#222D34",
  danger: "#F15C6D",
};

const MemberItem: React.FC<{
  member: GroupMember;
}> = ({ member }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "12px 16px",
        backgroundColor: ANDROID_COLORS.background,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: "#2A3942",
          backgroundImage: member.avatar ? `url(${member.avatar})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          marginRight: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {!member.avatar && (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#8696A0">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        )}
      </div>

      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 16,
            fontWeight: "400",
            color: ANDROID_COLORS.textPrimary,
            marginBottom: 2,
            fontFamily: "Roboto, sans-serif",
          }}
        >
          {member.name}
        </div>
        {member.phone && (
          <div
            style={{
              fontSize: 14,
              color: ANDROID_COLORS.textSecondary,
              fontFamily: "Roboto, sans-serif",
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
            color: ANDROID_COLORS.primary,
            backgroundColor: "rgba(0, 168, 132, 0.15)",
            padding: "4px 8px",
            borderRadius: 4,
            fontFamily: "Roboto, sans-serif",
          }}
        >
          Admin
        </span>
      )}
    </div>
  );
};

const ActionRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  color?: string;
}> = ({ icon, label, color = ANDROID_COLORS.textPrimary }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      padding: "16px",
      gap: 24,
      backgroundColor: ANDROID_COLORS.background,
    }}
  >
    {icon}
    <span style={{ fontSize: 16, color, fontFamily: "Roboto, sans-serif" }}>
      {label}
    </span>
  </div>
);

export const GroupInfoScreen: React.FC<GroupInfoScreenProps> = ({
  world,
  conversationId,
  safeAreaInsets,
  width,
  height,
}) => {
  const physicalSafeTop = safeAreaInsets?.top ?? 0;

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
        backgroundColor: ANDROID_COLORS.background,
        fontFamily: "Roboto, sans-serif",
      }}
    >
      <div
        style={{
          paddingTop: physicalSafeTop,
          backgroundColor: ANDROID_COLORS.surface,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px",
            height: 56,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={ANDROID_COLORS.textPrimary}
            >
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={ANDROID_COLORS.textPrimary}
            >
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
            </svg>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={ANDROID_COLORS.textPrimary}
            >
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>
        <div
          style={{
            backgroundColor: ANDROID_COLORS.surface,
            padding: "20px 16px",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: "#2A3942",
              backgroundImage: groupData.avatar
                ? `url(${groupData.avatar})`
                : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {!groupData.avatar && (
              <svg width="36" height="36" viewBox="0 0 24 24" fill="#8696A0">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
              </svg>
            )}
          </div>

          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: 20,
                fontWeight: "500",
                color: ANDROID_COLORS.textPrimary,
                marginBottom: 4,
              }}
            >
              {groupData.name}
            </div>
            <div
              style={{
                fontSize: 14,
                color: ANDROID_COLORS.textSecondary,
              }}
            >
              Group · {groupData.members.length} participants
            </div>
          </div>
        </div>

        {groupData.description && (
          <div
            style={{
              padding: "16px",
              backgroundColor: ANDROID_COLORS.background,
              borderTop: `1px solid ${ANDROID_COLORS.separator}`,
            }}
          >
            <div
              style={{
                fontSize: 14,
                color: ANDROID_COLORS.textSecondary,
                marginBottom: 4,
              }}
            >
              Group description
            </div>
            <div
              style={{
                fontSize: 15,
                color: ANDROID_COLORS.textPrimary,
              }}
            >
              {groupData.description}
            </div>
          </div>
        )}

        <div style={{ height: 8, backgroundColor: ANDROID_COLORS.separator }} />

        <ActionRow
          icon={
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={ANDROID_COLORS.textSecondary}
            >
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
            </svg>
          }
          label="Media, links, and docs"
        />

        <div style={{ height: 8, backgroundColor: ANDROID_COLORS.separator }} />

        <div
          style={{
            padding: "12px 16px",
            backgroundColor: ANDROID_COLORS.background,
          }}
        >
          <div
            style={{
              fontSize: 14,
              color: ANDROID_COLORS.textSecondary,
              marginBottom: 8,
            }}
          >
            {groupData.members.length} participants
          </div>
        </div>

        <ActionRow
          icon={
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: ANDROID_COLORS.primary,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
          }
          label="Add participants"
          color={ANDROID_COLORS.primary}
        />

        {groupData.members.map((member) => (
          <MemberItem key={member.id} member={member} />
        ))}

        <div style={{ height: 8, backgroundColor: ANDROID_COLORS.separator }} />

        <ActionRow
          icon={
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={ANDROID_COLORS.danger}
            >
              <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
            </svg>
          }
          label="Exit group"
          color={ANDROID_COLORS.danger}
        />

        <ActionRow
          icon={
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={ANDROID_COLORS.danger}
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
          }
          label="Report group"
          color={ANDROID_COLORS.danger}
        />

        <div style={{ height: 40 }} />
      </div>
    </div>
  );
};

export default GroupInfoScreen;
