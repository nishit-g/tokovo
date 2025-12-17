/**
 * WhatsApp Package - Main Exports
 * 
 * This is the public API for the WhatsApp plugin.
 */

// === ENTERPRISE PLUGIN (Primary Export) ===
export { WhatsAppPluginV2 as WhatsAppPlugin, WhatsAppPluginV2, registerWhatsAppPlugin } from "./plugin";
export type { WhatsAppDslApi } from "./plugin";

// === Core Exports ===
export * from "./types";
export * from "./logic/reducer";
export * from "./ui";

// === Adapters ===
export * from "./adapters/anchors";
export * from "./adapters/notifications";

// === Layout ===
export * from "./layout";

// === Module Augmentation ===
export * from "./augment";

// === UI Strategy ===
export * from "./ui/ui-strategy";
export * from "./ui/strategies";

// === Audio Rules ===
export { whatsappAudioRules } from "./assets/audio-rules";

// === Lowering (for compiler) ===
export { whatsappLowering } from "./lowering";

// === DSL (for b.use() pattern) ===
export { whatsappDsl } from "./dsl-extension";

// === Register on import (side effects) ===
import "./ui/strategies";
import { AutoSoundRegistry } from "@tokovo/core";
import { whatsappAudioRules } from "./assets/audio-rules";

// Auto-register audio rules when this module is imported
AutoSoundRegistry.register(whatsappAudioRules);

// === Legacy Alias ===
export { WhatsAppPluginV2 as WhatsApp } from "./plugin";

// === Default Export ===
export { default } from "./plugin";
