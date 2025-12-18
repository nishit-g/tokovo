/**
 * Device Calls Plugin - Enterprise Contract
 * 
 * Self-contained plugin for phone call simulation.
 */

import { ReducerRegistry, APP_IDS } from "@tokovo/core";

// Runtime
import { callReducer, CALL_EVENT_TYPES } from "./reducer";
import { CallScheduler } from "./scheduler";

// Registries
import { CallUIStrategyRegistry, RingtoneRegistry } from "./registries";

// DSL
import { CallTrackBuilder } from "./dsl";

// Lowering
import { callV2Lowering } from "./lowering";

// Views (re-export from existing)
import { PhoneApp } from "./ui";
import { DynamicIslandCall } from "./widgets/DynamicIsland";
import { IncomingCallBanner } from "./widgets/IncomingCallBanner";

// =============================================================================
// PLUGIN CONTRACT
// =============================================================================

export interface DeviceCallsPluginContract {
    id: "device-calls";
    version: string;
    displayName: string;

    // Runtime
    reducer: typeof callReducer;
    scheduler: typeof CallScheduler;

    // Registries
    CallUIStrategyRegistry: typeof CallUIStrategyRegistry;
    RingtoneRegistry: typeof RingtoneRegistry;

    // Views
    PhoneApp: typeof PhoneApp;
    DynamicIslandCall: typeof DynamicIslandCall;
    IncomingCallBanner: typeof IncomingCallBanner;

    // DSL
    TrackBuilder: typeof CallTrackBuilder;

    // Lowering
    v2Lowering: typeof callV2Lowering;

    // Event types
    eventTypes: typeof CALL_EVENT_TYPES;
}

export const DeviceCallsPlugin: DeviceCallsPluginContract = {
    // Identity
    id: "device-calls",
    version: "2.0.0",
    displayName: "Phone Calls",

    // Runtime
    reducer: callReducer,
    scheduler: CallScheduler,

    // Registries
    CallUIStrategyRegistry,
    RingtoneRegistry,

    // Views
    PhoneApp,
    DynamicIslandCall,
    IncomingCallBanner,

    // DSL
    TrackBuilder: CallTrackBuilder,

    // Lowering
    v2Lowering: callV2Lowering,

    // Event types
    eventTypes: CALL_EVENT_TYPES,
};

// =============================================================================
// AUTO-REGISTRATION
// =============================================================================

let registered = false;

export function registerCallsPlugin(): void {
    if (registered) return;
    registered = true;

    // Reducer is auto-registered in reducer.ts

    // Register default ringtones
    RingtoneRegistry.register("default", "sounds/ringtone.mp3");
    RingtoneRegistry.register("silent", "");

    console.log("[DeviceCallsPlugin] Registered");
}

export default DeviceCallsPlugin;
