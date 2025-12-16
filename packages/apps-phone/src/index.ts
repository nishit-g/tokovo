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
    anchors: PhoneAnchors.framing, // Static fallback
    // Note: Plugin definition currently accepts object. 
    // To support dynamic anchors, we need to register the provider manually or upgrade definePlugin types.
    // PluginManager.register (Step 713) handles `plugin.anchors` as `AnchorFraming`.
    // To use full dynamic Provider, we rely on the side-effect here OR PluginManager improvement.
    // I will stick to side-effect registration for the Provider for now until Core is upgraded.

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

// Register Provider Side-Effect (Bridge for dynamic anchors)
import { AnchorRegistry } from "@tokovo/core";
AnchorRegistry.register(PhoneAnchors);

export default PhonePlugin;

// Re-export parts for manual usage if needed
export { phoneReducer, PhoneApp, PhoneAnchors };
