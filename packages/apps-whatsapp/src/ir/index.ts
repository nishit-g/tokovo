/**
 * WhatsApp IR Layer - Barrel Export
 * 
 * Intermediate Representation types and utilities:
 * - Payloads: Discriminated union payloads
 * - Track event and payload registry augmentation
 */

// Payloads
export type { WhatsAppPayloads } from "./payloads.js";
export type { WhatsAppTrackEvent } from "../types/events.js";
export { isWhatsAppEvent } from "../types/events.js";
