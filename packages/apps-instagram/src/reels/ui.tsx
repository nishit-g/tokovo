import React from "react";
import { WorldState } from "@tokovo/core";

export const ReelsView: React.FC<{ world: WorldState; t: number }> = ({ world, t }) => {
    return (
        <div style={{ backgroundColor: "black", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", color: "white" }}>
            <div style={{ fontSize: 72 }}>Reels (Placeholder)</div>
        </div>
    );
};
