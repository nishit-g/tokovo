import React from "react";
import { InstagramState } from "../../types";

const CameraIcon = () => (
    <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="3" stroke="white" strokeWidth="1.8" fill="none" />
        <path d="M11 9L15 12L11 15V9Z" fill="white" />
    </svg>
);

// Filled heart with like count
const HeartIcon = ({ filled = false }: { filled?: boolean }) => (
    <svg width="78" height="78" viewBox="0 0 24 24">
        <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            fill={filled ? "#FF3040" : "none"}
            stroke={filled ? "#FF3040" : "white"}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

// Comment bubble icon
const CommentIcon = () => (
    <svg width="78" height="78" viewBox="0 0 24 24" fill="none">
        <path
            d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22l-1.344-4.992z"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

// Share/Send icon
const ShareIcon = () => (
    <svg width="78" height="78" viewBox="0 0 24 24" fill="none">
        <path
            d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

// Rotating music disc placeholder
const MusicIcon = () => (
    <div style={{
        width: 90,
        height: 90,
        borderRadius: 15,
        border: "2px solid rgba(255,255,255,0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #405DE6 0%, #833AB4 50%, #C13584 100%)",
        overflow: "hidden"
    }}>
        <div style={{
            width: 45,
            height: 45,
            backgroundColor: "white",
            borderRadius: "50%",
            border: "3px solid #333"
        }} />
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
