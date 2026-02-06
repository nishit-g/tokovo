/**
 * Devices Plugin - Enterprise Contract
 * 
 * Self-contained plugin for device profiles, frames, and OS features.
 * 
 * @see docs/packages/devices.md
 */

// Runtime Layer
import { deviceReducer } from "./reducer.js";

// Local interface for the registries we need (TokovoRegistries is not exported from core)
interface TokovoRegistries {
    engine: {
        reducers: {
            registerDeviceReducer: (reducer: typeof deviceReducer) => void;
        };
    };
    plugins: {
        sounds: any; // eslint-disable-line @typescript-eslint/no-explicit-any
    };
}

// Registries
import type { DeviceRegistries } from "./registries/bundle.js";
import {
    createDeviceRegistries,
    createDeviceRegistry,
    createFrameRegistry,
    createStatusBarStrategyRegistry,
    DeviceRegistryClass,
    FrameRegistryClass,
    StatusBarStrategyRegistryClass,
} from "./registries/index.js";
import { createDeviceShellRegistry, DeviceShellRegistryClass } from "./registry.js";

// Views
import { StatusBar } from "./StatusBar.js";

// Strategies
import { IOSStatusBarStrategy, AndroidStatusBarStrategy } from "./strategies/index.js";

// DSL
import { DeviceTrackBuilder } from "./dsl/index.js";

// Lowering
import { deviceV2Lowering } from "./lowering/index.js";

// Profiles
import { iPhone16Profile } from "./iphone16/profile.js";
import { iPhone16Frame } from "./iphone16/Frame.js";
import { PixelProfile } from "./pixel/profile.js";
import { PixelFrame } from "./pixel/Frame.js";

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
    createDeviceRegistries: typeof createDeviceRegistries;
    createDeviceRegistry: typeof createDeviceRegistry;
    createFrameRegistry: typeof createFrameRegistry;
    createStatusBarStrategyRegistry: typeof createStatusBarStrategyRegistry;
    createDeviceShellRegistry: typeof createDeviceShellRegistry;
    DeviceRegistryClass: typeof DeviceRegistryClass;
    FrameRegistryClass: typeof FrameRegistryClass;
    StatusBarStrategyRegistryClass: typeof StatusBarStrategyRegistryClass;
    DeviceShellRegistryClass: typeof DeviceShellRegistryClass;

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
    createDeviceRegistries,
    createDeviceRegistry,
    createFrameRegistry,
    createStatusBarStrategyRegistry,
    createDeviceShellRegistry,
    DeviceRegistryClass,
    FrameRegistryClass,
    StatusBarStrategyRegistryClass,
    DeviceShellRegistryClass,

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

const registeredEngines = new WeakSet<TokovoRegistries["engine"]>();
const registeredDeviceRegistries = new WeakSet<DeviceRegistries>();

export function registerDevicesPlugin(
    tokovoRegistries: TokovoRegistries,
    deviceRegistries: DeviceRegistries,
): void {
    if (!registeredEngines.has(tokovoRegistries.engine)) {
        registeredEngines.add(tokovoRegistries.engine);
        tokovoRegistries.engine.reducers.registerDeviceReducer(deviceReducer);
    }

    if (registeredDeviceRegistries.has(deviceRegistries)) return;
    registeredDeviceRegistries.add(deviceRegistries);

    // Register default device profiles
    if (!deviceRegistries.devices.has("iphone16")) {
        deviceRegistries.devices.register("iphone16", iPhone16Profile, {
            soundRegistry: tokovoRegistries.plugins.sounds,
        });
    }
    if (!deviceRegistries.devices.has("pixel")) {
        deviceRegistries.devices.register("pixel", PixelProfile, {
            soundRegistry: tokovoRegistries.plugins.sounds,
        });
    }
    if (!deviceRegistries.devices.has("pixel9")) {
        deviceRegistries.devices.register("pixel9", PixelProfile, {
            soundRegistry: tokovoRegistries.plugins.sounds,
        });
    }

    // Register default frames
    deviceRegistries.frames.register("iphone16", iPhone16Frame);
    deviceRegistries.frames.register("pixel", PixelFrame);
    deviceRegistries.frames.register("pixel9", PixelFrame);

    // Register default StatusBar strategies
    deviceRegistries.statusBars.register("ios", IOSStatusBarStrategy);
    deviceRegistries.statusBars.register("android", AndroidStatusBarStrategy);

    // Register default shell
    deviceRegistries.shells.register({
        id: "iphone16",
        FrameComponent: iPhone16Frame,
        StatusBarComponent: StatusBar,
        cornerRadius: iPhone16Profile.screen.cornerRadius,
        hasDynamicIsland: true,
    });

    console.warn("[DevicesPlugin] Registered");
}

export default DevicesPlugin;
