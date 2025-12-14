/**
 * Phone App - Main UI Component
 * 
 * Strategy pattern: Selects iOS or Android UI based on device profile.
 * Within each platform, selects version-specific components.
 */

import React from "react";
import { AppViewProps, CallState } from "@tokovo/core";
import { getDeviceProfile } from "@tokovo/devices";

// iOS Components
import { IncomingIOS } from "./components/ios/IncomingIOS";
import { ActiveCallIOS } from "./components/ios/ActiveCallIOS";

// Android Components
import { IncomingAndroid } from "./components/android/IncomingAndroid";
import { ActiveCallAndroid } from "./components/android/ActiveCallAndroid";

// Screens
import { RecentsScreen } from "./components/screens/RecentsScreen";

/**
 * PhoneApp - Main entry point for phone call simulation
 * 
 * Renders different UI based on:
 * 1. Platform (iOS vs Android)
 * 2. Call status (incoming, active, ended)
 * 3. Device profile (iOS version, Android variant)
 */
export const PhoneApp: React.FC<AppViewProps> = ({ world, deviceId, platform, t = 0 }) => {
    const device = world.devices[deviceId || Object.keys(world.devices)[0]];
    if (!device) return null;

    const profile = getDeviceProfile(device.profileId);
    const detectedPlatform = platform || profile?.platform || "ios";
    const call = device.call;

    // No active call - show recents screen
    if (!call || call.status === "ended" || call.status === "declined") {
        return <RecentsScreen platform={detectedPlatform} />;
    }

    // Incoming call
    if (call.status === "incoming" || call.status === "ringing") {
        return detectedPlatform === "ios"
            ? <IncomingIOS call={call} profile={profile} currentFrame={t} />
            : <IncomingAndroid call={call} profile={profile} currentFrame={t} />;
    }

    // Active call (connecting or active)
    if (call.status === "connecting" || call.status === "active") {
        return detectedPlatform === "ios"
            ? <ActiveCallIOS call={call} t={t} />
            : <ActiveCallAndroid call={call} t={t} />;
    }

    return null;
};
