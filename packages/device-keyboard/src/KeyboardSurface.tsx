import React from "react";
import { KeyboardState } from "@tokovo/core";
import { KeyboardRegistry } from "./core/registry";

// Default Implementations
import "./components/IOSKeyboard"; // Triggers registration

interface KeyboardSurfaceProps {
    keyboard: KeyboardState;
    variant?: "light" | "dark"; // Theme variant
    platform?: "ios" | "android" | "pixel" | string; // OS variant
    t: number;
}

/**
 * KeyboardSurface
 * 
 * The unified entry point for rendering virtual keyboards.
 * Uses the Strategy Pattern to select the correct implementation based on the platform.
 */
export const KeyboardSurface: React.FC<KeyboardSurfaceProps> = ({
    keyboard,
    variant = "light",
    platform = "ios",
    t
}) => {
    // 1. Resolve Implementation
    // Normalize platform ID (e.g., "iphone16" -> "ios")
    // Implementation Detail: We might want a smarter resolver here.
    // const resolvedPlatform = normalizePlatform(platform); // Removed

    const View = KeyboardRegistry.get(platform) || KeyboardRegistry.get("ios"); // Fallback

    if (!View) return null;

    return (
        <View keyboard={keyboard} variant={variant} t={t} />
    );
};

function normalizePlatform(p: string): string {
    if (p.startsWith("iphone") || p === "ios") return "ios";
    if (p.startsWith("pixel") || p === "android") return "android";
    return p;
}
