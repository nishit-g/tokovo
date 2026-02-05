import { ChevronLeft, Video, Phone } from "lucide-react";
import { Img } from "remotion";
import { UI_CONSTANTS } from "../config/layout-config";
import { useTheme } from "../theme/context";
import { resolveAvatarWithFallback } from "../utils/avatar";

export interface HeaderProps {
  contactName: string;
  avatarUrl?: string;
  status: string;
  safeAreaTop?: number;
}

export const Header: React.FC<HeaderProps> = ({
  contactName,
  avatarUrl,
  status,
  safeAreaTop = 47,
}) => {
  const theme = useTheme();
  // Use fallback avatar when local paths don't exist
  const resolvedAvatarUrl = resolveAvatarWithFallback(avatarUrl, contactName);

  const contentHeight = UI_CONSTANTS.HEADER_CONTENT_HEIGHT;
  const totalHeight = safeAreaTop + contentHeight;

  return (
    <div
      data-anchor="header"
      style={{
        height: totalHeight,
        backgroundColor: theme.colors.headerBackground,
        paddingTop: safeAreaTop,
        display: "flex",
        alignItems: "center",
        paddingLeft: UI_CONSTANTS.HEADER_PADDING_X,
        paddingRight: UI_CONSTANTS.HEADER_PADDING_X,
        borderBottom: `0.5px solid ${theme.colors.divider}`,
        backdropFilter: "blur(20px)",
        position: "relative",
        zIndex: 100,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          marginRight: 8,
          color: theme.colors.headerText,
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
        }}
      >
        <ChevronLeft
          size={34}
          color={theme.colors.headerText}
          style={{ marginLeft: -8 }}
        />
      </div>

      <div
        data-anchor="profile"
        style={{
          width: UI_CONSTANTS.HEADER_AVATAR_SIZE,
          height: UI_CONSTANTS.HEADER_AVATAR_SIZE,
          borderRadius: "50%",
          backgroundColor: theme.colors.divider,
          marginRight: UI_CONSTANTS.HEADER_AVATAR_MARGIN_RIGHT,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <Img
          src={resolvedAvatarUrl}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
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
            fontSize: theme.typography.headerTitleFontSize,
            fontWeight: "600",
            color: theme.colors.headerText,
            lineHeight: "20px",
            fontFamily: theme.typography.fontFamily,
          }}
        >
          {contactName}
        </div>
        <div
          style={{
            fontSize: theme.typography.headerSubtitleFontSize,
            color: theme.colors.timestamp,
            lineHeight: "14px",
          }}
        >
          {status}
        </div>
      </div>

      <div style={{ display: "flex", gap: 24, paddingRight: 8 }}>
        <Video size={22} color={theme.colors.headerText} strokeWidth={1.7} />
        <Phone size={20} color={theme.colors.headerText} strokeWidth={1.7} />
      </div>
    </div>
  );
};
