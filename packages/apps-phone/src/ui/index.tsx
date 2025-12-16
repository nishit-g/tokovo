/**
 * Phone App - UI Entry Point
 * 
 * Routes to platform-specific implementations.
 */

import React from "react";
import { AppViewProps } from "@tokovo/core";
import { CallScreenIOS } from "./ios/CallScreen";
// import { CallScreenAndroid } from "./android/CallScreen"; // Future

export const PhoneApp: React.FC<AppViewProps> = (props) => {
    const { platform = "ios" } = props;

    // TODO: Implement Android
    if (platform === "android") {
        return <div style={{ color: "white" }}>Android Call Screen (Coming Soon)</div>;
    }

    return <CallScreenIOS {...props} />;
};
