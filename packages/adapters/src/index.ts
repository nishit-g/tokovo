/**
 * @tokovo/adapters
 * 
 * Timeline IR → Runtime Events transformation.
 * 
 * Usage:
 * ```ts
 * import { adapterRegistry } from "@tokovo/adapters";
 * 
 * const runtimeEvents = adapterRegistry.lowerAll(timelineIR);
 * ```
 */

export * from "./adapter";
export { WhatsAppAdapter } from "./whatsapp";
export { adapterRegistry } from "./registry";
