/**
 * Spotify Dynamic Island Widget - iOS
 * 
 * Renders Spotify Now Playing in the Dynamic Island.
 * Supports minimal (icon+waveform), compact (track name), and expanded (full player) modes.
 */

import React from "react";
import { WidgetProps } from "@tokovo/core";

interface SpotifyDynamicIslandProps extends WidgetProps {
    appState: {
        currentTrack?: {
            name: string;
            artist: string;
            albumArt?: string;
        };
        isPlaying?: boolean;
    };
}

/**
 * Spotify Dynamic Island Widget Component
 */
export const SpotifyDynamicIslandWidget: React.FC<SpotifyDynamicIslandProps> = ({
    appState,
    backgroundApp,
    deviceProfile,
    currentFrame,
    expansionMode,
}) => {
    const di = deviceProfile.dynamicIsland;
    if (!di) return null;

    // Parse track info from backgroundApp label
    const label = backgroundApp?.label || "";
    const parts = label.split(" - ");
    const trackName = parts[0] || appState.currentTrack?.name || "Now Playing";
    const artistName = parts[1] || appState.currentTrack?.artist || "Spotify";

    // Animation
    const startFrame = backgroundApp?.startedAt || 0;
    const elapsed = currentFrame - startFrame;
    const expandDuration = 20;
    const expandProgress = Math.min(1, elapsed / expandDuration);
    const ease = 1 - Math.pow(1 - expandProgress, 3);

    // Size interpolation based on expansion mode
    const isExpanded = expansionMode === "expanded" || expansionMode === "compact";
    const width = isExpanded
        ? di.collapsedWidth + (di.expandedWidth - di.collapsedWidth) * ease
        : di.collapsedWidth;
    const height = isExpanded
        ? di.collapsedHeight + (di.expandedHeight - di.collapsedHeight) * ease
        : di.collapsedHeight;

    return (
        <div
            style={{
                width,
                height,
                background: "#000000",
                borderRadius: di.cornerRadius,
                display: "flex",
                alignItems: "center",
                padding: "0 40px",
                gap: 30,
                boxShadow: "0 12px 60px rgba(0,0,0,0.5)",
                overflow: "hidden",
            }}
        >
            {/* Spotify Logo */}
            <div
                style={{
                    width: 90,
                    height: 90,
                    borderRadius: 20,
                    background: "#1DB954",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}
            >
                <SpotifyIcon size={50} />
            </div>

            {/* Track Info - shows when expanded */}
            {expandProgress > 0.5 && (
                <div
                    style={{
                        flex: 1,
                        minWidth: 0,
                        opacity: (expandProgress - 0.5) * 2,
                    }}
                >
                    <div
                        style={{
                            fontSize: 42,
                            fontWeight: 600,
                            color: "#fff",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                            marginBottom: 6,
                        }}
                    >
                        {trackName}
                    </div>
                    <div
                        style={{
                            fontSize: 36,
                            color: "rgba(255,255,255,0.6)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
                        }}
                    >
                        {artistName}
                    </div>
                </div>
            )}

            {/* Music Wave Animation */}
            {expandProgress > 0.3 && (
                <div style={{ opacity: (expandProgress - 0.3) / 0.7, flexShrink: 0 }}>
                    <MusicWaveIcon />
                </div>
            )}
        </div>
    );
};

// =============================================================================
// ICONS
// =============================================================================

const SpotifyIcon: React.FC<{ size?: number }> = ({ size = 50 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#000">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
);

const MusicWaveIcon: React.FC = () => (
    <svg width={60} height={60} viewBox="0 0 24 24" fill="#1DB954">
        <rect x="4" y="10" width="3" height="4" rx="1">
            <animate attributeName="height" values="4;12;4" dur="0.6s" repeatCount="indefinite" />
            <animate attributeName="y" values="10;6;10" dur="0.6s" repeatCount="indefinite" />
        </rect>
        <rect x="10" y="6" width="3" height="12" rx="1">
            <animate attributeName="height" values="12;4;12" dur="0.5s" repeatCount="indefinite" />
            <animate attributeName="y" values="6;10;6" dur="0.5s" repeatCount="indefinite" />
        </rect>
        <rect x="16" y="8" width="3" height="8" rx="1">
            <animate attributeName="height" values="8;14;8" dur="0.7s" repeatCount="indefinite" />
            <animate attributeName="y" values="8;5;8" dur="0.7s" repeatCount="indefinite" />
        </rect>
    </svg>
);

export default SpotifyDynamicIslandWidget;
