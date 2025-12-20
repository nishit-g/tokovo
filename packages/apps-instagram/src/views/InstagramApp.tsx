/**
 * Instagram App Router
 * 
 * Main entry point for Instagram app.
 * Routes between screens based on appState.screen.
 * 
 * Receives props from TokovoRenderer via AppSurface:
 * - world: Current world state
 * - t: Current frame number
 * - platform: "ios" | "android" 
 * - deviceId: Current device ID
 * - safeAreaInsets: Safe area margins
 */

import React from "react";
import type { WorldState } from "@tokovo/core";
import { HomeScreen } from "./ios/HomeScreen";
import { DMScreen } from "./ios/DMScreen";
import type { InstagramState, InstagramWorldState, InstagramThread } from "../types";

// Match AppViewProps from @tokovo/core
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

// Design dimensions (logical pixels)
const DESIGN_WIDTH = 393;
const DESIGN_HEIGHT = 852;

export const InstagramApp: React.FC<InstagramAppProps> = ({
    world,
    t = 0,
    platform = "ios",
    deviceId,
    safeAreaInsets = { top: 59, bottom: 34, left: 0, right: 0 },
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

    // Container style - fills AppSurface logical space
    const containerStyle: React.CSSProperties = {
        width: DESIGN_WIDTH,
        height: DESIGN_HEIGHT,
        backgroundColor: "#000",
        position: "relative",
        overflow: "hidden",
    };

    // Route to screen
    switch (screen) {
        case "dm_thread": {
            const thread = threads.find((t: InstagramThread) => t.id === activeThreadId);
            if (thread) {
                return (
                    <div style={containerStyle}>
                        <DMScreen
                            thread={thread}
                            width={DESIGN_WIDTH}
                            height={DESIGN_HEIGHT}
                        />
                    </div>
                );
            }
            // Fallback to home if thread not found
            return (
                <div style={containerStyle}>
                    <HomeScreen
                        feed={feed}
                        stories={stories}
                        width={DESIGN_WIDTH}
                        height={DESIGN_HEIGHT}
                    />
                </div>
            );
        }

        case "home":
        default:
            return (
                <div style={containerStyle}>
                    <HomeScreen
                        feed={feed}
                        stories={stories}
                        width={DESIGN_WIDTH}
                        height={DESIGN_HEIGHT}
                    />
                </div>
            );
    }
};

export default InstagramApp;
