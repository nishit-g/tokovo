import React from "react";
import { WorldState } from "@tokovo/core";

export interface StatusScreenProps {
  world: WorldState;
  safeAreaInsets?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  width: number;
  height: number;
}

export interface StatusEntry {
  id: string;
  contactName: string;
  contactAvatar?: string;
  timestamp: string;
  viewed: boolean;
  statusCount?: number;
}

const ANDROID_COLORS = {
  background: "#0B141A",
  surface: "#1F2C34",
  primary: "#00A884",
  textPrimary: "#E9EDEF",
  textSecondary: "#8696A0",
  separator: "#222D34",
};

const StatusItem: React.FC<{
  entry: StatusEntry;
  isMyStatus?: boolean;
}> = ({ entry, isMyStatus }) => {
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
          position: "relative",
          marginRight: 16,
        }}
      >
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            backgroundColor: "#2A3942",
            backgroundImage: entry.contactAvatar
              ? `url(${entry.contactAvatar})`
              : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: isMyStatus
              ? "none"
              : `2px solid ${entry.viewed ? ANDROID_COLORS.textSecondary : ANDROID_COLORS.primary}`,
          }}
        >
          {!entry.contactAvatar && (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="#8696A0">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          )}
        </div>
        {isMyStatus && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: ANDROID_COLORS.primary,
              border: `2px solid ${ANDROID_COLORS.background}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
          </div>
        )}
      </div>

      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 17,
            fontWeight: "400",
            color: ANDROID_COLORS.textPrimary,
            marginBottom: 4,
            fontFamily: "Roboto, sans-serif",
          }}
        >
          {entry.contactName}
        </div>
        <div
          style={{
            fontSize: 14,
            color: ANDROID_COLORS.textSecondary,
            fontFamily: "Roboto, sans-serif",
          }}
        >
          {entry.timestamp}
        </div>
      </div>
    </div>
  );
};

export const StatusScreen: React.FC<StatusScreenProps> = ({
  world,
  safeAreaInsets,
  width,
  height,
}) => {
  const physicalSafeTop = safeAreaInsets?.top ?? 0;

  const statusUpdates: StatusEntry[] = (world as any).statusUpdates || [];
  const recentUpdates = statusUpdates.filter((s) => !s.viewed);
  const viewedUpdates = statusUpdates.filter((s) => s.viewed);

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
            <span
              style={{
                fontSize: 20,
                fontWeight: "500",
                color: ANDROID_COLORS.textPrimary,
              }}
            >
              Status
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
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

      <div style={{ flex: 1, overflow: "hidden" }}>
        <StatusItem
          entry={{
            id: "my-status",
            contactName: "My status",
            timestamp: "Tap to add status update",
            viewed: false,
            contactAvatar: (world as any).myAvatar,
          }}
          isMyStatus
        />

        {recentUpdates.length > 0 && (
          <>
            <div
              style={{
                padding: "16px 16px 8px",
                fontSize: 14,
                fontWeight: "500",
                color: ANDROID_COLORS.textSecondary,
              }}
            >
              Recent updates
            </div>
            {recentUpdates.map((entry) => (
              <StatusItem key={entry.id} entry={entry} />
            ))}
          </>
        )}

        {viewedUpdates.length > 0 && (
          <>
            <div
              style={{
                padding: "16px 16px 8px",
                fontSize: 14,
                fontWeight: "500",
                color: ANDROID_COLORS.textSecondary,
              }}
            >
              Viewed updates
            </div>
            {viewedUpdates.map((entry) => (
              <StatusItem key={entry.id} entry={entry} />
            ))}
          </>
        )}

        {statusUpdates.length === 0 && (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: ANDROID_COLORS.textSecondary,
            }}
          >
            <div style={{ fontSize: 14 }}>No status updates</div>
          </div>
        )}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 88,
          right: 24,
          width: 48,
          height: 48,
          borderRadius: 14,
          backgroundColor: ANDROID_COLORS.surface,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill={ANDROID_COLORS.textSecondary}
        >
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
        </svg>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          borderRadius: 16,
          backgroundColor: ANDROID_COLORS.primary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
      </div>
    </div>
  );
};

export default StatusScreen;
