/**
 * Devices Plugin - Enterprise Contract
 * 
 * Self-contained plugin for device profiles, frames, and OS features.
 * 
 * @see docs/packages/devices.md
 */

// Runtime Layer
import { deviceReducer } from "./reducer";

// Registries
import { DeviceRegistry, FrameRegistry, StatusBarStrategyRegistry } from "./registries";

// Views
import { StatusBar } from "./StatusBar";

// Strategies
import { IOSStatusBarStrategy, AndroidStatusBarStrategy } from "./strategies";

// DSL
import { DeviceTrackBuilder } from "./dsl";

// Lowering
import { deviceV2Lowering } from "./lowering";

// Profiles
import { iPhone16Profile } from "./iphone16/profile";
import { iPhone16Frame } from "./iphone16/Frame";
import { PixelProfile } from "./pixel/profile";
import { PixelFrame } from "./pixel/Frame";

// =============================================================================
// PLUGIN CONTRACT
// =============================================================================

export interface DevicesPluginContract {
    id: "devices";
    version: string;
    displayName: string;

    // Runtime
    reducer: typeof deviceReducer;

    // Registries
    DeviceRegistry: typeof DeviceRegistry;
    FrameRegistry: typeof FrameRegistry;
    StatusBarStrategyRegistry: typeof StatusBarStrategyRegistry;

    // Views
    StatusBar: typeof StatusBar;

    // Strategies
    IOSStatusBarStrategy: typeof IOSStatusBarStrategy;
    AndroidStatusBarStrategy: typeof AndroidStatusBarStrategy;

    // DSL
    TrackBuilder: typeof DeviceTrackBuilder;

    // Lowering
    v2Lowering: typeof deviceV2Lowering;
}

export const DevicesPlugin: DevicesPluginContract = {
    // Identity
    id: "devices",
    version: "2.0.0",
    displayName: "Device Profiles & OS Features",

    // Runtime
    reducer: deviceReducer,

    // Registries
    DeviceRegistry,
    FrameRegistry,
    StatusBarStrategyRegistry,

    // Views
    StatusBar,

    // Strategies
    IOSStatusBarStrategy,
    AndroidStatusBarStrategy,

    // DSL
    TrackBuilder: DeviceTrackBuilder,

    // Lowering
    v2Lowering: deviceV2Lowering,
};

// =============================================================================
// AUTO-REGISTRATION
// =============================================================================

let registered = false;

export function registerDevicesPlugin(): void {
    if (registered) return;
    registered = true;

    // Register default device profiles
    DeviceRegistry.register("iphone16", iPhone16Profile);
    DeviceRegistry.register("pixel", PixelProfile);
    DeviceRegistry.register("pixel9", PixelProfile);

    // Register default frames
    FrameRegistry.register("iphone16", iPhone16Frame);
    FrameRegistry.register("pixel", PixelFrame);
    FrameRegistry.register("pixel9", PixelFrame);

    // Register default StatusBar strategies
    StatusBarStrategyRegistry.register("ios", IOSStatusBarStrategy);
    StatusBarStrategyRegistry.register("android", AndroidStatusBarStrategy);

    console.warn("[DevicesPlugin] Registered");
}

export default DevicesPlugin;
