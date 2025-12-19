import { ChevronLeft, Video, Phone } from "lucide-react";
import { UI_CONSTANTS } from "../../config/layout-config";
import { getTheme } from "./theme";

export const Header: React.FC<{
    contactName: string;
    avatarUrl?: string;
    status: string;
    safeAreaTop?: number;
}> = ({ contactName, avatarUrl, status, safeAreaTop = 47 }) => {
    const theme = getTheme("ios");

    // Total header height = Safe Area + Content Height
    const contentHeight = UI_CONSTANTS.HEADER_CONTENT_HEIGHT;
    const totalHeight = safeAreaTop + contentHeight;

    return (
        <div
            data-anchor="header"
            style={{
                height: totalHeight,
                backgroundColor: theme.colors.headerBg,
                paddingTop: safeAreaTop,
                display: "flex",
                alignItems: "center",
                paddingLeft: UI_CONSTANTS.HEADER_PADDING_X,
                paddingRight: UI_CONSTANTS.HEADER_PADDING_X,
                borderBottom: "0.5px solid var(--app-wa-separator)",
                backdropFilter: "blur(20px)",
                position: "relative",
                zIndex: 100,
                boxSizing: 'border-box'
            }}
        >
            {/* Back Button */}
            <div style={{
                marginRight: 5,
                color: theme.colors.primary,
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer'
            }}>
                <ChevronLeft size={30} color={theme.colors.primary} style={{ marginLeft: -8 }} />
                <span style={{ fontSize: 17, marginLeft: -5, fontWeight: 400 }}>95</span>
            </div>

            {/* Avatar */}
            <div
                data-anchor="profile"
                style={{
                    width: UI_CONSTANTS.HEADER_AVATAR_SIZE,
                    height: UI_CONSTANTS.HEADER_AVATAR_SIZE,
                    borderRadius: "50%",
                    backgroundColor: "#ddd",
                    marginRight: UI_CONSTANTS.HEADER_AVATAR_MARGIN_RIGHT,
                    overflow: "hidden",
                    flexShrink: 0
                }}
            >
                {avatarUrl ? (
                    <img src={avatarUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                    <div style={{ width: "100%", height: "100%", background: "#ccc" }} />
                )}
            </div>

            {/* Name & Status */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <div style={{
                    fontSize: 16, // Standard 16pt
                    fontWeight: "600",
                    color: "var(--app-wa-bubble-text)", // Dynamic text color
                    lineHeight: "20px"
                }}>
                    {contactName}
                </div>
                <div style={{
                    fontSize: 12, // Standard 12pt caption
                    color: theme.colors.secondary,
                    lineHeight: "14px"
                }}>
                    {status}
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 20, paddingRight: 5 }}>
                <Video size={24} color={theme.colors.primary} />
                <Phone size={22} color={theme.colors.primary} />
            </div>
        </div>
    );
};
