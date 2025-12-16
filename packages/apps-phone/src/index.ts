/**
 * @tokovo/apps-phone
 * 
 * Phone Call Simulation Package
 * 
 * Features:
 * - Incoming call screens (iOS/Android variants)
 * - Active call screens with controls
 * - Dynamic Island widget (iOS)
 * - Notification banner (overlay mode)
 * - Platform-specific UI (iOS 16, 17, Android Pixel, Samsung)
 */

// Export plugin
export { PhonePlugin, registerPhonePlugin } from "./plugin";

// Export UI
export { PhoneApp } from "./ui";

// Export runtime
export { phoneReducer } from "./runtime";

// Export behaviors (Semantic Camera System)
export * from "./behaviors";

// Auto-register on import
// Auto-register on import
import { registerPhonePlugin } from "./plugin";
import { AnchorRegistry } from "@tokovo/core";
import { PhoneAnchorProvider } from "./provider";

registerPhonePlugin();
AnchorRegistry.register(PhoneAnchorProvider);

import { AppRegistry, APP_IDS } from "@tokovo/core";
import { PhoneApp } from "./ui";
AppRegistry.register(APP_IDS.PHONE, PhoneApp as any);
