import React from "react";
import { WorldState } from "@tokovo/core";

export const VisualDebugger: React.FC<{ world: WorldState; t: number }> = ({ world, t }) => {
    return (
        <div style={{
            position: "absolute",
            bottom: 50,
            right: 50,
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "#0f0",
            fontFamily: "monospace",
            fontSize: 24,
            padding: 20,
            borderRadius: 10,
            zIndex: 9999,
            pointerEvents: "none",
            maxWidth: 600
        }}>
            <div><strong>Frame:</strong> {t.toFixed(0)}</div>
            <div><strong>Active App:</strong> {Object.values(world.devices)[0]?.foregroundAppId || "Home"}</div>
            <div><strong>Events:</strong></div>
            {/* We would need access to events here, but world state doesn't store history. 
                Just showing state for now. */}
            <div style={{ marginTop: 10, fontSize: 18, opacity: 0.8 }}>
                Camera: {world.camera.type}
            </div>
        </div>
    );
};
