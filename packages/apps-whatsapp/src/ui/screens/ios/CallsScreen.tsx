import React from "react";
import { WorldState } from "@tokovo/core";
import { TabNavigation } from "../../../components/ios/TabNavigation";
import { whatsappColors, spacing } from "../../../components/ios/theme";
import {
  VideoCallIcon,
  PhoneCallIcon,
  ChevronRightIcon,
} from "../../../components/ios/Icons";

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

const CallLogItem: React.FC<{
  entry: CallLogEntry;
  isLast: boolean;
}> = ({ entry, isLast }) => {
  const isMissed = entry.direction === "missed";
  const isOutgoing = entry.direction === "outgoing";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        paddingLeft: spacing.avatarMarginLeft,
        paddingRight: spacing.contentMarginRight,
        backgroundColor: whatsappColors.bgPrimary,
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 26,
          backgroundColor: "#DFE5E7",
          backgroundImage: entry.contactAvatar
            ? `url(${entry.contactAvatar})`
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
        {!entry.contactAvatar && (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#8696A0">
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
          paddingTop: 14,
          paddingBottom: 14,
          borderBottom: isLast
            ? "none"
            : `0.5px solid ${whatsappColors.separator}`,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 17,
              fontWeight: "400",
              color: isMissed ? "#FF3B30" : whatsappColors.textPrimary,
              marginBottom: 2,
            }}
          >
            {entry.contactName}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill={isMissed ? "#FF3B30" : whatsappColors.textSecondary}
              style={{
                transform: isOutgoing ? "rotate(45deg)" : "rotate(-135deg)",
              }}
            >
              <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
            </svg>
            <span
              style={{
                fontSize: 14,
                color: whatsappColors.textSecondary,
              }}
            >
              {entry.timestamp}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {entry.callType === "video" ? (
            <VideoCallIcon color={whatsappColors.primary} />
          ) : (
            <PhoneCallIcon color={whatsappColors.primary} />
          )}
          <ChevronRightIcon color={whatsappColors.primary} size={18} />
        </div>
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
  const designWidth = 393;
  const targetWidth = width || 1179;
  const scale = targetWidth / designWidth;

  const physicalSafeTop = safeAreaInsets?.top ?? 177;
  const physicalSafeBottom = safeAreaInsets?.bottom ?? 102;

  const safeAreaTop = physicalSafeTop / scale;
  const safeAreaBottom = physicalSafeBottom / scale;

  const callLogs: CallLogEntry[] = (world as any).callLogs || [];

  const missedCount = callLogs.filter((c) => c.direction === "missed").length;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: whatsappColors.bgPrimary,
        position: "relative",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
      }}
    >
      <div
        style={{
          paddingTop: safeAreaTop,
          backgroundColor: "rgba(249, 249, 249, 0.94)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderBottom: `0.5px solid ${whatsappColors.separator}`,
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
          <span
            style={{
              fontSize: 17,
              color: whatsappColors.primary,
              fontWeight: "400",
            }}
          >
            Edit
          </span>
          <span
            style={{
              fontSize: 34,
              fontWeight: "700",
              color: whatsappColors.textPrimary,
            }}
          >
            Calls
          </span>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: whatsappColors.primary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
            </svg>
          </div>
        </div>

        <div
          style={{
            padding: "0 16px 10px",
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(118, 118, 128, 0.12)",
              borderRadius: 10,
              padding: "8px 12px",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="#8E8E93">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
            <span style={{ fontSize: 17, color: "#8E8E93" }}>Search</span>
          </div>
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflow: "hidden",
          paddingBottom: spacing.tabBarHeight + safeAreaBottom + 10,
        }}
      >
        {callLogs.length > 0 ? (
          callLogs.map((entry, i) => (
            <CallLogItem
              key={entry.id}
              entry={entry}
              isLast={i === callLogs.length - 1}
            />
          ))
        ) : (
          <div
            style={{
              padding: 60,
              textAlign: "center",
              color: whatsappColors.textSecondary,
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>📞</div>
            <div style={{ fontSize: 17, fontWeight: "500" }}>
              No recent calls
            </div>
            <div style={{ fontSize: 14, marginTop: 8 }}>
              Your call history will appear here
            </div>
          </div>
        )}
      </div>

      <TabNavigation
        activeTab="calls"
        safeAreaBottom={safeAreaBottom}
        missedCallsCount={missedCount}
      />
    </div>
  );
};

export default CallsScreen;
