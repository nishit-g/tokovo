import React from "react";
import { InstagramState } from "../../types";

// ============================================================================
// REELS ICONS - Authentic Instagram style
// ============================================================================

const CameraIcon = () => (
    <svg width="66" height="66" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="white" strokeWidth="1.8" />
        <polygon points="10,8 17,12 10,16" fill="white" />
    </svg>
);

const HeartIcon = ({ filled = false }: { filled?: boolean }) => (
    <svg width="84" height="84" viewBox="0 0 24 24">
        <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            fill={filled ? "#FF3040" : "none"}
            stroke={filled ? "#FF3040" : "white"}
            strokeWidth="1.8"
        />
    </svg>
);

const CommentIcon = () => (
    <svg width="84" height="84" viewBox="0 0 24 24" fill="none">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="white" strokeWidth="1.8" />
    </svg>
);

const ShareIcon = () => (
    <svg width="84" height="84" viewBox="0 0 24 24" fill="none">
        <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

const MoreIcon = () => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="white">
        <circle cx="12" cy="5" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="12" cy="19" r="2" />
    </svg>
);

const BookmarkIcon = () => (
    <svg width="84" height="84" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
);

// ============================================================================
// AUDIO BAR - Scrolling song at bottom
// ============================================================================

const AudioBar: React.FC<{ song: string; artist: string }> = ({ song, artist }) => (
    <div style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        paddingRight: 30
    }}>
        {/* Music note icon */}
        <svg width="42" height="42" viewBox="0 0 24 24" fill="white">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" fill="white" />
            <circle cx="18" cy="16" r="3" fill="white" />
        </svg>
        {/* Song text */}
        <div style={{
            fontSize: 36,
            overflow: "hidden",
            whiteSpace: "nowrap",
            maxWidth: 600
        }}>
            {artist} · {song}
        </div>
    </div>
);

// ============================================================================
// ROTATING ALBUM COVER
// ============================================================================

const AlbumCover: React.FC<{ imageUrl?: string }> = ({ imageUrl }) => (
    <div style={{
        width: 108,
        height: 108,
        borderRadius: 18,
        border: "3px solid rgba(255,255,255,0.6)",
        backgroundImage: imageUrl
            ? `url(${imageUrl})`
            : "linear-gradient(135deg, #405DE6 0%, #833AB4 50%, #C13584 100%)",
        backgroundSize: "cover",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    }}>
        {!imageUrl && (
            <div style={{
                width: 45,
                height: 45,
                borderRadius: "50%",
                backgroundColor: "white",
                border: "3px solid #333"
            }} />
        )}
    </div>
);

// ============================================================================
// SIDE ACTION BUTTON
// ============================================================================

const SideAction: React.FC<{ icon: React.ReactNode; count?: string }> = ({ icon, count }) => (
    <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 9
    }}>
        {icon}
        {count && (
            <span style={{ fontSize: 30, fontWeight: 500 }}>{count}</span>
        )}
    </div>
);

// ============================================================================
// REELS VIEW - Main export
// ============================================================================

export const ReelsView: React.FC<{ state: InstagramState }> = ({ state }) => {
    return (
        <div style={{
            backgroundColor: "#000",
            height: "100%",
            color: "white",
            position: "relative",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif"
        }}>
            {/* Video Background */}
            <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url(https://picsum.photos/seed/reel1/1080/1920)`,
                backgroundSize: "cover",
                backgroundPosition: "center"
            }} />

            {/* Gradient Overlay */}
            <div style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "50%",
                background: "linear-gradient(transparent, rgba(0,0,0,0.6))",
                pointerEvents: "none"
            }} />

            {/* Header */}
            <div style={{
                position: "absolute",
                top: 150,
                left: 36,
                right: 36,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                zIndex: 10
            }}>
                <div style={{
                    fontSize: 54,
                    fontWeight: 700,
                    textShadow: "0 2px 4px rgba(0,0,0,0.5)"
                }}>
                    Reels
                </div>
                <CameraIcon />
            </div>

            {/* Right Side Actions */}
            <div style={{
                position: "absolute",
                bottom: 420,
                right: 30,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 48,
                zIndex: 10
            }}>
                <SideAction icon={<HeartIcon />} count="123K" />
                <SideAction icon={<CommentIcon />} count="1.2K" />
                <SideAction icon={<ShareIcon />} />
                <SideAction icon={<BookmarkIcon />} />
                <SideAction icon={<MoreIcon />} />
                <AlbumCover />
            </div>

            {/* Bottom Info Section */}
            <div style={{
                position: "absolute",
                bottom: 300,
                left: 36,
                right: 180, // Space for side actions
                zIndex: 10
            }}>
                {/* User Info */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 24,
                    marginBottom: 21
                }}>
                    {/* Avatar */}
                    <div style={{
                        width: 96,
                        height: 96,
                        borderRadius: "50%",
                        border: "3px solid white",
                        backgroundImage: `url(https://i.pravatar.cc/150?u=reel)`,
                        backgroundSize: "cover"
                    }} />
                    {/* Username */}
                    <span style={{
                        fontSize: 42,
                        fontWeight: 600,
                        textShadow: "0 2px 4px rgba(0,0,0,0.5)"
                    }}>
                        reels_creator
                    </span>
                    {/* Follow Button */}
                    <div style={{
                        border: "2px solid white",
                        borderRadius: 12,
                        padding: "12px 30px",
                        fontSize: 36,
                        fontWeight: 600
                    }}>
                        Follow
                    </div>
                </div>

                {/* Caption */}
                <div style={{
                    fontSize: 39,
                    marginBottom: 21,
                    textShadow: "0 1px 3px rgba(0,0,0,0.5)",
                    lineHeight: 1.3
                }}>
                    Wait for the drop! 🎵🔥 #dance #viral #trending
                </div>

                {/* Audio Bar */}
                <AudioBar song="Original Audio" artist="reels_creator" />
            </div>
        </div>
    );
};
