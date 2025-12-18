/**
 * @tokovo/device-calls
 * 
 * Enterprise-grade phone call simulation for Tokovo.
 * 
 * @example
 * ```typescript
 * import { CallTrackBuilder } from "@tokovo/device-calls";
 * 
 * const call = new CallTrackBuilder(30, "phone", getOrder);
 * 
 * call.at("2s").incoming({ callerId: "123", callerName: "Mom" });
 * call.at("5s").answer();
 * call.at("30s").toggleMute();
 * call.at("60s").end();
 * ```
 */

// =============================================================================
// TYPES
// =============================================================================

export type {
    CallState,
    CallStatus,
    CallType,
    CallDisplayMode,
    CallEventType,
} from "./types";

export type {
    IncomingCallPayload,
    AnswerCallPayload,
    EndCallPayload,
    CallPayloads,
} from "./types/payloads";

export type {
    CallUIStrategyProps,
    CallUIStrategyComponent,
    IncomingCallBannerProps,
    DynamicIslandCallProps,
} from "./types/ui";

// =============================================================================
// DSL
// =============================================================================

export { CallTrackBuilder, CallPointBuilder } from "./dsl";

// =============================================================================
// IR
// =============================================================================

export type { CallTrackEvent } from "./ir";
export { isCallEvent } from "./ir";

// =============================================================================
// LOWERING
// =============================================================================

export { callV2Lowering, CALL_EVENT_TYPES as LOWERING_EVENT_TYPES } from "./lowering";

// =============================================================================
// REDUCER
// =============================================================================

export { callReducer, CALL_EVENT_TYPES } from "./reducer";

// =============================================================================
// SCHEDULER
// =============================================================================

export { CallScheduler } from "./scheduler";

// =============================================================================
// REGISTRIES
// =============================================================================

export {
    CallUIStrategyRegistry,
    RingtoneRegistry,
    type CallUIStrategyComponent as UIStrategy,
} from "./registries";

// =============================================================================
// VIEWS
// =============================================================================

export { PhoneApp } from "./ui";
export { DynamicIslandCall } from "./widgets/DynamicIsland";
export { IncomingCallBanner } from "./widgets/IncomingCallBanner";

// =============================================================================
// PLUGIN
// =============================================================================

export {
    DeviceCallsPlugin,
    registerCallsPlugin,
    type DeviceCallsPluginContract,
} from "./plugin";

// =============================================================================
// LEGACY EXPORTS (Backward Compatibility)
// =============================================================================

// Re-export for apps that still use old names
export { callReducer as phoneReducer } from "./reducer";

// =============================================================================
// AUTO-REGISTRATION
// =============================================================================

import { registerCallsPlugin } from "./plugin";
registerCallsPlugin();
