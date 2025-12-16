import React from "react";
import { AppViewProps, ScreenComponent } from "@tokovo/core/dist/plugin";

export interface AppRouterProps extends AppViewProps {
    screens: Record<string, ScreenComponent>;
    defaultScreen?: string;
}

/**
 * Standard App Router
 * 
 * Inspects `world.appState[appId].screen` (or `viewMode`) and renders
 * the corresponding component from the `screens` map.
 */
export const AppRouter: React.FC<AppRouterProps> = (props) => {
    // 1. Resolve State
    // We assume the reducer stores navigation state in `screen` property
    // This creates a standard contract for navigation state.
    const appId = props.layout?.appId || "unknown";
    const appState = props.world.appState[appId] || {};

    // 2. Resolve Current Screen
    // Priority: State > Default > "chat" (fallback)
    const currentScreenId = appState.screen || props.defaultScreen || "chat";

    // 3. Resolve Component
    const Screen = props.screens[currentScreenId];

    if (!Screen) {
        console.warn(`[AppRouter] Screen not found: "${currentScreenId}" for app "${appId}". Available: ${Object.keys(props.screens).join(", ")}`);
        return null; // Or render an error boundary / fallback
    }

    // 4. Render
    return <Screen {...props} />;
};
