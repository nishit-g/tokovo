/**
 * Media Grid Component
 * 
 * Displays 1-4 images in Twitter's grid layout patterns.
 */

import React from "react";
import { twitterColors, twitterSpacing, mediaGridLayouts } from "../config";

// =============================================================================
// TYPES
// =============================================================================

export interface MediaItem {
    url: string;
    type: "image" | "video" | "gif";
    alt?: string;
}

export interface MediaGridProps {
    media: MediaItem[];
    maxHeight?: number;
}

// =============================================================================
// PLAY BUTTON OVERLAY
// =============================================================================

const PlayButton: React.FC = () => (
    <div style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 120,
        height: 120,
        borderRadius: "50%",
        backgroundColor: "rgba(29, 155, 240, 0.9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    }}>
        <svg width={48} height={48} viewBox="0 0 24 24" fill="white">
            <path d="M8 5v14l11-7z" />
        </svg>
    </div>
);

// =============================================================================
// MEDIA GRID COMPONENT
// =============================================================================

export const MediaGrid: React.FC<MediaGridProps> = ({
    media,
    maxHeight = 600,
}) => {
    if (media.length === 0) return null;

    const count = Math.min(media.length, 4) as 1 | 2 | 3 | 4;
    const layout = mediaGridLayouts[count];
    const gap = twitterSpacing.mediagap;
    const radius = twitterSpacing.mediaRadius;

    // Calculate dimensions
    const totalWidth = 1000;  // Fixed width for grid
    const cellWidth = (totalWidth - gap * (layout.cols - 1)) / layout.cols;
    const cellHeight = count === 1 ? maxHeight : (maxHeight - gap * (layout.rows - 1)) / layout.rows;

    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
            gridTemplateRows: `repeat(${layout.rows}, ${cellHeight}px)`,
            gap,
            borderRadius: radius,
            overflow: "hidden",
            marginTop: 24,
        }}>
            {media.slice(0, 4).map((item, index) => {
                const span = layout.spans[index];

                return (
                    <div
                        key={index}
                        style={{
                            position: "relative",
                            gridRow: `${span.row + 1} / span ${span.rowSpan}`,
                            gridColumn: `${span.col + 1} / span ${span.colSpan}`,
                            backgroundColor: twitterColors.background.secondary,
                            overflow: "hidden",
                            // Corner radius based on position
                            borderTopLeftRadius: span.row === 0 && span.col === 0 ? radius : 0,
                            borderTopRightRadius: span.row === 0 && span.col + span.colSpan === layout.cols ? radius : 0,
                            borderBottomLeftRadius: span.row + span.rowSpan === layout.rows && span.col === 0 ? radius : 0,
                            borderBottomRightRadius: span.row + span.rowSpan === layout.rows && span.col + span.colSpan === layout.cols ? radius : 0,
                        }}
                    >
                        <img
                            src={item.url}
                            alt={item.alt || "Media"}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                            }}
                        />

                        {/* Video/GIF play overlay */}
                        {(item.type === "video" || item.type === "gif") && (
                            <PlayButton />
                        )}

                        {/* GIF label */}
                        {item.type === "gif" && (
                            <div style={{
                                position: "absolute",
                                bottom: 12,
                                left: 12,
                                backgroundColor: "rgba(0, 0, 0, 0.75)",
                                padding: "6px 12px",
                                borderRadius: 6,
                            }}>
                                <span style={{
                                    fontSize: 30,
                                    fontWeight: 700,
                                    color: "white",
                                    fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                                }}>
                                    GIF
                                </span>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default MediaGrid;
