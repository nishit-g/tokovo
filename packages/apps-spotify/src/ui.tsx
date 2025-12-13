/**
 * Spotify UI Components
 * 
 * - NowPlayingWidget: Floating mini player
 * - SpotifyPlayer: Full player screen
 * - StatusBarIndicator: Shows in status bar when playing
 */

import React from "react";
import { SpotifyAppState, NowPlaying, SpotifyTrack } from "./types";

// =============================================================================
// NOW PLAYING WIDGET (Mini Player)
// =============================================================================

interface NowPlayingWidgetProps {
    nowPlaying: NowPlaying;
    currentFrame: number;
    variant?: "ios" | "android";
    onTap?: () => void;
}

/**
 * Floating Now Playing widget - shows current track with progress
 */
export const NowPlayingWidget: React.FC<NowPlayingWidgetProps> = ({
    nowPlaying,
    currentFrame,
    variant = "ios",
    onTap,
}) => {
    const { track, state, startedAtFrame } = nowPlaying;

    // Calculate progress (30fps)
    const elapsedMs = ((currentFrame - startedAtFrame) / 30) * 1000;
    const progress = state === "playing"
        ? Math.min(1, elapsedMs / track.durationMs)
        : (nowPlaying.progressMs / track.durationMs);

    const isIOS = variant === "ios";

    return (
        <div
            onClick={onTap}
            style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 14px",
                background: isIOS
                    ? "rgba(30, 30, 31, 0.95)"
                    : "linear-gradient(180deg, #1DB954 0%, #191414 100%)",
                borderRadius: isIOS ? 14 : 8,
                backdropFilter: "blur(20px)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
                maxWidth: 380,
                cursor: "pointer",
            }}
        >
            {/* Album Art */}
            <div style={{
                width: 48,
                height: 48,
                borderRadius: 6,
                background: track.albumArt
                    ? `url(${track.albumArt}) center/cover`
                    : "linear-gradient(135deg, #1DB954 0%, #191414 100%)",
                flexShrink: 0,
            }} />

            {/* Track Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#fff",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                }}>
                    {track.name}
                </div>
                <div style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.6)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                }}>
                    {track.artist}
                </div>

                {/* Progress Bar */}
                <div style={{
                    marginTop: 6,
                    height: 3,
                    background: "rgba(255,255,255,0.2)",
                    borderRadius: 2,
                    overflow: "hidden",
                }}>
                    <div style={{
                        width: `${progress * 100}%`,
                        height: "100%",
                        background: "#1DB954",
                        transition: "width 0.1s linear",
                    }} />
                </div>
            </div>

            {/* Play/Pause Icon */}
            <div style={{
                width: 36,
                height: 36,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
            }}>
                {state === "playing" ? (
                    <PauseIcon />
                ) : (
                    <PlayIcon />
                )}
            </div>
        </div>
    );
};

// =============================================================================
// STATUS BAR INDICATOR
// =============================================================================

interface StatusBarMusicIndicatorProps {
    track?: SpotifyTrack;
    isPlaying: boolean;
}

/**
 * Tiny indicator for status bar showing music is playing
 */
export const StatusBarMusicIndicator: React.FC<StatusBarMusicIndicatorProps> = ({
    track,
    isPlaying,
}) => {
    if (!track || !isPlaying) return null;

    return (
        <div style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            padding: "2px 6px",
            background: "rgba(29, 185, 84, 0.9)",
            borderRadius: 4,
            fontSize: 11,
            fontWeight: 600,
            color: "#fff",
        }}>
            <MusicWaveIcon />
            <span style={{
                maxWidth: 80,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
            }}>
                {track.name}
            </span>
        </div>
    );
};

// =============================================================================
// FULL SPOTIFY PLAYER
// =============================================================================

interface SpotifyPlayerProps {
    appState: SpotifyAppState;
    currentFrame: number;
}

/**
 * Full Spotify player screen
 */
