/**
 * Phone Application Metadata
 */

import React from "react";
import { AppMetadata } from "@tokovo/core";

export const PhoneIcon = (
    <div style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "1.2em",
        color: "white"
    }}>
        📞
    </div>
);

export const PhoneMetadata: AppMetadata & { name: string } = {
    name: "Phone",
    displayName: "Phone",
    themeColor: "#34C759", // iOS Green
    icon: PhoneIcon,
    viewStrategy: "FULLSCREEN" as any, // Cast to any until ViewKind is verified
    designWidth: 393
};
