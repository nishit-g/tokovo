/**
 * WhatsApp IR Layer - Barrel Export
 * 
 * Intermediate Representation types and utilities:
 * - Payloads: Discriminated union payloads
 * - Track Event: WhatsApp-specific track event type
 * - Group Ops: Group operation types
 * - Type Guards: Runtime type narrowing
 */

// Payloads
export type { WhatsAppPayloads } from "./payloads.js";
export { isWhatsAppEvent as isWhatsAppPayloadEvent } from "./payloads.js";

// Track Event
export type { WhatsAppTrackEvent } from "./track-event.js";

// Group Operations
export {
    GROUP_EVENT_TYPES,
    type GroupEventType,
    type GroupMemberDef,
    type GroupMemberAddPayload,
    type GroupMemberRemovePayload,
    type GroupAdminChangePayload,
    type GroupInfoUpdatePayload,
    type GroupCreatedPayload,
    isWhatsAppGroupEvent,
} from "./group-ops.js";

// Type Guards
export {
    isWhatsAppEvent,
    isMessageReceived,
    isMessageSent,
    isTypingStart,
    isTypingEnd,
    isGroupMemberAddPayload,
    isGroupMemberRemovePayload,
    isGroupAdminChangePayload,
} from "./type-guards.js";
