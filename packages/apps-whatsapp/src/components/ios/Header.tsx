import { ChevronLeft, Video, Phone } from "lucide-react";
import { UI_CONSTANTS } from "../../config/layout-config";
import { UIThemeTokens } from "../../ui/ui-strategy";

const DEFAULT_HEADER_COLORS = {
  headerBg: "#F6F6F6",
  headerText: "#000000",
  headerSecondary: "#8E8E93",
  headerIcon: "#000000",
};

export const Header: React.FC<{
  contactName: string;
  avatarUrl?: string;
  status: string;
  safeAreaTop?: number;
  tokens?: UIThemeTokens;
}> = ({ contactName, avatarUrl, status, safeAreaTop = 47, tokens }) => {
  const headerBg = tokens?.headerBg || DEFAULT_HEADER_COLORS.headerBg;
  const headerText = tokens?.headerText || DEFAULT_HEADER_COLORS.headerText;
  const headerSecondary = tokens?.headerSecondary || DEFAULT_HEADER_COLORS.headerSecondary;
  const headerIcon = tokens?.headerIcon || DEFAULT_HEADER_COLORS.headerIcon;

  const contentHeight = UI_CONSTANTS.HEADER_CONTENT_HEIGHT;
  const totalHeight = safeAreaTop + contentHeight;

  return (
    <div
      data-anchor="header"
      style={{
        height: totalHeight,
        backgroundColor: headerBg,
        paddingTop: safeAreaTop,
        display: "flex",
        alignItems: "center",
        paddingLeft: UI_CONSTANTS.HEADER_PADDING_X,
        paddingRight: UI_CONSTANTS.HEADER_PADDING_X,
        borderBottom: `0.5px solid rgba(0,0,0,0.1)`,
        backdropFilter: "blur(20px)",
        position: "relative",
        zIndex: 100,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          marginRight: 8,
          color: headerIcon,
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
        }}
      >
        <ChevronLeft size={34} color={headerIcon} style={{ marginLeft: -8 }} />
      </div>

      <div
        data-anchor="profile"
        style={{
          width: UI_CONSTANTS.HEADER_AVATAR_SIZE,
          height: UI_CONSTANTS.HEADER_AVATAR_SIZE,
          borderRadius: "50%",
          backgroundColor: "#ddd",
          marginRight: UI_CONSTANTS.HEADER_AVATAR_MARGIN_RIGHT,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "#ccc" }} />
        )}
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: headerText,
            lineHeight: "20px",
            fontFamily: tokens?.fontFamily,
          }}
        >
          {contactName}
        </div>
        <div
          style={{
            fontSize: 12,
            color: headerSecondary,
            lineHeight: "14px",
          }}
        >
          {status}
        </div>
      </div>

      <div style={{ display: "flex", gap: 24, paddingRight: 8 }}>
        <Video size={24} color={headerIcon} strokeWidth={1.5} />
        <Phone size={22} color={headerIcon} strokeWidth={1.5} />
      </div>
    </div>
  );
};
