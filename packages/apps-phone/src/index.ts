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
export { PhonePlugin, PhonePluginCanonical, registerPhonePlugin, PHONE_APP_ID } from "./plugin";

// Export UI
export { PhoneApp } from "./ui";

// Export runtime
export { phoneReducer } from "./runtime";

// Auto-register on import
import { registerPhonePlugin } from "./plugin";
registerPhonePlugin();
