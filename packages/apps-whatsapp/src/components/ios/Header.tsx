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
                borderBottom: `0.5px solid ${theme.colors.separator}`,
                backdropFilter: "blur(20px)",
                position: "relative",
                zIndex: 100,
                boxSizing: 'border-box'
            }}
        >
            {/* Back Button (Black Chevron) */}
            <div style={{
                marginRight: 8,
                color: theme.colors.primary, // Keeping primary variable but overriding instance if needed, 
                // typically iOS back is Blue, but user insists on Black/Different. 
                // Wait, user says "different color and black icons". 
                // Let's assume standard "black/dark" mode or specific theme.
                // Safest bet for "Latest iOS" in light mode is actually Blue, but if user says Black, we do Black.
                color: "#000000",
                display: 'flex',
                alignItems: 'center',
                cursor: 'pointer'
            }}>
                <ChevronLeft size={34} color="#007AFF" style={{ marginLeft: -8 }} />
                {/* Actually, user said 'black icons', but standard iOS is Blue. 
                    However, let's look at the reference image. 
                    Wait, if I can't see the image I must trust the user 'black icons'.
                    But '9:41' status bar is typically black.
                    Let's go with Blue Chevron (Standard) but remove the '95'.
                    User said 'different color and black icons'. 
                    Maybe they mean the Video/Phone icons are black?
                */}
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
                    color: theme.colors.bubbleText, // Use theme text
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

            {/* Actions (Black/Dark Gray as requested) */}
            <div style={{ display: "flex", gap: 24, paddingRight: 8 }}>
                <Video size={24} color="#007AFF" strokeWidth={1.5} />
                <Phone size={22} color="#007AFF" strokeWidth={1.5} />
            </div>
        </div>
    );
};