export const SpotifyPlayer: React.FC<SpotifyPlayerProps> = ({
    appState,
    currentFrame,
}) => {
    const { nowPlaying } = appState;

    if (!nowPlaying) {
        return <SpotifyHome />;
    }

    const { track, state, startedAtFrame } = nowPlaying;
    const elapsedMs = ((currentFrame - startedAtFrame) / 30) * 1000;
    const progress = state === "playing"
        ? Math.min(1, elapsedMs / track.durationMs)
        : (nowPlaying.progressMs / track.durationMs);

    const formatTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    return (
        <div style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(180deg, #1e3a5f 0%, #121212 40%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "60px 30px 40px",
            boxSizing: "border-box",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}>
            {/* Album Art */}
            <div style={{
                width: 320,
                height: 320,
                borderRadius: 8,
                background: track.albumArt
                    ? `url(${track.albumArt}) center/cover`
                    : "linear-gradient(135deg, #1DB954 0%, #191414 100%)",
                boxShadow: "0 8px 48px rgba(0,0,0,0.5)",
                marginBottom: 40,
            }} />

            {/* Track Info */}
            <div style={{ textAlign: "center", width: "100%", marginBottom: 24 }}>
                <div style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#fff",
                    marginBottom: 6,
                }}>
                    {track.name}
                </div>
                <div style={{
                    fontSize: 16,
                    color: "rgba(255,255,255,0.6)",
                }}>
                    {track.artist}
                </div>
            </div>

            {/* Progress Bar */}
            <div style={{ width: "100%", marginBottom: 8 }}>
                <div style={{
                    height: 4,
                    background: "rgba(255,255,255,0.2)",
                    borderRadius: 2,
                    overflow: "hidden",
                }}>
                    <div style={{
                        width: `${progress * 100}%`,
                        height: "100%",
                        background: "#1DB954",
                    }} />
                </div>
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: 8,
                    fontSize: 12,
                    color: "rgba(255,255,255,0.6)",
                }}>
                    <span>{formatTime(elapsedMs)}</span>
                    <span>{formatTime(track.durationMs)}</span>
                </div>
            </div>

            {/* Controls */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: 40,
                marginTop: 24,
            }}>
                <SkipBackIcon />
                <div style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    background: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                    {state === "playing" ? (
                        <PauseIcon color="#000" size={32} />
                    ) : (
                        <PlayIcon color="#000" size={32} />
                    )}
                </div>
                <SkipForwardIcon />
            </div>
        </div>
    );
};

// =============================================================================
// SPOTIFY HOME (Placeholder)
// =============================================================================

const SpotifyHome: React.FC = () => (
    <div style={{
        width: "100%",
        height: "100%",
        background: "#121212",
        padding: 24,
        boxSizing: "border-box",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: "#fff", marginBottom: 24 }}>
            Good evening
        </div>
        <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12
        }}>
            {["Liked Songs", "Daily Mix 1", "Discover Weekly", "Release Radar"].map((name, i) => (
                <div key={i} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: 4,
                    overflow: "hidden",
                }}>
                    <div style={{
                        width: 56,
                        height: 56,
                        background: `hsl(${i * 60 + 140}, 60%, 40%)`,
                    }} />
                    <div style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#fff",
                    }}>
                        {name}
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// =============================================================================
// ICONS
// =============================================================================

const PlayIcon: React.FC<{ color?: string; size?: number }> = ({
    color = "#fff",
    size = 20
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M8 5v14l11-7z" />
    </svg>
);

const PauseIcon: React.FC<{ color?: string; size?: number }> = ({
    color = "#fff",
    size = 20
}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
);

const SkipBackIcon: React.FC = () => (
    <svg width={28} height={28} viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)">
        <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
    </svg>
);

const SkipForwardIcon: React.FC = () => (
    <svg width={28} height={28} viewBox="0 0 24 24" fill="rgba(255,255,255,0.7)">
        <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
    </svg>
);

const MusicWaveIcon: React.FC = () => (
    <svg width={12} height={12} viewBox="0 0 24 24" fill="#fff">
        <rect x="4" y="8" width="3" height="8" rx="1">
            <animate attributeName="height" values="8;16;8" dur="0.6s" repeatCount="indefinite" />
            <animate attributeName="y" values="8;4;8" dur="0.6s" repeatCount="indefinite" />
        </rect>
        <rect x="10" y="4" width="3" height="16" rx="1">
            <animate attributeName="height" values="16;8;16" dur="0.5s" repeatCount="indefinite" />
            <animate attributeName="y" values="4;8;4" dur="0.5s" repeatCount="indefinite" />
        </rect>
        <rect x="16" y="6" width="3" height="12" rx="1">
            <animate attributeName="height" values="12;16;12" dur="0.7s" repeatCount="indefinite" />
            <animate attributeName="y" values="6;4;6" dur="0.7s" repeatCount="indefinite" />
        </rect>
    </svg>
);
