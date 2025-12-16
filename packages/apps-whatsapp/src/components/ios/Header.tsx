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
        <div style={{
            height: totalHeight,
            backgroundColor: theme.colors.headerBg,
            paddingTop: safeAreaTop,
            display: "flex",
            alignItems: "center",
            paddingLeft: UI_CONSTANTS.HEADER_PADDING_X,
            paddingRight: UI_CONSTANTS.HEADER_PADDING_X,
            borderBottom: "0.5px solid rgba(0,0,0,0.1)",
            backdropFilter: "blur(20px)",
            position: "relative",
            zIndex: 100,
            boxSizing: 'border-box'
        }}>
            {/* Back Button */}
            <div style={{
                marginRight: 5,
                color: theme.colors.primary,
                display: 'flex',
                alignItems: 'center'
            }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M11.5 19L4.5 12L11.5 5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontSize: 17, marginLeft: -2 }}>95</span>
            </div>

            {/* Avatar */}
            <div style={{
                width: UI_CONSTANTS.HEADER_AVATAR_SIZE,
                height: UI_CONSTANTS.HEADER_AVATAR_SIZE,
                borderRadius: "50%",
                backgroundColor: "#ddd",
                marginRight: UI_CONSTANTS.HEADER_AVATAR_MARGIN_RIGHT,
                overflow: "hidden",
                flexShrink: 0
            }}>
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
                    color: "#000",
                    lineHeight: "20px"
                }}>
                    {contactName}
                </div>
                <div style={{
                    fontSize: 12, // Standard 12pt caption
                    color: "#666",
                    lineHeight: "14px"
                }}>
                    {status}
                </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 20, paddingRight: 5 }}>
                {/* Video Call */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M15 10L20 6V18L15 14V10Z" stroke={theme.colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4 8H11C11.55 8 12 8.45 12 9V15C12 15.55 11.55 16 11 16H4C3.45 16 3 15.55 3 15V9C3 8.45 3.45 8 4 8Z" stroke={theme.colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {/* Phone Call */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M22 16.92V19.92C22 20.4706 21.5532 20.916 21.0028 20.916C20.6725 20.916 16.6 20 16.6 20C16.6 20 13 18.5 10 15.5C7 12.5 5.5 8.9 5.5 8.9C5.5 8.9 4.6 4.8 4.6 4.47C4.6 3.92 5.04543 3.47 5.59259 3.47H8.59259C8.97495 3.47 9.32432 3.72221 9.44477 4.08354C9.55998 4.42878 9.8 5 9.8 5C9.8 5 10.3 6.3 10.5 6.7C10.7 7.1 10.5 7.6 10.2 7.9L8.90001 9.2C8.90001 9.2 10.6 13.9 14.3 17.6C18 21.3 22.8 23 22.8 23L24.1 21.7C24.4 21.4 24.9 21.2 25.3 21.4C25.7 21.6 27 22.1 27 22.1C27 22.1 27.5 22.3 27.9 22.5C28.2 22.6 28.5 22.9 28.5 23.3V26.3" stroke={theme.colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M22 16.92V19.92C22 20.4723 21.5523 20.92 21.0001 20.92C18.6791 20.92 14.6296 20.1751 11.2 16.8C7.77035 13.4249 7.02543 9.37543 7.02543 7.05445C7.02543 6.50222 7.47314 6.05445 8.02543 6.05445H11.0254" stroke={theme.colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    {/* Simplified path for phone */}
                    <path d="M22 16.92V19.92C22 20.47 21.55 20.92 21 20.92C16.93 20.92 13.19 19.33 10.3 16.44C7.41 13.55 5.82 9.81 5.82 5.74C5.82 5.19 6.27 4.74 6.82 4.74H9.82C10.2 4.74 10.55 4.97 10.71 5.31C11 5.92 11.35 6.8 11.64 7.63C11.82 8.14 11.75 8.7 11.37 9.08L9.74 10.71C11.83 14.89 15.19 18.25 19.37 20.34L21 18.71C21.38 18.33 21.94 18.26 22.45 18.44C23.28 18.73 24.16 19.08 24.77 19.37C25.11 19.53 25.34 19.88 25.34 20.26V23.26" stroke={theme.colors.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        </div>
    );
};
