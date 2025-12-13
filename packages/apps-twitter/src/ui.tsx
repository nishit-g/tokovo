/**
 * Twitter/X Main UI
 * 
 * Root component that renders the Twitter app based on state.
 */

import React from "react";
import { WorldState, Platform } from "@tokovo/core";
import { twitterColors, twitterLayout } from "./config";
import { Header, BottomNav, Tweet, TweetData } from "./components";
import { TWITTER_APP_ID, TwitterState } from "./runtime";

// =============================================================================
// TYPES
// =============================================================================

export interface TwitterUIProps {
    world: WorldState;
    deviceId: string;
    platform?: Platform;
    t?: number;
}

// =============================================================================
// COMPOSE BUTTON (FAB)
// =============================================================================

const ComposeButton: React.FC = () => (
    <div style={{
        position: "fixed",
        bottom: twitterLayout.bottomNavHeight + twitterLayout.safeAreaBottom + 48,
        right: 48,
        width: 168,
        height: 168,
        borderRadius: "50%",
        backgroundColor: twitterColors.brand.blue,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 6px 24px rgba(29, 155, 240, 0.5)",
        zIndex: 50,
    }}>
        <svg width={72} height={72} viewBox="0 0 24 24" fill="white">
            <path d="M23 3c-6.62-.1-10.38 2.421-13.05 6.03C7.29 12.61 6 17.331 6 22h2c0-1.007.07-2.012.19-3H12c4.1 0 7.48-3.082 7.94-7.054C22.79 10.147 23.17 6.359 23 3zm-7 8h-1.5v2H16c.63-.016 1.2-.08 1.72-.188C16.95 15.24 14.68 17 12 17H8.55c.57-2.512 1.57-4.851 3-6.78 2.16-2.912 5.29-4.911 9.45-5.187C20.95 8.079 19.9 11 16 11zM4 9V6H1V4h3V1h2v3h3v2H6v3H4z" />
        </svg>
    </div>
);

// =============================================================================
// TIMELINE SCREEN
// =============================================================================

const TimelineScreen: React.FC<{
    tweets: TweetData[];
    activeTab: "for-you" | "following";
    userAvatarUrl?: string;
    userName?: string;
}> = ({ tweets, activeTab, userAvatarUrl, userName }) => (
    <div style={{
        flex: 1,
        overflowY: "auto",
        backgroundColor: twitterColors.background.primary,
    }}>
        <Header
            activeTab={activeTab}
            userAvatarUrl={userAvatarUrl}
            userName={userName}
        />

        {/* Tweet list */}
        <div style={{
            paddingBottom: twitterLayout.bottomNavHeight + twitterLayout.safeAreaBottom + 48,
        }}>
            {tweets.length === 0 ? (
                <div style={{
                    padding: 96,
                    textAlign: "center",
                }}>
                    <p style={{
                        fontSize: 48,
                        color: twitterColors.text.secondary,
                        fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
                    }}>
                        No tweets yet
                    </p>
                </div>
            ) : (
                tweets.map((tweet) => (
                    <Tweet key={tweet.id} tweet={tweet} />
                ))
            )}
        </div>

        <ComposeButton />
        <BottomNav activeTab="home" />
    </div>
);

// =============================================================================
// MAIN UI COMPONENT
// =============================================================================

export const TwitterUI: React.FC<TwitterUIProps> = ({
    world,
    deviceId,
    platform = "ios",
    t = 0,
}) => {
    // Get app state
    const appState = world.appState[TWITTER_APP_ID] as TwitterState | undefined;
    const screen = appState?.screen || "timeline";
    const activeTab = appState?.activeTab || "for-you";
    const tweets = (appState as any)?.tweets || [];

    // Get user info (could come from device or world state)
    const device = world.devices[deviceId];
    const userName = "User";
    const userAvatarUrl = undefined;

    return (
        <div style={{
            width: "100%",
            height: "100%",
            backgroundColor: twitterColors.background.primary,
            fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
            color: twitterColors.text.primary,
            display: "flex",
            flexDirection: "column",
        }}>
            {screen === "timeline" && (
                <TimelineScreen
                    tweets={tweets}
                    activeTab={activeTab}
                    userAvatarUrl={userAvatarUrl}
                    userName={userName}
                />
            )}

            {/* TODO: Add other screens */}
            {screen === "tweet-detail" && (
                <div style={{ padding: 48 }}>
                    <p>Tweet Detail View (Coming Soon)</p>
                </div>
            )}

            {screen === "profile" && (
                <div style={{ padding: 48 }}>
                    <p>Profile View (Coming Soon)</p>
                </div>
            )}

            {screen === "notifications" && (
                <div style={{ padding: 48 }}>
                    <p>Notifications (Coming Soon)</p>
                </div>
            )}
        </div>
    );
};

// =============================================================================
// APP RENDERER (For integration with Tokovo renderer)
// =============================================================================

export function renderTwitterApp(
    world: WorldState,
    deviceId: string,
    platform: Platform = "ios",
    t: number = 0
): React.ReactElement {
    return (
        <TwitterUI
            world={world}
            deviceId={deviceId}
            platform={platform}
            t={t}
        />
    );
}

export default TwitterUI;
