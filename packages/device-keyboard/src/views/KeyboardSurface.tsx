import React from "react";
import { KeyboardState } from "@tokovo/core";
import { KeyboardStrategyRegistry } from "./strategy";

// Default Implementations
import "./ios/IOSKeyboard";

interface KeyboardSurfaceProps {
    keyboard: KeyboardState;
    variant?: "light" | "dark";
    platform?: "ios" | "android" | "pixel" | string;
    width?: number; // Target width
    t: number;
}

/**
 * KeyboardSurface
 * 
 * Now integrated with AppSurface for correct architectural scaling.
 * Design Width: 393px (Standard iOS)
 */
export const KeyboardSurface: React.FC<KeyboardSurfaceProps> = ({
    keyboard,
    variant = "light",
    platform = "ios",
    width,
    t
}) => {
    const strategy = KeyboardStrategyRegistry.getOrDefault(platform);
    const View = strategy?.Keyboard;

    if (!View) return null;

    // SCALING LOGIC
    // We want the keyboard to be EXACTLY 393px wide (Logical Design).
    // We scale it up/down to fit the Target Width.
    // We anchor it to the BOTTOM of the screen.
    const designWidth = 393;
    const targetWidth = width || designWidth;
    const scale = targetWidth / designWidth;

    return (
        <div style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%", // Physical width
            display: "flex",
            justifyContent: "flex-start", // Left align for transform origin
            pointerEvents: "none", // Let clicks pass through empty space above
            zIndex: 1000,
        }}>
            <div style={{
                width: designWidth,
                transform: `scale(${scale})`,
                transformOrigin: "bottom left",
                pointerEvents: "auto", // Re-enable pointer events
            }}>
                <View keyboard={keyboard as any} variant={variant} t={t} />
            </div>
        </div>
    );
};

function normalizePlatform(p: string): string {
    if (p.startsWith("iphone") || p === "ios") return "ios";
    if (p.startsWith("pixel") || p === "android") return "android";
    return p;
}
