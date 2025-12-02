import React from "react";
import { WorldState } from "@tokovo/core";

export const FeedView: React.FC<{ world: WorldState; t: number }> = ({ world, t }) => {
    return (
        <div style={{ backgroundColor: "white", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
            <div style={{ fontSize: 72 }}>Instagram Feed (Placeholder)</div>
        </div>
    );
};
