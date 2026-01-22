import React from "react";
import { WorldState } from "@tokovo/core";

export interface CallsScreenProps {
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

export interface CallLogEntry {
  id: string;
  contactName: string;
  contactAvatar?: string;
  callType: "voice" | "video";
  direction: "incoming" | "outgoing" | "missed";
  timestamp: string;
  duration?: string;
}

const ANDROID_COLORS = {
  background: "#0B141A",
  surface: "#1F2C34",
  primary: "#00A884",
  textPrimary: "#E9EDEF",
  textSecondary: "#8696A0",
  separator: "#222D34",
  missed: "#F15C6D",
};

const CallLogItem: React.FC<{
  entry: CallLogEntry;
}> = ({ entry }) => {
  const isMissed = entry.direction === "missed";
  const isOutgoing = entry.direction === "outgoing";

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
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: "#2A3942",
          backgroundImage: entry.contactAvatar
            ? `url(${entry.contactAvatar})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          marginRight: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {!entry.contactAvatar && (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="#8696A0">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        )}
      </div>

      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 17,
            fontWeight: "400",
            color: isMissed
              ? ANDROID_COLORS.missed
              : ANDROID_COLORS.textPrimary,
            marginBottom: 4,
            fontFamily: "Roboto, sans-serif",
          }}
        >
          {entry.contactName}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill={isMissed ? ANDROID_COLORS.missed : ANDROID_COLORS.primary}
            style={{
              transform: isOutgoing ? "rotate(45deg)" : "rotate(-135deg)",
            }}
          >
            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
          </svg>
          <span
            style={{
              fontSize: 14,
              color: ANDROID_COLORS.textSecondary,
              fontFamily: "Roboto, sans-serif",
            }}
          >
            {entry.timestamp}
          </span>
        </div>
      </div>

      <div style={{ padding: 8 }}>
        {entry.callType === "video" ? (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={ANDROID_COLORS.primary}
          >
            <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
          </svg>
        ) : (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={ANDROID_COLORS.primary}
          >
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
          </svg>
        )}
      </div>
    </div>
  );
};

export const CallsScreen: React.FC<CallsScreenProps> = ({
  world,
  safeAreaInsets,
  width,
  height,
}) => {
  const physicalSafeTop = safeAreaInsets?.top ?? 0;

  const callLogs: CallLogEntry[] = (world as any).callLogs || [];

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
              Calls
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill={ANDROID_COLORS.textPrimary}
            >
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
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

      <div style={{ flex: 1, overflow: "hidden" }}>
        {callLogs.length > 0 ? (
          callLogs.map((entry) => <CallLogItem key={entry.id} entry={entry} />)
        ) : (
          <div
            style={{
              padding: 60,
              textAlign: "center",
              color: ANDROID_COLORS.textSecondary,
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>📞</div>
            <div style={{ fontSize: 16, fontWeight: "500" }}>
              No recent calls
            </div>
            <div style={{ fontSize: 14, marginTop: 8 }}>
              Your call history will appear here
            </div>
          </div>
        )}
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
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
      </div>
    </div>
  );
};

export default CallsScreen;
