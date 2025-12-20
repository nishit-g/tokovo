/**
 * Instagram App Router
 * 
 * Main entry point for Instagram app.
 * Routes between screens based on appState.screen.
 * 
 * ARCHITECTURE: Safe area is handled centrally here.
 * All child screens receive the full content area (inside safe area).
 */

import React from "react";
import type { WorldState } from "@tokovo/core";
import { HomeScreen } from "./ios/HomeScreen";
import { DMScreen } from "./ios/DMScreen";
import type { InstagramState, InstagramWorldState, InstagramThread } from "../types";

// =============================================================================
// TYPES
// =============================================================================

interface InstagramAppProps {
    world: WorldState;
    t?: number;
    layout?: any;
    platform?: "ios" | "android";
    deviceId?: string;
    safeAreaInsets?: {
        top: number;
        bottom: number;
        left: number;
        right: number;
    };
}

// =============================================================================
// CONSTANTS
// =============================================================================

// iPhone 16 Pro logical dimensions
const DESIGN_WIDTH = 393;
const DESIGN_HEIGHT = 852;

// Safe area for iPhone 16 Pro (Dynamic Island)
const DEFAULT_SAFE_AREA = {
    top: 59,     // Dynamic Island
    bottom: 34,  // Home indicator
    left: 0,
    right: 0,
};

// =============================================================================
// COMPONENT
// =============================================================================

export const InstagramApp: React.FC<InstagramAppProps> = ({
    world,
    t = 0,
    platform = "ios",
    deviceId,
    safeAreaInsets = DEFAULT_SAFE_AREA,
}) => {
    // Get app state
    const appState = (world.appState?.["app_instagram"]) as InstagramState | undefined;
    const screen = appState?.screen || "home";
    const activeThreadId = appState?.activeThreadId;

    // Get Instagram data
    const instagramData = (world as any).instagram as InstagramWorldState | undefined;
    const feed = instagramData?.feed ?? [];
    const stories = instagramData?.stories ?? [];
    const threads = instagramData?.threads ?? [];

    // Calculate content area (inside safe area)
    const contentWidth = DESIGN_WIDTH - safeAreaInsets.left - safeAreaInsets.right;
    const contentHeight = DESIGN_HEIGHT - safeAreaInsets.top - safeAreaInsets.bottom;

    // Container style - full device logical space
    const containerStyle: React.CSSProperties = {
        width: DESIGN_WIDTH,
        height: DESIGN_HEIGHT,
        backgroundColor: "#000",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
    };

    // Safe area top spacer (for Dynamic Island / notch)
    const safeAreaTopStyle: React.CSSProperties = {
        height: safeAreaInsets.top,
        flexShrink: 0,
        backgroundColor: "#000",
    };

    // Content area style
    const contentAreaStyle: React.CSSProperties = {
        flex: 1,
        position: "relative",
        overflow: "hidden",
    };

    // Render current screen
    const renderScreen = () => {
        switch (screen) {
            case "dm_thread": {
                const thread = threads.find((t: InstagramThread) => t.id === activeThreadId);
                if (thread) {
                    return (
                        <DMScreen
                            thread={thread}
                            width={contentWidth}
                            height={contentHeight}
                            safeAreaBottom={safeAreaInsets.bottom}
                        />
                    );
                }
                // Fallback to home if thread not found
                return (
                    <HomeScreen
                        feed={feed}
                        stories={stories}
                        width={contentWidth}
                        height={contentHeight}
                        safeAreaBottom={safeAreaInsets.bottom}
                    />
                );
            }

            case "home":
            default:
                return (
                    <HomeScreen
                        feed={feed}
                        stories={stories}
                        width={contentWidth}
                        height={contentHeight}
                        safeAreaBottom={safeAreaInsets.bottom}
                    />
                );
        }
    };

    return (
        <div style={containerStyle}>
            {/* Safe area top spacer */}
            <div style={safeAreaTopStyle} />

            {/* Content area */}
            <div style={contentAreaStyle}>
                {renderScreen()}
            </div>
        </div>
    );
};

export default InstagramApp;
