/**
 * WhatsApp Group Operation Types
 * 
 * Type definitions for WhatsApp group-specific CustomOp payloads.
 * These provide type safety for the reducer while using the
 * generic CustomOpSchema from @tokovo/ir at runtime.
 * 
 * Architecture Note:
 * Following the Plugin Architecture principle, all app-specific
 * types are defined here, not in @tokovo/core or @tokovo/ir.
 */

// =============================================================================
// EVENT TYPE CONSTANTS
// =============================================================================

/**
 * WhatsApp-namespaced event types for CustomOp.
 * The namespace prefix ensures no collisions with other apps.
 */
export const GROUP_EVENT_TYPES = {
    MEMBER_ADDED: "whatsapp.GROUP_MEMBER_ADDED",
    MEMBER_REMOVED: "whatsapp.GROUP_MEMBER_REMOVED",
    ADMIN_CHANGED: "whatsapp.GROUP_ADMIN_CHANGED",
    INFO_UPDATED: "whatsapp.GROUP_INFO_UPDATED",
    CREATED: "whatsapp.GROUP_CREATED",
} as const;

export type GroupEventType = typeof GROUP_EVENT_TYPES[keyof typeof GROUP_EVENT_TYPES];

// =============================================================================
// PAYLOAD INTERFACES
// =============================================================================

/**
 * Member definition for group operations.
 */
export interface GroupMemberDef {
    id: string;
    name: string;
    avatar?: string;
    phone?: string;
}

/**
 * Payload for GROUP_MEMBER_ADDED event.
 */
export interface GroupMemberAddPayload {
    conversationId: string;
    member: GroupMemberDef;
    addedBy: string;
}

/**
 * Payload for GROUP_MEMBER_REMOVED event.
 */
export interface GroupMemberRemovePayload {
    conversationId: string;
    memberId: string;
    memberName: string;
    removedBy: string;
}

/**
 * Payload for GROUP_ADMIN_CHANGED event.
 */
export interface GroupAdminChangePayload {
    conversationId: string;
    memberId: string;
    memberName?: string;
    action: "promote" | "demote";
    changedBy: string;
}

/**
 * Payload for GROUP_INFO_UPDATED event.
 */
export interface GroupInfoUpdatePayload {
    conversationId: string;
    field: "name" | "avatar" | "description";
    oldValue?: string;
    newValue: string;
    changedBy: string;
}

/**
 * Payload for GROUP_CREATED event.
 */
export interface GroupCreatedPayload {
    conversationId: string;
    groupName: string;
    groupAvatar?: string;
    members: GroupMemberDef[];
    createdBy: string;
}

// =============================================================================
// TYPE GUARDS
// =============================================================================

/**
 * Check if an event is a WhatsApp group event.
 */
export function isWhatsAppGroupEvent(eventType: string): boolean {
    return eventType.startsWith("whatsapp.GROUP_");
}

/**
 * Check if payload is GroupMemberAddPayload.
 */
export function isGroupMemberAddPayload(
    eventType: string,
    payload: unknown
): payload is GroupMemberAddPayload {
    return eventType === GROUP_EVENT_TYPES.MEMBER_ADDED &&
        payload !== null &&
        typeof payload === "object" &&
        "member" in payload;
}

/**
 * Check if payload is GroupMemberRemovePayload.
 */
export function isGroupMemberRemovePayload(
    eventType: string,
    payload: unknown
): payload is GroupMemberRemovePayload {
    return eventType === GROUP_EVENT_TYPES.MEMBER_REMOVED &&
        payload !== null &&
        typeof payload === "object" &&
        "memberId" in payload;
}

/**
 * Check if payload is GroupAdminChangePayload.
 */
export function isGroupAdminChangePayload(
    eventType: string,
    payload: unknown
): payload is GroupAdminChangePayload {
    return eventType === GROUP_EVENT_TYPES.ADMIN_CHANGED &&
        payload !== null &&
        typeof payload === "object" &&
        "action" in payload;
}
