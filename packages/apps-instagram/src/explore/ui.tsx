import React from "react";
import { WorldState } from "@tokovo/core";

export const ExploreView: React.FC<{ world: WorldState; t: number }> = ({ world, t }) => {
    return (
        <div style={{ backgroundColor: "white", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div style={{ fontSize: 72 }}>Explore (Placeholder)</div>
        </div>
    );
};
