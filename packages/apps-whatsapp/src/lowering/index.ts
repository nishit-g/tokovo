/**
 * WhatsApp Lowering Layer - Barrel Export
 * 
 * Compile-time transformation from DSL/IR to runtime events.
 * 
 * @default Exports V2 lowering (recommended)
 */

// V2 Lowering (Current - USE THIS)
export { whatsappV2Lowering, whatsappV2Lowering as whatsappLowering } from "./v2/handler";
export type { V2LoweringHandler } from "./v2/handler";

// Legacy Lowering (Deprecated - DO NOT USE)
// TODO: Delete after all episodes migrated to V2 track DSL
export { whatsappLowering as whatsappLegacyLowering } from "./legacy/handler";
