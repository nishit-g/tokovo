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
export type { WhatsAppPayloads } from "./payloads";
export { isWhatsAppEvent as isWhatsAppPayloadEvent } from "./payloads";

// Track Event
export type { WhatsAppTrackEvent } from "./track-event";

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
} from "./group-ops";

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
} from "./type-guards";
