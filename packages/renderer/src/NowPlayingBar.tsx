/**
 * NowPlayingBar - Spotify background music indicator
 * 
 * Shows a floating mini player at the bottom of the screen
 * when Spotify is playing in the background.
 */

import React from "react";
import { BackgroundAppState } from "@tokovo/core";

interface NowPlayingBarProps {
    backgroundApps?: BackgroundAppState[];
    currentFrame: number;
    variant?: "ios" | "android";
}

/**
 * Find active music app from background apps
 */
function findMusicApp(apps: BackgroundAppState[] = []): BackgroundAppState | undefined {
    return apps.find(app => app.indicator === "music");
}

/**
 * NowPlayingBar component - shows mini player when background music is playing
 */
export const NowPlayingBar: React.FC<NowPlayingBarProps> = ({
    backgroundApps,
    currentFrame,
    variant = "ios",
}) => {
    const musicApp = findMusicApp(backgroundApps);

    if (!musicApp) {
        return null;
    }

    // Animation: slide up on appear
    const timeSinceStart = currentFrame - musicApp.startedAt;
    const appearDuration = 15;
    const slideProgress = Math.min(1, timeSinceStart / appearDuration);
    const translateY = (1 - slideProgress) * 80; // Start 80px below

    const isIOS = variant === "ios";

    return (
        <div
            style={{
                position: "absolute",
                bottom: isIOS ? 120 : 100, // Above nav bar
                left: 16,
                right: 16,
                zIndex: 90,
                transform: `translateY(${translateY}px)`,
                opacity: slideProgress,
                transition: "transform 0.3s ease-out, opacity 0.3s ease-out",
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 16px",
                    background: isIOS
                        ? "rgba(30, 30, 31, 0.95)"
                        : "linear-gradient(180deg, #1DB954 0%, #191414 100%)",
                    borderRadius: isIOS ? 16 : 8,
                    backdropFilter: "blur(20px)",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
                }}
            >
                {/* Spotify Icon */}
                <div
                    style={{
                        width: 44,
                        height: 44,
                        borderRadius: 8,
                        background: "#1DB954",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    <SpotifyIcon />
                </div>

                {/* Track Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                        style={{
                            fontSize: 15,
                            fontWeight: 600,
                            color: "#fff",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                        }}
                    >
                        {musicApp.label?.split(" - ")[0] || "Now Playing"}
                    </div>
                    <div
                        style={{
                            fontSize: 13,
                            color: "rgba(255,255,255,0.6)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                        }}
                    >
                        {musicApp.label?.split(" - ")[1] || "Spotify"}
                    </div>
                </div>

                {/* Music Wave Animation */}
                <MusicWaveIcon isPlaying={true} />

                {/* Play/Pause Icon */}
                <div
                    style={{
                        width: 36,
                        height: 36,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    <PauseIcon />
                </div>
            </div>
        </div>
    );
};

// =============================================================================
// ICONS
// =============================================================================

const SpotifyIcon: React.FC = () => (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="#000">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
);

const PauseIcon: React.FC = () => (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="#fff">
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
);

const MusicWaveIcon: React.FC<{ isPlaying: boolean }> = ({ isPlaying }) => (
    <svg width={24} height={24} viewBox="0 0 24 24" fill="#1DB954">
        <rect x="4" y="8" width="3" height="8" rx="1">
            {isPlaying && (
                <>
                    <animate attributeName="height" values="8;16;8" dur="0.6s" repeatCount="indefinite" />
                    <animate attributeName="y" values="8;4;8" dur="0.6s" repeatCount="indefinite" />
                </>
            )}
        </rect>
        <rect x="10" y="4" width="3" height="16" rx="1">
            {isPlaying && (
                <>
                    <animate attributeName="height" values="16;8;16" dur="0.5s" repeatCount="indefinite" />
                    <animate attributeName="y" values="4;8;4" dur="0.5s" repeatCount="indefinite" />
                </>
            )}
        </rect>
        <rect x="16" y="6" width="3" height="12" rx="1">
            {isPlaying && (
                <>
                    <animate attributeName="height" values="12;16;12" dur="0.7s" repeatCount="indefinite" />
                    <animate attributeName="y" values="6;4;6" dur="0.7s" repeatCount="indefinite" />
                </>
            )}
        </rect>
    </svg>
);

export default NowPlayingBar;
