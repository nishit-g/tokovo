/**
 * @tokovo/apps-phone
 * 
 * Phone Call Simulation Package
 * Enterprise Standard Implementation
 */

import { definePlugin, APP_IDS } from "@tokovo/core";

// 1. Logic
import { phoneReducer } from "./logic/reducer";

// 2. UI
import { PhoneApp } from "./ui";

// 3. Adapters
import { PhoneAnchors } from "./adapters/anchors";

// 4. Assets
import { PhoneMetadata } from "./assets/metadata"; // Need to create this or inline

// 5. Widgets
import { DynamicIslandCall } from "./widgets/DynamicIsland";

export const PhonePlugin = definePlugin({
    id: APP_IDS.PHONE,
    name: "Phone",
    version: "2.0.0",

    metadata: PhoneMetadata,

    // UI
    appView: PhoneApp,

    // Logic
    reducer: phoneReducer,

    // Anchors
    anchors: PhoneAnchors.framing,
    getAnchors: PhoneAnchors.getAnchors,

    // Widgets
    widgets: [
        {
            mode: "dynamicIsland",
            platforms: ["ios"],
            priority: 100, // High priority
            component: DynamicIslandCall,
            expansionModes: ["compact"]
        }
    ],

    eventTypes: ["CALL"]
});


export default PhonePlugin;

// Re-export parts for manual usage if needed
export { phoneReducer, PhoneApp, PhoneAnchors };
