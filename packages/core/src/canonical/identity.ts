/**
 * Canonical Identity Model
 *
 * ActorRef provides a stable identity model that works across:
 * - Multiple devices (each with their own "me")
 * - Group chats (where "me" has userId + displayName)
 * - Cross-app personas (reuse the same actor across WhatsApp, Instagram, etc.)
 *
 * DESIGN DECISION:
 * - Events carry `fromId: ActorId` (lightweight, good for hashing)
 * - ActorRegistry holds full `ActorRef` objects (for rendering)
 * - Reducers resolve ActorId → ActorRef at runtime
 *
 * @module @tokovo/core/canonical/identity
 */

// =============================================================================
// ACTOR ID
// =============================================================================

/**
 * Stable actor identifier.
 *
 * Format examples:
 * - "actor_alex" (custom actor)
 * - "device_phone_owner" (device owner/"me")
 * - "actor_system" (system messages)
 *
 * RULE: ActorIds are stable across renders. Same DSL → same ActorIds.
 */
export type ActorId = string;

/**
 * Special actor ID for the device owner.
 */
export const ACTOR_ME = "actor_me";

/**
 * Special actor ID for system messages.
 */
export const ACTOR_SYSTEM = "actor_system";

// =============================================================================
// ACTOR REF
// =============================================================================

/**
 * Verification badge types (for Twitter/Instagram/etc).
 */
export type VerificationBadge = "blue" | "gold" | "grey" | false;

/**
 * Full actor reference with display information.
 *
 * This is stored in the ActorRegistry, not in every event.
 */
export interface ActorRef {
    /** Stable ID for identity matching */
    readonly id: ActorId;

    /** Display name for rendering */
    readonly displayName: string;

    /** Handle/username (optional, for Twitter/Instagram) */
    readonly handle?: string;

    /** Avatar URL */
    readonly avatarUrl?: string;

    /** Phone number (for WhatsApp contacts) */
    readonly phone?: string;

    /** Verification badge */
    readonly verified?: VerificationBadge;

    /** Whether this actor is currently online */
    readonly isOnline?: boolean;

    /** Last seen timestamp */
    readonly lastSeen?: string;

    /** Bio/status text */
    readonly bio?: string;

    /** Custom metadata for app-specific needs */
    readonly meta?: Record<string, unknown>;
}

// =============================================================================
// ACTOR REGISTRY
// =============================================================================

/**
 * Actor registry interface.
 *
 * Stores all actors in an episode for efficient lookup.
 */
export interface ActorRegistry {
    /** Register an actor */
    register(actor: ActorRef): void;

    /** Register multiple actors */
    registerAll(actors: ReadonlyArray<ActorRef>): void;

    /** Get actor by ID */
    get(id: ActorId): ActorRef | undefined;

    /** Check if actor exists */
    has(id: ActorId): boolean;

    /** Get "me" for a specific device */
    getMe(deviceId: string): ActorRef;

    /** Set "me" for a specific device */
    setMe(deviceId: string, actor: ActorRef): void;

    /** Get system actor */
    getSystem(): ActorRef;

    /** Get all registered actors */
    all(): ReadonlyArray<ActorRef>;

    /** Get count of registered actors */
    size(): number;

    /** Convert to array for serialization */
    toArray(): ReadonlyArray<ActorRef>;
}

/**
 * Create an actor registry for an episode.
 *
 * @example
 * ```ts
 * const actors = createActorRegistry();
 * actors.register({ id: "actor_alex", displayName: "Alex ❤️" });
 * actors.setMe("phone", { id: "actor_me", displayName: "Me" });
 *
 * const alex = actors.get("actor_alex");
 * const me = actors.getMe("phone");
 * ```
 */
export function createActorRegistry(): ActorRegistry {
    const actors = new Map<ActorId, ActorRef>();
    const deviceOwners = new Map<string, ActorRef>();

    // Pre-register system actor
    const systemActor: ActorRef = {
        id: ACTOR_SYSTEM,
        displayName: "System",
    };
    actors.set(ACTOR_SYSTEM, systemActor);

    return {
        register(actor) {
            actors.set(actor.id, actor);
        },

        registerAll(actorList) {
            for (const actor of actorList) {
                actors.set(actor.id, actor);
            }
        },

        get(id) {
            return actors.get(id);
        },

        has(id) {
            return actors.has(id);
        },

        getMe(deviceId) {
            let owner = deviceOwners.get(deviceId);
            if (!owner) {
                // Create default "me" for this device
                owner = {
                    id: `device_${deviceId}_owner`,
                    displayName: "Me",
                };
                deviceOwners.set(deviceId, owner);
                actors.set(owner.id, owner);
            }
            return owner;
        },

        setMe(deviceId, actor) {
            deviceOwners.set(deviceId, actor);
            actors.set(actor.id, actor);
        },

        getSystem() {
            return systemActor;
        },

        all() {
            return Array.from(actors.values());
        },

        size() {
            return actors.size;
        },

        toArray() {
            return Array.from(actors.values());
        },
    };
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Create an actor ref with minimal required fields.
 */
export function actor(id: string, displayName: string, options?: Partial<Omit<ActorRef, "id" | "displayName">>): ActorRef {
    return {
        id: id.startsWith("actor_") ? id : `actor_${id}`,
        displayName,
        ...options,
    };
}

/**
 * Check if an actor ID represents "me" (the device owner).
 */
export function isMe(actorId: ActorId): boolean {
    return actorId === ACTOR_ME || actorId.startsWith("device_") && actorId.endsWith("_owner");
}

/**
 * Check if an actor ID represents a system message.
 */
export function isSystem(actorId: ActorId): boolean {
    return actorId === ACTOR_SYSTEM;
}

/**
 * Get a display name for an actor, with fallback to ID.
 */
export function getDisplayName(actor: ActorRef | undefined, fallbackId: ActorId): string {
    if (actor) {
        return actor.displayName;
    }
    // Fallback: clean up the ID for display
    if (fallbackId.startsWith("actor_")) {
        return fallbackId.slice(6);
    }
    return fallbackId;
}

/**
 * Generate a deterministic actor ID from a name.
 * Used when DSL doesn't provide an explicit ID.
 */
export function generateActorId(name: string): ActorId {
    // Normalize: lowercase, replace spaces with underscores, remove special chars
    const normalized = name
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/[^a-z0-9_]/g, "");
    return `actor_${normalized}`;
}
