import React from "react";
import { WorldState } from "@tokovo/core";
import { TabNavigation } from "../../../components/ios/TabNavigation";
import { whatsappColors, spacing } from "../../../components/ios/theme";

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

const StatusItem: React.FC<{
  entry: StatusEntry;
  isLast: boolean;
  isMyStatus?: boolean;
}> = ({ entry, isLast, isMyStatus }) => {
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
          position: "relative",
          marginRight: spacing.contentMarginLeft,
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
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: isMyStatus
              ? "none"
              : `2px solid ${entry.viewed ? whatsappColors.textSecondary : whatsappColors.primary}`,
          }}
        >
          {!entry.contactAvatar && (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#8696A0">
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
              backgroundColor: whatsappColors.primary,
              border: "2px solid white",
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

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingTop: 14,
          paddingBottom: 14,
          borderBottom: isLast
            ? "none"
            : `0.5px solid ${whatsappColors.separator}`,
        }}
      >
        <div
          style={{
            fontSize: 17,
            fontWeight: "400",
            color: whatsappColors.textPrimary,
            marginBottom: 2,
          }}
        >
          {entry.contactName}
        </div>
        <div
          style={{
            fontSize: 14,
            color: whatsappColors.textSecondary,
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
  const designWidth = 393;
  const targetWidth = width || 1179;
  const scale = targetWidth / designWidth;

  const physicalSafeTop = safeAreaInsets?.top ?? 177;
  const physicalSafeBottom = safeAreaInsets?.bottom ?? 102;

  const safeAreaTop = physicalSafeTop / scale;
  const safeAreaBottom = physicalSafeBottom / scale;

  const statusUpdates: StatusEntry[] = (world as any).statusUpdates || [];
  const recentUpdates = statusUpdates.filter((s) => !s.viewed);
  const viewedUpdates = statusUpdates.filter((s) => s.viewed);

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
            Privacy
          </span>
          <span
            style={{
              fontSize: 34,
              fontWeight: "700",
              color: whatsappColors.textPrimary,
            }}
          >
            Updates
          </span>
          <div style={{ width: 28 }} />
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflow: "hidden",
          paddingBottom: spacing.tabBarHeight + safeAreaBottom + 10,
        }}
      >
        <div
          style={{
            padding: "16px 16px 8px",
            fontSize: 13,
            fontWeight: "600",
            color: whatsappColors.textSecondary,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          Status
        </div>

        <StatusItem
          entry={{
            id: "my-status",
            contactName: "My Status",
            timestamp: "Tap to add status update",
            viewed: false,
            contactAvatar: (world as any).myAvatar,
          }}
          isLast={false}
          isMyStatus
        />

        {recentUpdates.length > 0 && (
          <>
            <div
              style={{
                padding: "20px 16px 8px",
                fontSize: 13,
                fontWeight: "600",
                color: whatsappColors.textSecondary,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Recent Updates
            </div>
            {recentUpdates.map((entry, i) => (
              <StatusItem
                key={entry.id}
                entry={entry}
                isLast={
                  i === recentUpdates.length - 1 && viewedUpdates.length === 0
                }
              />
            ))}
          </>
        )}

        {viewedUpdates.length > 0 && (
          <>
            <div
              style={{
                padding: "20px 16px 8px",
                fontSize: 13,
                fontWeight: "600",
                color: whatsappColors.textSecondary,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Viewed Updates
            </div>
            {viewedUpdates.map((entry, i) => (
              <StatusItem
                key={entry.id}
                entry={entry}
                isLast={i === viewedUpdates.length - 1}
              />
            ))}
          </>
        )}

        {statusUpdates.length === 0 && (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: whatsappColors.textSecondary,
            }}
          >
            <div style={{ fontSize: 14 }}>No status updates yet</div>
          </div>
        )}

        <div
          style={{
            padding: "24px 16px 8px",
            fontSize: 13,
            fontWeight: "600",
            color: whatsappColors.textSecondary,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        >
          Channels
        </div>

        <div
          style={{
            padding: "12px 16px",
            color: whatsappColors.textSecondary,
            fontSize: 14,
          }}
        >
          Stay updated on topics that matter to you. Find channels to follow
          below.
        </div>

        <div
          style={{
            margin: "8px 16px",
            padding: "12px 16px",
            backgroundColor: whatsappColors.bgSecondary,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={whatsappColors.primary}
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          <span style={{ color: whatsappColors.primary, fontWeight: "500" }}>
            Find channels
          </span>
        </div>
      </div>

      <TabNavigation activeTab="status" safeAreaBottom={safeAreaBottom} />
    </div>
  );
};

export default StatusScreen;
