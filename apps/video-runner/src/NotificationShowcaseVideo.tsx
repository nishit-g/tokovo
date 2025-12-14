/**
 * Notification Showcase Video
 * 
 * Demonstrates all notification features in a 40-second video.
 */

import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { createEventIndex } from "@tokovo/core";
import { buildWorld } from "./engine";
import { TokovoRenderer } from "@tokovo/renderer";
import { iPhone16Profile } from "@tokovo/devices";
import { notificationShowcaseEpisode } from "@tokovo/episodes";

// Import reducers
import "@tokovo/devices";

export const NotificationShowcaseVideo: React.FC = () => {
    const t = useCurrentFrame();

    // Memoize the event index for performance
    const eventIndex = useMemo(() =>
        createEventIndex(notificationShowcaseEpisode.events),
        []
    );

    // Compute world state at current frame
    const world = useMemo(() =>
        buildWorld(notificationShowcaseEpisode.initialWorld, notificationShowcaseEpisode.events, t),
        [t]
    );

    return (
        <AbsoluteFill style={{
            backgroundColor: "#1a1a1a",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
        }}>
            {/* Title overlay for demo */}
            <div style={{
                position: "absolute",
                top: 40,
                left: 40,
                color: "white",
                fontFamily: "system-ui, sans-serif",
                zIndex: 100,
            }}>
                <h1 style={{ fontSize: 28, margin: 0, opacity: 0.9 }}>
                    📱 Notification Showcase
                </h1>
                <p style={{ fontSize: 14, opacity: 0.6, margin: "8px 0 0 0" }}>
                    Frame: {t} | Time: {(t / 30).toFixed(1)}s
                </p>
            </div>

            {/* Device */}
            <div style={{
                transform: "scale(0.7)",
                transformOrigin: "center center",
            }}>
                <TokovoRenderer
                    world={world}
                    t={t}
                    focusDeviceId="phone"
                    eventIndex={eventIndex}
                    directorEnabled={false}
                />
            </div>

            {/* Feature timeline */}
            <div style={{
                position: "absolute",
                bottom: 40,
                left: 40,
                right: 40,
                color: "white",
                fontFamily: "monospace",
                fontSize: 12,
                opacity: 0.7,
            }}>
                {getFeatureLabel(t)}
            </div>
        </AbsoluteFill>
    );
};

function getFeatureLabel(frame: number): string {
    if (frame < 90) return "▸ ACT 1: Basic WhatsApp notification";
    if (frame < 150) return "▸ ACT 1: Instagram notification";
    if (frame < 240) return "▸ ACT 2: Time-sensitive (Uber arriving)";
    if (frame < 360) return "▸ ACT 3: Rich content with image preview + action buttons";
    if (frame < 480) return "▸ ACT 4: Replyable notification + inline reply";
    if (frame < 600) return "▸ ACT 5: Notification update (3 new messages)";
    if (frame < 750) return "▸ ACT 6: Notification grouping (4 emails)";
    if (frame < 900) return "▸ ACT 7: User interactions (tap, swipe dismiss)";
    if (frame < 990) return "▸ ACT 8: Critical notification (meeting)";
    if (frame < 1080) return "▸ ACT 9: Clear all notifications";
    if (frame < 1140) return "▸ ACT 10: Silent notification (no headsUp)";
    return "✅ Demo complete!";
}

export default NotificationShowcaseVideo;
