import React from "react";
import { InstagramState } from "../../types";

const CameraIcon = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
    </svg>
);

const HeartIcon = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);

const CommentIcon = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
);

const ShareIcon = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
);

const MusicIcon = () => (
    <div style={{ width: 60, height: 60, borderRadius: 10, border: "2px solid white", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 30, height: 30, backgroundColor: "white", borderRadius: "50%" }} />
    </div>
);

export const ReelsView: React.FC<{ state: InstagramState }> = ({ state }) => {
    return (
        <div style={{
            backgroundColor: "black",
            height: "100%",
            color: "white",
            position: "relative",
            display: "flex",
            flexDirection: "column"
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
                backgroundPosition: "center",
                filter: "brightness(0.9)"
            }} />

            {/* Header */}
            <div style={{
                position: "absolute",
                top: 60,
                left: 30,
                right: 30,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                zIndex: 10
            }}>
                <div style={{ fontSize: 42, fontWeight: "bold" }}>Reels</div>
                <CameraIcon />
            </div>

            {/* Side Actions */}
            <div style={{
                position: "absolute",
                bottom: 180, // Above bottom nav
                right: 20,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 40,
                zIndex: 10
            }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <HeartIcon />
                    <div style={{ fontSize: 24, marginTop: 5 }}>123K</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <CommentIcon />
                    <div style={{ fontSize: 24, marginTop: 5 }}>456</div>
                </div>
                <ShareIcon />
                <div style={{ fontSize: 32 }}>...</div>
                <MusicIcon />
            </div>

            {/* Bottom Info */}
            <div style={{
                position: "absolute",
                bottom: 180,
                left: 30,
                zIndex: 10,
                maxWidth: "70%"
            }}>
                <div style={{ display: "flex", alignItems: "center", marginBottom: 20 }}>
                    <div style={{ width: 60, height: 60, borderRadius: "50%", backgroundImage: `url(https://i.pravatar.cc/150?u=reel)`, backgroundSize: "cover", marginRight: 20 }} />
                    <div style={{ fontSize: 32, fontWeight: "600", marginRight: 20 }}>reels_creator</div>
                    <div style={{ border: "1px solid white", borderRadius: 8, padding: "4px 12px", fontSize: 24 }}>Follow</div>
                </div>
                <div style={{ fontSize: 30, marginBottom: 20 }}>
                    Wait for the drop! 🎵🔥 #dance #viral
                </div>
                <div style={{ display: "flex", alignItems: "center", fontSize: 28 }}>
                    <span style={{ marginRight: 10 }}>🎵</span>
                    Original Audio - reels_creator
                </div>
            </div>
        </div>
    );
};
